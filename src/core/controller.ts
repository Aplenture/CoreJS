/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { ActionHandler, ActionCallback, ActionConfig } from "./actionHandler";
import { EventHandler } from "./eventHandler";
import { EVENT_ACTIVE_CHANGED } from "../constants";
import { Emitter } from "./emitter";
import { Handler } from "./handler";
import { Module } from "./module";
import { Event } from "./event";

/** 
 * Appends other event handlers to propagate events to them.
 */
export class Controller<T extends Controller<T>> extends Handler<T> {
    private _active = true;
    private eventHandlers: Array<EventHandler<any>> = [];

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

        // emit before become inavitve
        if (this._active)
            this.emit(EVENT_ACTIVE_CHANGED);

        this._active = value;

        // emit after become active
        if (value)
            this.emit(EVENT_ACTIVE_CHANGED);
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
        if (child instanceof EventHandler)
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
     * Appends it by calling append().
     * @param event name, config or callback from ActionHandler
     * @param callback from ActionHandler, not needed if event is callback already
     */
    public on(event: string | ActionConfig | ActionCallback, callback?: ActionCallback) {
        this.append(new ActionHandler(event, callback));
    }

    /**
     * Creates an ActionHandler which is called only once.
     * Appends it by calling append().
     * @param event name, config or callback from ActionHandler
     * @param callback from ActionHandler, not needed if event is callback already
     */
    public once(event: string | ActionConfig | ActionCallback, callback?: ActionCallback) {
        if (typeof event == "string")
            this.append(new ActionHandler({ event, callback, once: true }));
        else if (event instanceof Function)
            this.append(new ActionHandler({ callback: event, once: true }));
        else
            this.append(new ActionHandler(Object.assign(event, { once: true })));
    }

    /**
     * Removes EventHandler.
     * Controller will be ignored.
     * Removes all EventhHandler if neither event nor emitter are given.
     * @param event optional name or Emitter of all removing EventHandler
     * @param emitter optional emitter of all removing EventHandler
     */
    public off(event?: string | Emitter, emitter?: Emitter) {
        for (let i = this.eventHandlers.length - 1; i >= 0; --i) {
            const handler = this.eventHandlers[i];

            // skip if handler is not an EventHandler
            if (!(handler instanceof EventHandler))
                continue;

            // skip missmatching event name
            if (event != undefined && typeof event == "string" && event != handler.name)
                continue;

            // skip missmatching event emitter by event as emitter
            if (event != undefined && event instanceof Emitter && event != handler.emitter)
                continue;

            // skip missmatching event emitter by emitter as emitter
            if (emitter != undefined && emitter != handler.emitter)
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
    public emit(event: string, args: NodeJS.ReadOnlyDict<any> = this, emitter: Emitter = this): Event {
        // inactive Controllers may not propagate events
        if (!this._active)
            throw new Error('inactive controller can not emit');

        // propagate to parent if set
        if (this.parent)
            return this.parent.emit(event, args, emitter);

        // otherwise propagate event to sub event handlers
        const instance = new Event(event, args, emitter);
        this.handleEvent(instance);

        return instance;
    }

    /**
     * Propagates an event to all sub event handlers.
     * @param event to propagate
     */
    private handleEvent(event: Event) {
        // skip if inactive
        if (!this._active)
            return;

        // propagate event to all sub event handlers
        this.eventHandlers.forEach(handler => handler.handleEvent(event));
    }
}