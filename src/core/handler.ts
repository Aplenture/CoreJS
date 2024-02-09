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

    /** The current state. */
    public state = HandlerState.Infinite;

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

    /** If true, the event is called only once. */
    public get once() { return this.state != HandlerState.Infinite; }

    /** Is called when event properties are matching. */
    public abstract execute(event: Event): Promise<any>;

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
}