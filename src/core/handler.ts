/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Event } from "./event";
import { Controller } from "./controller";
import { Module } from "./module";

enum State {
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

    /** If true removeFromParent() is called after first execute() call. */
    private _state = State.Infinite;

    /**
     * @param config config or event name
     */
    constructor(config: HandlerConfig | string = {}) {
        super(typeof config == "string" ? config : config.event);

        if (config instanceof Object) {
            this.emitter = config.emitter;

            if (config.once)
                this.state = State.Once;
        }
    }

    /** Returns the current state. */
    public get state() { return this._state; }
    private set state(value) { this._state = value; }

    /** Returns whether event is called only once. */
    public get once() { return this.state != State.Infinite; }

    /** 
     * Decides on which event the handler is executed.
     * Delays the execution call to let other handler prepare the event handling.
     * @param event
     */
    public handleEvent(event: Event) {
        // skip if name is missmatching
        if (this.name != undefined && this.name != event.name)
            return;

        // skip if emitter is missmatching
        if (this.emitter != undefined && this.emitter != event.emitter)
            return;

        // skip if handler is removing from parent
        if (this.state == State.Removing)
            return;

        // change state to removing if once is enabled
        if (this.state == State.Once)
            this.state = State.Removing;

        // retain event before execution
        event.retain();

        this.execute(event)
            // if state is removing, remove from parent after execution
            .then(() => this.state == State.Removing && this.removeFromParent())
            // release event after execution
            .then(() => event.release());
    }

    /**
     * Is called when event properties are matching.
     * @param event
     */
    protected abstract execute(event: Event): Promise<any>;
}