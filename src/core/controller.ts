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
 * Handles events by appended Handler and Controller.
 */
export class Controller<T extends Controller<T>> extends Emitter<T> {
    private _enabled = true;
    private eventHandlers: Array<Controller<any> | Handler<any>> = [];

    /** 
     * Handles events by appended Handler and Controller.
     * @param name of Controller, concatinated with classes.
     * @param classes optional prefixes of Controller name.
     */
    constructor(name: string, ...classes: string[]) {
        super([name].concat(classes).join("/"));
    }

    /**
     * Calls this.get() with init event.
     * @returns true when parent is initialized.
     * @returns false when parent is not initialized.
     * @returns false when parent is unset.
     */
    public get initialized(): boolean { return this.get(EVENT_INIT, false); }

    /**
     * Calls this.get() with debug event.
     * @returns true when parent is in debug mode.
     * @returns false when parent is not in debug mode.
     * @returns false when parent is unset.
     */
    public get debug(): boolean { return this.get(EVENT_DEBUG, false); }

    /**
     * Calls this.set() with debug event.
     * Changes parents debug mode.
     */
    public set debug(value) { this.set(EVENT_DEBUG, value); }

    /** 
     * Default is true.
     * @returns false when Controller is disabled.
     * @returns true when parent is enabled.
     * @returns false when parent is disabled.
     * @returns true when Controller is enabled and parent is unset.
     */
    public get enabled(): boolean {
        if (!this._enabled)
            return false;

        if (this.parent)
            return this.parent.enabled;

        return true;
    }

    /**
     * Calls this.emit() with enabled changed event when parent is enabled.
     * Calls this.emit() with enabled changed event when parent is unset.
     * Skips calling this.emit() when parent is disabled.
     * Calls this.onEnabled() on true when parent is enabled.
     * Calls this.onEnabled() on true when parent is unset.
     * Skips calling this.onEnabled() when parent is disabled.
     * Calls this.onDisabled() on false when parent is enabled.
     * Calls this.onDisabled() on false when parent is unset.
     * Skips calling this.onDisabled() when parent is disabled.
     * Skips all handling when value does not change current enabled state to avoid duplicate emits.
     */
    public set enabled(value) {
        if (this._enabled == value)
            return;

        // emit before disabling
        // because emit catches on disabled
        // handlers will be emitted after changing enabled
        // because emit useses promise to delay event handling
        if (!value && this.enabled)
            this.emit(EVENT_ENABLED_CHANGED);

        this._enabled = value;

        // emit after enabling
        // because emit catches on disabled
        if (value && this.enabled)
            this.emit(EVENT_ENABLED_CHANGED);

        if (!this.parent || this.parent.enabled)
            if (value)
                this.onEnabled();
            else
                this.onDisabled();
    }

    /**
     * Calls parent.has().
     * @returns true if value is set in parent.
     * @returns false if value is unset in parent.
     * @returns false if parent is not set.
     */
    public has(key: string): boolean {
        if (this.parent)
            return this.parent.has(key);

        return false;
    }

    /**
     * Calls parent.get().
     * @returns the value of parent.
     * @returns _default if parent is not set.
     */
    public get<T>(key: string, _default?: T): T {
        if (this.parent)
            return this.parent.get(key, _default);

        return _default;
    }

    /**
     * Calls parent.set().
     * Catches unset parent.
     */
    public set(key: string, value: any): void {
        if (this.parent)
            this.parent.set(key, value);
    }

    /**
     * Appends Controller and Handler for event handling.
     * It`s recommended to call super.append().
     */
    public append(child: Module<Module<T>>): void {
        super.append(child);

        if (child instanceof Controller)
            this.eventHandlers.push(child);
        else if (child instanceof Handler)
            this.eventHandlers.push(child);
    }

    /**
     * Depends Controller and Handler of event handling.
     * It`s recommended to call super.depend().
     */
    public depend(child: Module<Module<T>>): void {
        super.depend(child);

        const handlerIndex = this.eventHandlers.indexOf(child as any);

        if (-1 != handlerIndex)
            this.eventHandlers.splice(handlerIndex, 1);
    }

    /**
     * Appends an Action by this.append().
     * Throws an Error on init event handlers because init event handlers should be appended by once().
     */
    public on(event: string | ActionConfig | ActionCallback, callback?: ActionCallback): void {
        const action = new Action(event, callback);

        if (action.name == EVENT_INIT)
            throw new Error('use once for init event');

        this.append(action);
    }

    /**
     * Appends an Action that is called once by this.append().
     * Ignores init event handlers when Controller is aleready initialized.
     */
    public once(event: string | ActionConfig | ActionCallback, callback?: ActionCallback): void {
        let action: Action;

        if (typeof event == "string")
            action = new Action({ event, callback, once: true });
        else if (event instanceof Function)
            action = new Action({ callback: event, once: true });
        else
            action = new Action(Object.assign(event, { once: true }));

        if (event == EVENT_INIT && this.initialized)
            return;

        this.append(action);
    }

    /**
     * Depends all event handlers with specific event name.
     * Depends all event handlers if event argument is not given.
     * Calls this.depend().
     * Ignores appended Controller.
     */
    public off(event?: string): void {
        for (let i = this.eventHandlers.length - 1; i >= 0; --i) {
            const handler = this.eventHandlers[i];

            if (!(handler instanceof Handler))
                continue;

            if (event != undefined && event != handler.name)
                continue;

            this.depend(handler);
        }
    }

    /**
     * If parent is set, calls parent.emit().
     * If parent is not set, handles emitted event by all appended Handler and Controller.
     * Throws an Error if enabled is false.
     * Calls event.retain() before handling by appended Handler and Controller.
     * Calls event.release() after handling is done.
     * @returns handled Event
     */
    public emit(event: Event | string, args?: NodeJS.ReadOnlyDict<any>, emitter: string = this.name, timestamp?: number): Event {
        if (!this._enabled)
            throw new Error('controller is disabled');

        if (this.parent)
            return this.parent.emit(event, args, emitter, timestamp);

        const instance = typeof event == "string"
            ? new Event(event, emitter, args, timestamp)
            : event;

        instance.retain();

        Promise.resolve()
            .then(() => this.handleEvent(instance))
            .then(() => instance.release());

        return instance;
    }

    /** 
     * It`s recommended to call super.toJSON().
     * @returns enabled state in Object.
     * @returns eventHandlers as Object indexed by name in Object.
     */
    public toJSON(): NodeJS.Dict<any> {
        const data = super.toJSON();

        data.enabled = this._enabled;

        data.eventHandlers = {};
        this.eventHandlers.forEach(handler => data.eventHandlers[handler.name] = handler.toJSON());

        return data;
    }

    /** 
     * Parses enabled state if set.
     * Parses eventHandlers if set.
     * It`s recommended to call super.fromJSON().
     */
    public fromJSON(data: NodeJS.ReadOnlyDict<any>): void {
        super.fromJSON(data);

        if (data.enabled != undefined)
            this.enabled = data.enabled;

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
     * Calls onEnabled() on all appended Handler.
     * Calls onEnabled() on all appended and enabled Controller.
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
     * Calls onDisabled() on all appended Handler.
     * Calls onDisabled() on all appended and enabled Controller.
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
     * Calls handleEvent() on all appended Handler and Controller.
     * Skips when enabled is false.
     */
    private handleEvent(event: Event) {
        if (!this._enabled)
            return;

        this.eventHandlers.forEach((handler: any) => handler.handleEvent(event));
    }
}