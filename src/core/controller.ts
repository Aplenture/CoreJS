/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Action, ActionCallback, ActionConfig } from "./action";
import { Handler } from "./handler";
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
    private _children: T[] = [];
    private eventHandlers: Handler<T>[] = [];

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

    /** All appended child controllers. */
    public get children(): readonly T[] { return this._children; }

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
    public append(child: T | Handler<T>): void {
        super.append(child);

        if (child instanceof Handler)
            this.eventHandlers.push(child);
        else
            this._children.push(child);
    }

    /**
     * Depends a child controller or event handler.
     * @param child
     */
    public depend(child: T | Handler<T>): void {
        super.depend(child);

        // find index from children
        const childIndex = this._children.indexOf(child as any);

        // remove child if appended
        if (-1 != childIndex)
            this._children.splice(childIndex, 1);

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
        this.append(new Action(event, callback));
    }

    /**
     * Creates and appends an Action which is called only once.
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
     * Depends all matching event handlers.
     * @param event optional options with event and emitter names or name of all removing event handler
     * @param emitter optional emitter of all removing event handler
     */
    public off(event: OffOptions | string = {}, emitter?: string) {
        const ev = typeof event == "object" ? event.event : event;
        const em = typeof event == "object" && event.emitter !== undefined ? event.emitter : emitter;

        for (let i = this.eventHandlers.length - 1; i >= 0; --i) {
            const handler = this.eventHandlers[i];

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

    public toJSON(): NodeJS.Dict<any> {
        const data = super.toJSON();

        // serialize enabled
        data.enabled = this._enabled;

        // serialize all children by name
        if (this._children.length) {
            data.children = {};
            this._children.forEach(child => data.children[child.name] = child.toJSON());
        }

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

        // deserialize all children by name
        if (data.children)
            this._children.forEach(child => data.children[child.name] && child.fromJSON(data.children[child.name]));

        // deserialize all event handlers by name
        if (data.eventHandlers)
            this.eventHandlers.forEach(handler => data.eventHandlers[handler.name] && handler.fromJSON(data.eventHandlers[handler.name]));
    }

    /**
     * Called when controller is enabled.
     * It`s recommended to call super.onEnabled().
     */
    protected onEnabled() {
        // call onEnabled() on all event handlers
        this.eventHandlers.forEach(handler => handler.onEnabled());

        // call onEnabled() on all enabled children
        this._children.forEach(child => child._enabled && child.onEnabled());
    }

    /**
     * Called when controller is disabled.
     * It`s recommended to call super.onDisabled().
     */
    protected onDisabled() {
        // call onDisabled() on all event handlers
        this.eventHandlers.forEach(handler => handler.onDisabled());

        // call onDisabled() on all enabled children
        this._children.forEach(child => child._enabled && child.onDisabled());
    }

    /**
     * Propagates an event first to all event handlers then to all children.
     * @param event to propagate
     */
    private handleEvent(event: Event) {
        // skip if disabled
        if (!this._enabled)
            return;

        // propagate event to all event handlers
        this.eventHandlers.forEach(handler => handler.handleEvent(event));

        // propagate event to all children
        this._children.forEach(child => child.handleEvent(event));
    }
}