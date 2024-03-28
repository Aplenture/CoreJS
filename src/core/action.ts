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
 * Event Handler with callback.
 * Contains different properties to handle events with specific properties only.
 */
export class Action extends Handler<any> {
    /** If set, execute() is called by emitters with this name only. */
    public readonly emitter?: string;

    private _state = ActionState.Infinite;

    protected readonly execute: ActionCallback;

    /**
     * Event Handler with callback.
     * Contains different properties to handle events with specific properties only.
     * Throws an Error if callback is not given or not a function.
     * @param event name or once flag or callback of event.
     * @param emitter name or once flag or callback of event.
     * @param once flag or callback of event.
     * @param callback of event.
     */
    constructor(
        event: string | null | boolean | ActionCallback,
        emitter?: string | boolean | ActionCallback,
        once?: boolean | ActionCallback,
        callback?: ActionCallback
    ) {
        super(typeof event == "string" ? event : null);

        if (event == true)
            this.state = ActionState.Once;
        else if (typeof event == "function")
            this.execute = event;

        if (typeof emitter == "string")
            this.emitter = emitter;
        else if (emitter == true)
            this.state = ActionState.Once;
        else if (typeof emitter == "function")
            this.execute = emitter;

        if (once == true)
            this.state = ActionState.Once;
        else if (typeof once == "function")
            this.execute = once;

        if (typeof callback == "function")
            this.execute = callback;

        if (typeof this.execute != "function")
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