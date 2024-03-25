/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Event } from "./event";
import { Handler } from "./handler";

export type ActionCallback = (event: Event) => Promise<any>;

/**
 * States of Action.
 */
export enum ActionState {
    /** Action is called multiple times. */
    Infinite = 1,
    /** Action is called only once. */
    Once,
    /** Action was called once and will be removed after finishing event handling. */
    Removing
}

/**
 * Config of Action.
 */
export interface ActionConfig {
    /** If set, callback will be executed by events with this name only. */
    readonly event?: string;
    /** If set, callback will be executed by emitter with this name only. */
    readonly emitter?: string;
    /**
     * If true, callback will be executed only once.
     * After that removeFromParent() is called.
     */
    readonly once?: boolean;
    /** Called on event execution if all event properties matching with Action properites. */
    readonly callback?: ActionCallback;
}

/**
 * Handler with callback which is called on event handling.
 * Contains different properties to handle events with specific properties only.
 */
export class Action extends Handler<any> {
    /** If set, execute() is called by emitters with this name only. */
    public readonly emitter?: string;

    private _state = ActionState.Infinite;

    protected readonly execute: ActionCallback;

    /**
     * Handler with callback which is called on event handling.
     * Contains different properties to handle events with specific properties only.
     * Throws an Error if callback is not given or not a function.
     * @param config config, event name or callback
     * @param callback callback
     */
    constructor(config: ActionConfig | string | ActionCallback, callback?: ActionCallback) {
        // set name of handler by config or null
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
                throw new Error("invalid callback function");
    }

    /** Current Action state. */
    public get state(): ActionState { return this._state; }
    protected set state(value) { this._state = value; }

    /** If true, the Action is called only once. */
    public get once(): boolean { return this.state != ActionState.Infinite; }

    /**
     * Executes callback on event with matching name.
     * Executes callback on every event when name is unset.
     * Executes callback on event with matching emitter.
     * Executes callback on every event when emitter is unset.
     * Executes callback on one event when once is true.
     * Changes state from once to removing on execution.
     * Skips callback execution if state is removing.
     * Calls this.removeFromParent() when state is once and callback finished execution.
     * It`s recommended to call super.handleEvent().
     */
    public async handleEvent(event: Event): Promise<void> {
        if (this.emitter != undefined && this.emitter != event.emitter)
            return;

        if (this.state == ActionState.Removing)
            return;

        if (this.state == ActionState.Once)
            this.state = ActionState.Removing;

        await super.handleEvent(event);

        if (this.state == ActionState.Removing)
            this.removeFromParent();
    }

    /**
     * It`s recommended to call super.fromString().
     * @returns object with state of Action.
     */
    public toJSON(): NodeJS.Dict<any> {
        const data = super.toJSON();

        data.state = this.state;

        return data;
    }

    /** 
     * Parses Action state from object.
     * Calls this.removeFromParent() if state is removing.
     * It`s recommended to call super.fromJSON().
     */
    public fromJSON(data: NodeJS.ReadOnlyDict<any>): void {
        super.fromJSON(data);

        if (data.state)
            this.state = data.state;

        if (this.state == ActionState.Removing)
            this.removeFromParent();
    }
}