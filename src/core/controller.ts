/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Action, ActionCallback } from "./action";
import { Handler } from "./handler";
import { EVENT_DEBUG, EVENT_ENABLED_CHANGED, EVENT_INIT } from "../constants";
import { Module } from "./module";
import { Event } from "./event";
import { Emitter } from "./emitter";

/** 
 * Contains child handling.
 * Contains event handling.
 * Contains debug handling.
 * Contains enabled state handling.
 */
export class Controller<T extends Controller<T>> extends Emitter<T> {
    public readonly name: string;

    private _enabled = true;
    private _children: T[] = [];
    private _handlers: Handler<T>[] = [];

    /** 
     * Contains child handling.
     * Contains event handling.
     * Contains debug handling.
     * Contains enabled state handling.
     * @param name of Controller, concatinated with classes.
     * @param classes optional prefixes of Controller name.
     */
    constructor(name: string, ...classes: string[]) {
        super();

        this.name = [name].concat(classes).join("/");
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
     * @returns appended child Controller.
     */
    public get children(): readonly T[] { return this._children; }

    /**
     * @returns appended event Handler.
     */
    public get handlers(): readonly Handler<T>[] { return this._handlers; }

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
     * Appends Controller.
     * Appends Handler.
     * It`s recommended to call super.append().
     */
    public append(child: T | Handler<T>): void {
        super.append(child);

        if (child instanceof Controller)
            this._children.push(child);
        else if (child instanceof Handler)
            this._handlers.push(child);
    }

    /**
     * Depends Controller.
     * Depends Handler.
     * It`s recommended to call super.depend().
     */
    public depend(child: Module<Module<T>>): void {
        super.depend(child);

        const childIndex = this._children.indexOf(child as any);
        const handlerIndex = this._handlers.indexOf(child as any);

        if (-1 != childIndex)
            this._children.splice(childIndex, 1);

        if (-1 != handlerIndex)
            this._handlers.splice(handlerIndex, 1);
    }

    /**
     * Appends an Action by this.append().
     * Throws an Error on init event Handler because init event Handler should be appended by once().
     * @param event name or callback of event.
     * @param emitter name or callback of event.
     * @param callback of event.
     */
    public on(event: string | null | ActionCallback, emitter?: string | ActionCallback, callback?: ActionCallback): void {
        if (event == EVENT_INIT)
            throw new Error("use once() instead to append init event Handler");

        this.append(new Action(event, emitter, callback));
    }

    /**
     * Appends an once called Action by this.append().
     * Ignores init event handlers when Controller is already initialized.
     * @param event name or callback of event.
     * @param emitter name or callback of event.
     * @param callback of event.
     */
    public once(event: string | null | ActionCallback, emitter?: string | ActionCallback, callback?: ActionCallback): void {
        if (event == EVENT_INIT && this.initialized)
            return;

        this.append(new Action(event, emitter, true, callback));
    }

    /**
     * Depends all event Handler with specific event name.
     * Depends all event Handler if event argument is not given.
     * Calls this.depend().
     */
    public off(event?: string): void {
        for (let i = this._handlers.length - 1; i >= 0; --i) {
            const handler = this._handlers[i];

            if (event != undefined && event != handler.event)
                continue;

            this.depend(handler);
        }
    }

    /**
     * Calls parent.emit() if parent is set.
     * Handles emitted event by all appended Handler and Controller if parent is not set.
     * Throws an Error if enabled is false.
     * Handles event by Promise, after returning Event.
     * Calls event.retain() before handling by appended Handler and Controller.
     * Calls event.release() after handling is done.
     * @param event instance or name.
     * @returns handled Event.
     */
    public emit(event: Event | string, args?: NodeJS.ReadOnlyDict<any>, emitter: string = this.name): Event {
        if (!this._enabled)
            throw new Error("controller is disabled");

        if (this.parent)
            return this.parent.emit(event, args, emitter);

        const instance = event instanceof Event
            ? event
            : new Event(event, emitter, args);

        instance.retain();

        Promise.resolve()
            .then(() => this.handleEvent(instance))
            .then(() => instance.release());

        return instance;
    }

    /** 
     * @returns Object with name.
     * @returns Object with enabled state.
     * @returns Object with children mapped by toJSON().
     * @returns Object with handlers mapped by toJSON().
     */
    public toJSON(): NodeJS.Dict<any> {
        const data = super.toJSON();

        data.name = this.name;
        data.enabled = this._enabled;
        data.children = this.children.map(child => child.toJSON());
        data.handlers = this.handlers.map(handler => handler.toJSON());

        return data;
    }

    /** 
     * Parses enabled state if set.
     * Parses children if set.
     * Parses handlers if set.
     * Throws an Error on missmatching name.
     * It`s recommended to call super.fromJSON().
     */
    public fromJSON(data: NodeJS.ReadOnlyDict<any>): void {
        if (data.name !== this.name)
            throw new Error("missmatching name");

        super.fromJSON(data);

        if (data.enabled != undefined)
            this.enabled = data.enabled;

        if (data.children)
            data.children.forEach((data, index) => this.children[index].fromJSON(data));

        if (data.handlers)
            data.handlers.forEach((data, index) => this.handlers[index].fromJSON(data));
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
     * Calls onEnabled() on all handlers.
     * Calls onEnabled() on all enabled children.
     * It`s recommended to call super.onEnabled().
     */
    protected onEnabled(): void {
        this.handlers.forEach(handler => handler.onEnabled());
        this.children.forEach(child => child._enabled && child.onEnabled());
    }

    /**
     * Called when controller has been disabled.
     * Calls onDisabled() on all handlers.
     * Calls onDisabled() on all enabled children.
     * It`s recommended to call super.onDisabled().
     */
    protected onDisabled(): void {
        this.handlers.forEach(handler => handler.onDisabled());
        this.children.forEach(child => child._enabled && child.onDisabled());
    }

    /**
     * Calls handleEvent() on all handlers.
     * Calls handleEvent() on all children.
     * Skips when not enabled.
     */
    private handleEvent(event: Event): void {
        if (!this._enabled)
            return;

        this.handlers.forEach(handler => handler.handleEvent(event));
        this.children.forEach(child => child.handleEvent(event));
    }
}