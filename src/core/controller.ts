/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Action, ActionCallback, ActionConfig } from "./action";
import { Handler, HandlerState } from "./handler";
import { EVENT_ENABLED_CHANGED } from "../constants";
import { Module } from "./module";
import { Event } from "./event";

interface OffOptions {
    readonly event?: string;
    readonly emitter?: string;
}

/** 
 * Appends other handlers to propagate events to them.
 */
export class Controller<T extends Controller<T>> extends Module<T> {
    private _enabled = true;
    private eventHandlers: Array<Handler<any>> = [];
    private eventControllers: Array<Controller<any>> = [];

    constructor(name: string, ...classes: string[]) {
        super([name].concat(classes).join("/"));
    }

    /** 
     * Enabled status of himself and all parents.
     * Enables/disables event handling.
     */
    public get enabled(): boolean {
        if (!this._enabled)
            return false;

        if (this.parent)
            return this.parent.enabled;

        return true;
    }

    public set enabled(value) {
        // skip no changes
        // to avoid useless emits
        if (this._enabled == value)
            return;

        // emit before disabling
        // because emit catches on disabled
        // handlers will be emitted after changing enabled
        // because emit useses promise to delay event handling
        if (!value)
            this.emit(EVENT_ENABLED_CHANGED);

        this._enabled = value;

        // emit after enabling
        // because emit catches on disabled
        if (value)
            this.emit(EVENT_ENABLED_CHANGED);

        // call onEnabled() / onDisabled()
        // only when parent is enabled or not set
        if (!this.parent || this.parent.enabled)
            if (value)
                this.onEnabled();
            else
                this.onDisabled();
    }

    /**
     * Returns whether value exists.
     * @param key of the value
     */
    public has(key: string): boolean {
        if (this.parent)
            return this.parent.has(key);

        return false;
    }

    /**
     * Returns value by key from parent if parent is set.
     * Otherwise undefined is returned.
     * @param key of value to return
     * @param _default is returned when parent is not set
     * @returns value or undefined
     */
    public get<T>(key: string, _default?: T): T {
        if (this.parent)
            return this.parent.get(key, _default);

        return _default;
    }

    /**
     * Sets a value by key from parent if parent is set.
     * Otherwise nothing is done.
     * @param key of value to set
     * @param value of key to set
     */
    public set(key: string, value: any) {
        if (this.parent)
            this.parent.set(key, value);
    }

    /**
     * First calls removeFromParent().
     * Then changes the parent of a module to this.
     * Controller and EventHandlers will be added to event handlers.
     * @param child
     */
    public append(child: Module<Module<T>>): void {
        super.append(child);

        // add Controller to event handlers
        if (child instanceof Controller)
            this.eventControllers.push(child);

        // add EventHandler to event handlers
        if (child instanceof Handler)
            this.eventHandlers.push(child);
    }

    /**
     * Removes the parent if its a child from this.
     * Controller and EventHandlers will be removed from event handlers.
     * @param child
     */
    public depend(child: Module<Module<T>>): void {
        super.depend(child);

        // find index from child in event handlers
        const handlerIndex = this.eventHandlers.indexOf(child as any);

        // remove child from event handlers
        if (-1 != handlerIndex)
            this.eventHandlers.splice(handlerIndex, 1);

        // find index from child in event handlers
        const controllerIndex = this.eventControllers.indexOf(child as any);

        // remove child from event handlers
        if (-1 != controllerIndex)
            this.eventControllers.splice(controllerIndex, 1);
    }

    /**
     * Creates an Action.
     * Calls append() to append the created handler.
     * @param event name, config or callback from Action
     * @param callback from Action, not needed if event is callback already
     */
    public on(event: string | ActionConfig | ActionCallback, callback?: ActionCallback) {
        this.append(new Action(event, callback));
    }

    /**
     * Creates an Action which is called only once.
     * Calls append() to append the created handler.
     * @param event name, config or callback from Action
     * @param callback from Action, not needed if event is callback already
     */
    public once(event: string | ActionConfig | ActionCallback, callback?: ActionCallback) {
        if (typeof event == "string")
            this.append(new Action({ event, callback, once: true }));
        else if (event instanceof Function)
            this.append(new Action({ callback: event, once: true }));
        else
            this.append(new Action(Object.assign(event, { once: true })));
    }

    /**
     * Removes EventHandler.
     * Controller will be ignored.
     * Removes all EventhHandler if neither event nor emitter are given.
     * To remove the handler depend() is called.
     * @param event optional options with event and emitter names or name of all removing EventHandler
     * @param emitter optional emitter of all removing EventHandler
     */
    public off(event: OffOptions | string = {}, emitter?: string) {
        const ev = typeof event == "object" ? event.event : event;
        const em = typeof event == "object" && event.emitter !== undefined ? event.emitter : emitter;

        for (let i = this.eventHandlers.length - 1; i >= 0; --i) {
            const handler = this.eventHandlers[i];

            // skip if handler is not an EventHandler
            if (!(handler instanceof Handler))
                continue;

            // skip missmatching event name
            if (ev != undefined && ev != handler.name)
                continue;

            // skip missmatching event emitter by emitter as emitter
            if (em != undefined && em != handler.emitter)
                continue;

            this.depend(handler);
        }
    }

    /**
     * Propagates events.
     * If there is a parent, event is prpagated to it.
     * Otherwise event is propagated to event handlers.
     * Catches calls on disabled Controller.
     * @param event name of event
     * @param args of event
     * @param emitter of event
     * @returns Event
     */
    public emit(event: string, args: NodeJS.ReadOnlyDict<any> = this, emitter: string = this.name, timestamp?: number): Event {
        // disabled Controllers may not propagate events
        if (!this._enabled)
            throw new Error('controller is disabled');

        // propagate to parent if set
        if (this.parent)
            return this.parent.emit(event, args, emitter, timestamp);

        // otherwise propagate event to event handlers
        const instance = new Event(event, args, emitter, timestamp);

        // retain event until event handling
        instance.retain();

        Promise.resolve()
            // delay event handling until emitter has received the event instance
            .then(() => this.handleEvent(instance))
            // release event after the handling
            .then(() => instance.release());

        return instance;
    }

    /**
     * Called when controller is enabled.
     * It`s recommended to call super.onEnabled().
     */
    protected onEnabled() {
        // call onEnabled() on all event handlers
        this.eventHandlers.forEach(handler => handler.onEnabled());

        // call onEnabled() on all enabled sub controllers
        this.eventControllers.forEach(controller => controller._enabled && controller.onEnabled());
    }

    /**
     * Called when controller is disabled.
     * It`s recommended to call super.onDisabled().
     */
    protected onDisabled() {
        // call onDisabled() on all event handlers
        this.eventHandlers.forEach(handler => handler.onDisabled());

        // call onDisabled() on all enabled sub controllers
        this.eventControllers.forEach(controller => controller._enabled && controller.onDisabled());
    }

    /**
     * Propagates an event first to all event handlers then to all sub controllers.
     * @param event to propagate
     */
    private handleEvent(event: Event) {
        // skip if disabled
        if (!this._enabled)
            return;

        // propagate event to all event handlers where event properties are matching
        this.eventHandlers.forEach(handler => {
            // skip if name is missmatching
            if (handler.name != undefined && handler.name != event.name)
                return;

            // skip if emitter is missmatching
            if (handler.emitter != undefined && handler.emitter != event.emitter)
                return;

            // skip if handler is removing from parent
            if (handler.state == HandlerState.Removing)
                return;

            // change state to removing if once is enabled
            if (handler.state == HandlerState.Once)
                handler.state = HandlerState.Removing;

            // retain event before execution
            event.retain();

            handler.execute(event)
                // if state is removing, remove from parent after execution
                .then(() => handler.state == HandlerState.Removing && handler.removeFromParent())
                // release event after execution
                .then(() => event.release());
        });

        // propagate event to all sub controllers
        this.eventControllers.forEach(controller => controller.handleEvent(event));
    }
}