/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Action, ActionCallback, ActionConfig } from "./action";
import { Handler } from "./handler";
import { EVENT_DEBUG, EVENT_ENABLED_CHANGED, EVENT_INIT } from "../constants";
import { Module } from "./module";
import { Event } from "./event";
import { Emitter } from "./emitter";

/** 
 * Appends other handlers to propagate events to them.
 */
export class Controller<T extends Controller<T>> extends Emitter<T> {
    private _enabled = true;
    private eventHandlers: Array<Controller<any> | Handler<any>> = [];

    constructor(name: string, ...classes: string[]) {
        super([name].concat(classes).join("/"));
    }

    public get initialized() { return this.get<boolean>(EVENT_INIT); }

    public get debug() { return this.get<boolean>(EVENT_DEBUG); }
    public set debug(value) { this.set(EVENT_DEBUG, value); }

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

        // when this and parents are enabled
        // emit before disabling
        // because emit catches on disabled
        // handlers will be emitted after changing enabled
        // because emit useses promise to delay event handling
        if (!value && this.enabled)
            this.emit(EVENT_ENABLED_CHANGED);

        this._enabled = value;

        // when this and parents are enabled
        // emit after enabling
        // because emit catches on disabled
        if (value && this.enabled)
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
     * Appends child controllers and event handlers.
     * First calls removeFromParent().
     * Then changes the parent of a module to this.
     * @param child
     */
    public append(child: Module<Module<T>>): void {
        super.append(child);

        if (child instanceof Controller)
            this.eventHandlers.push(child);
        else if (child instanceof Handler)
            this.eventHandlers.push(child);
    }

    /**
     * Depends a child controller or event handler.
     * @param child
     */
    public depend(child: Module<Module<T>>): void {
        super.depend(child);

        // find index from handler
        const handlerIndex = this.eventHandlers.indexOf(child as any);

        // remove handler if appended
        if (-1 != handlerIndex)
            this.eventHandlers.splice(handlerIndex, 1);
    }

    /**
     * Creates and appends an Action.
     * @param event name, config or callback from Action
     * @param callback from Action, not needed if event is callback already
     */
    public on(event: string | ActionConfig | ActionCallback, callback?: ActionCallback) {
        if (event == EVENT_INIT)
            throw new Error('use once for init event');

        this.append(new Action(event, callback));
    }

    /**
     * Creates and appends an Action which is called only once.
     * Ignores init event handler if already init.
     * @param event name, config or callback from Action
     * @param callback from Action, not needed if event is callback already
     */
    public once(event: string | ActionConfig | ActionCallback, callback?: ActionCallback) {
        if (event == EVENT_INIT && this.initialized)
            return;

        if (typeof event == "string")
            this.append(new Action({ event, callback, once: true }));
        else if (event instanceof Function)
            this.append(new Action({ callback: event, once: true }));
        else
            this.append(new Action(Object.assign(event, { once: true })));
    }

    /**
     * Depends all matching event handlers.
     * Controllers are ignored.
     * @param event optional options with event and emitter names or name of all removing event handler
     */
    public off(event?: string) {
        for (let i = this.eventHandlers.length - 1; i >= 0; --i) {
            const handler = this.eventHandlers[i];

            // skip if handler is not an instance of Handler
            if (!(handler instanceof Handler))
                continue;

            // skip missmatching event name
            if (event != undefined && event != handler.name)
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
    public emit(event: string, args?: NodeJS.ReadOnlyDict<any>, emitter: string = this.name, timestamp?: number): Event {
        // disabled Controllers may not propagate events
        if (!this._enabled)
            throw new Error('controller is disabled');

        // propagate to parent if set
        if (this.parent)
            return this.parent.emit(event, args, emitter, timestamp);

        // otherwise propagate event to event handlers
        const instance = new Event(event, emitter, args, timestamp);

        // retain event until event handling
        instance.retain();

        Promise.resolve()
            // delay event handling until emitter has received the event instance
            .then(() => this.handleEvent(instance))
            // release event after the handling
            .then(() => instance.release());

        return instance;
    }

    public toJSON(): NodeJS.Dict<any> {
        const data = super.toJSON();

        // serialize enabled
        data.enabled = this._enabled;

        // serialize all event handlers by name
        if (this.eventHandlers.length) {
            data.eventHandlers = {};
            this.eventHandlers.forEach(handler => data.eventHandlers[handler.name] = handler.toJSON());
        }

        return data;
    }

    public fromJSON(data: NodeJS.ReadOnlyDict<any>): void {
        super.fromJSON(data);

        // deserialize enabled
        if (data.enabled != undefined)
            this.enabled = data.enabled;

        // deserialize all event handlers by name
        if (data.eventHandlers)
            this.eventHandlers.forEach(handler => data.eventHandlers[handler.name] && handler.fromJSON(data.eventHandlers[handler.name]));
    }

    /**
     * Called when parent is set.
     * Removes all init event handlers if already init.
     * It`s recommended to call super.onAppended().
     */
    protected onAppended(): void {
        super.onAppended();

        if (this.initialized)
            this.off(EVENT_INIT);
    }

    /**
     * Called when controller has been enabled.
     * Calls onEnabled() on all event handlers.
     * It`s recommended to call super.onEnabled().
     */
    protected onEnabled() {
        this.eventHandlers.forEach(handler => {
            if (handler instanceof Handler)
                handler.onEnabled();
            else if (handler._enabled)
                handler.onEnabled();
        });
    }

    /**
     * Called when controller has been disabled.
     * Calls onDisabled() on all event handlers.
     * It`s recommended to call super.onDisabled().
     */
    protected onDisabled() {
        this.eventHandlers.forEach(handler => {
            if (handler instanceof Handler)
                handler.onDisabled();
            else if (handler._enabled)
                handler.onDisabled();
        });
    }

    /**
     * Propagates an event to all event handlers.
     * Skips on disabled.
     */
    private handleEvent(event: Event) {
        if (!this._enabled)
            return;

        this.eventHandlers.forEach((handler: any) => handler.handleEvent(event));
    }
}