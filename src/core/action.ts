/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Event } from "./event";
import { Handler } from "./handler";

export type ActionCallback = (event: Event) => Promise<any>;

export enum ActionState {
    Infinite = 1,
    Once,
    Removing
}

export interface ActionConfig {
    /** If set execute() is called by events with this name only. */
    readonly event?: string;
    /** If set execute() is called by emitter with this name only. */
    readonly emitter?: string;
    /**
     * If set execute() is called only once.
     * After that removeFromParent() is called.
     */
    readonly once?: boolean;
    /** Called on event execution */
    readonly callback?: ActionCallback;
}

/** Event handler shell for callbacks */
export class Action extends Handler<any> {
    /** If set execute() is called by emitter with this name only. */
    public readonly emitter?: string;

    private _state = ActionState.Infinite;

    protected readonly execute: ActionCallback;

    /**
     * @param config config, event name or callback
     * @param callback callback
     */
    constructor(config: ActionConfig | string | ActionCallback, callback?: ActionCallback) {
        super(typeof config == "string" ? config : !(config instanceof Function) ? config.event : null);

        if (config instanceof Function) {
            this.execute = config;
        } else if (config instanceof Object) {
            this.emitter = config.emitter;

            if (config.once)
                this.state = ActionState.Once;

            if (config.callback instanceof Function)
                this.execute = config.callback;
        }

        if (!this.execute)
            if (callback instanceof Function)
                this.execute = callback
            else
                throw new Error('invalid callback function');
    }

    /** The current state. */
    public get state() { return this._state; }
    protected set state(value) { this._state = value; }

    /** If true, the event is called only once. */
    public get once() { return this.state != ActionState.Infinite; }

    /** 
     * Calls execte() when
     * handler name is not set or matches with event name
     * and handler emitter is not set or matches with event emitter
     * and handler state is not removing.
     * calls event.retain() before execution and event.release() after execution.
     * Removes itself after execution if state is once.
     */
    public async handleEvent(event: Event) {
        // skip if emitter is missmatching
        if (this.emitter != undefined && this.emitter != event.emitter)
            return;

        // skip if handler is removing from parent
        if (this.state == ActionState.Removing)
            return;

        // change state to removing if once is enabled
        if (this.state == ActionState.Once)
            this.state = ActionState.Removing;

        await super.handleEvent(event);

        if (this.state == ActionState.Removing)
            this.removeFromParent();
    }

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