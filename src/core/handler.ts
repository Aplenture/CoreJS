/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Event } from "./event";
import { Controller } from "./controller";
import { Module } from "./module";

export enum HandlerState {
    Infinite = 1,
    Once,
    Removing
}

export interface HandlerConfig {
    /** If set execute() is called by events with this name only. */
    readonly event?: string;
    /** If set execute() is called by emitter with this name only. */
    readonly emitter?: string;
    /**
     * If set execute() is called only once.
     * After that removeFromParent() is called.
     */
    readonly once?: boolean;
}

/**
 * Abstract class for event handling.
 * Decides on which event the handler is executed.
 */
export abstract class Handler<T extends Controller<T>> extends Module<T> {
    /** If set execute() is called by emitter with this name only. */
    public readonly emitter?: string;

    private _state = HandlerState.Infinite;

    /**
     * @param config config or event name
     */
    constructor(config: HandlerConfig | string = {}) {
        super(typeof config == "string" ? config : config.event);

        if (config instanceof Object) {
            this.emitter = config.emitter;

            if (config.once)
                this.state = HandlerState.Once;
        }
    }

    /** The current state. */
    public get state() { return this._state; }
    protected set state(value) { this._state = value; }

    /** If true, the event is called only once. */
    public get once() { return this.state != HandlerState.Infinite; }

    protected abstract execute(event: Event): PromiseLike<any>;

    /** 
     * Calls execte() when
     * handler name is not set or matches with event name
     * and handler emitter is not set or matches with event emitter
     * and handler state is not removing.
     * calls event.retain() before execution and event.release() after execution.
     * Removes itself after execution if state is once.
     */
    public handleEvent(event: Event) {
        // skip if name is missmatching
        if (this.name != undefined && this.name != event.name)
            return;

        // skip if emitter is missmatching
        if (this.emitter != undefined && this.emitter != event.emitter)
            return;

        // skip if handler is removing from parent
        if (this.state == HandlerState.Removing)
            return;

        // change state to removing if once is enabled
        if (this.state == HandlerState.Once)
            this.state = HandlerState.Removing;

        // retain event before execution
        event.retain();

        this.execute(event)
            // if state is removing, remove from parent after execution
            .then(() => this.state == HandlerState.Removing && this.removeFromParent())
            // release event after execution
            .then(() => event.release());
    }

    /**
     * Called when controller is enabled.
     * It`s recommended to call super.onEnabled().
     */
    public onEnabled() { }

    /**
     * Called when controller is disabled.
     * It`s recommended to call super.onDisabled().
     */
    public onDisabled() { }

    public toJSON(): NodeJS.Dict<any> {
        const data = super.toJSON();

        // serialize state
        data.state = this.state;

        return data;
    }

    public fromJSON(data: NodeJS.ReadOnlyDict<any>): void {
        super.fromJSON(data);

        // deserialize state
        if (data.state)
            this.state = data.state;
    }
}