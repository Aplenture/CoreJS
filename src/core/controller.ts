/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Action, ActionCallback, ActionConfig } from "./action";
import { Handler } from "./handler";
import { EVENT_ACTIVE_CHANGED } from "../constants";
import { Module } from "./module";
import { Event } from "./event";

interface OffOptions {
    readonly event?: string;
    readonly emitter?: string;
}

/** 
 * Appends other event handlers to propagate events to them.
 */
export class Controller<T extends Controller<T>> extends Module<T> {
    private _active = true;
    private eventHandlers: Array<Handler<any>> = [];

    constructor(name: string, ...classes: string[]) {
        super([name].concat(classes).join("/"));
    }

    /** 
     * Returns active status of himself and all parents.
     * Enables/disables event handling.
     */
    public get active(): boolean {
        if (!this._active)
            return false;

        if (this.parent)
            return this.parent.active;

        return true;
    }

    public set active(value) {
        // skip no changes
        // to avoid useless emits
        if (this._active == value)
            return;

        this._active = value;

        // emit changes
        this.emit(EVENT_ACTIVE_CHANGED);
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
     * Controller and EventHandlers will be added to sub event handlers.
     * @param child
     */
    public append(child: Module<Module<T>>): void {
        super.append(child);

        // add Controller to sub handlers
        if (child instanceof Controller)
            this.eventHandlers.push(child as any);

        // add EventHandler to sub handlers
        if (child instanceof Handler)
            this.eventHandlers.push(child);
    }

    /**
     * Removes the parent if its a child from this.
     * Controller and EventHandlers will be removed from sub event handlers.
     * @param child
     */
    public depend(child: Module<Module<T>>): void {
        // find index from child in sub event handlers
        const index = this.eventHandlers.indexOf(child as any);

        super.depend(child);

        // remove child from sub event handlers
        if (-1 != index)
            this.eventHandlers.splice(index, 1);
    }

    /**
     * Creates an ActionHandler.
     * Calls append() to append the created handler.
     * @param event name, config or callback from ActionHandler
     * @param callback from ActionHandler, not needed if event is callback already
     */
    public on(event: string | ActionConfig | ActionCallback, callback?: ActionCallback) {
        this.append(new Action(event, callback));
    }

    /**
     * Creates an ActionHandler which is called only once.
     * Calls append() to append the created handler.
     * @param event name, config or callback from ActionHandler
     * @param callback from ActionHandler, not needed if event is callback already
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
     * Otherwise event is propagated to sub event handlers.
     * Catches calls on inactive Controller.
     * @param event name of event
     * @param args of event
     * @param emitter of event
     * @returns Event
     */
    public emit(event: string, args: NodeJS.ReadOnlyDict<any> = this, emitter: string = this.name, timestamp?: number): Event {
        // inactive Controllers may not propagate events
        // except the deactivation event
        if (!this._active && (event != EVENT_ACTIVE_CHANGED || args != this))
            throw new Error('inactive controller can not emit');

        // propagate to parent if set
        if (this.parent)
            return this.parent.emit(event, args, emitter, timestamp);

        // otherwise propagate event to sub event handlers
        const instance = new Event(event, args, emitter, timestamp);

        // retain event until event handling
        instance.retain();

        Promise.resolve()
            // delay event handling until emitter received event
            .then(() => this.handleEvent(instance))
            // release event after event handling
            .then(() => instance.release());

        return instance;
    }

    /**
     * Propagates an event to all sub event handlers.
     * @param event to propagate
     */
    private handleEvent(event: Event) {
        // skip if inactive
        // except the deactivation event
        if (!this._active && (event.name != EVENT_ACTIVE_CHANGED || event.args != this))
            return;

        // propagate event to all sub event handlers
        this.eventHandlers.forEach(handler => handler.handleEvent(event));
    }
}