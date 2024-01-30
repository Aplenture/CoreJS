/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Action, ActionConfig } from "../event/action";
import { Handler as EventHandler } from "../event/handler";
import { EVENT_ACTIVE_CHANGED } from "../constants";
import { Emitter } from "./emitter";
import { Handler as CoreHandler } from "./handler";
import { Module } from "./module";
import { Event } from "../event/event";

type Execute = (event: Event) => Promise<void>;

export class Controller<T extends Controller<T>> extends CoreHandler<T> {
    private _active = true;
    private eventHandlers: Array<EventHandler<any>> = [];

    constructor(name: string, ...classes: string[]) {
        super([name].concat(classes).join("/"));
    }

    /**
     * returns active status of himself and all parents
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

    public append(child: Module<Module<T>>): void {
        super.append(child);

        if (child instanceof Controller)
            this.eventHandlers.push(child as any);

        if (child instanceof EventHandler)
            this.eventHandlers.push(child);
    }

    public depend(child: Module<Module<T>>): void {
        const index = this.eventHandlers.indexOf(child as any);

        super.depend(child);

        if (-1 == index)
            return;

        this.eventHandlers.splice(index, 1);
    }

    public on(event: string | ActionConfig | Execute, callback?: Execute) {
        if (typeof event == "string")
            this.append(new Action({ event, callback }));
        else if (event instanceof Function)
            this.append(new Action({ callback: event }));
        else
            this.append(new Action(event));
    }

    public once(event: string | ActionConfig | Execute, callback?: Execute) {
        if (typeof event == "string")
            this.append(new Action({ event, callback, once: true }));
        else if (event instanceof Function)
            this.append(new Action({ callback: event, once: true }));
        else
            this.append(new Action(Object.assign(event, { once: true })));
    }

    public off(event?: string | Emitter, emitter?: Emitter) {
        this.eventHandlers.forEach(handler => {
            if (!(handler instanceof EventHandler))
                return;

            if (event != undefined && typeof event == "string" && event != handler.name)
                return;

            if (event != undefined && event instanceof Emitter && event != handler.emitter)
                return;

            if (emitter != undefined && emitter != handler.emitter)
                return;

            this.depend(handler);
        });
    }

    public emit(event: string, args: NodeJS.ReadOnlyDict<any> = this, emitter: Emitter = this): Event {
        if (!this._active)
            throw new Error('inactive controller can not emit');

        if (this.parent)
            return this.parent.emit(event, args, emitter);

        const instance = new Event(event, args, emitter);

        this.handleEvent(instance);

        return instance;
    }

    private handleEvent(event: Event) {
        if (!this._active)
            return;

        this.eventHandlers.forEach(handler => handler.handleEvent(event));
    }
}