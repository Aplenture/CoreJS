/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import * as Utils from "../utils";
import { Delegate } from "./delegate";

/**
 * Allows to send data from Handler to emitter.
 * Extends Delegate to overwirte then() to prevent data handling of only one event Handler.
 */
export class Event extends Delegate<any> {
    /**
     * Any arguments from emitter.
     */
    public readonly args: NodeJS.ReadOnlyDict<any>;

    /** Initial timestamp from Event. */
    public readonly timestamp: number;

    private readonly onRelease = new Delegate<any>();

    private data;
    private retains = 0;

    /**
     * Allows to send data from Handler to emitter.
     * Extends Delegate to overwirte then() to prevent data handling of only one event Handler.
     * @argument name of the Event.
     * @argument emitter of the Event.
     * @argument argsOrTimestamp Event timestamp as number or Event args as Object.
     * @argument timestamp default is Date.now()
     */
    constructor(
        public readonly name: string,
        public readonly emitter: string,
        argsOrTimestamp?: NodeJS.ReadOnlyDict<any> | number,
        timestamp?: number
    ) {
        // set Event data to latest sent data
        super(data => this.data = data);

        this.args = argsOrTimestamp instanceof Object ? argsOrTimestamp : {};
        this.timestamp = typeof argsOrTimestamp == "number" ? argsOrTimestamp : timestamp ?? Date.now();
    }

    /** Is true when all retains are released. */
    public get finished(): boolean { return this.retains == 0; }

    /**
     * Parses Event properties to string.
     * @returns timestamp as "YYYY-MM-DD hh:mm:ss", emitter, name and args by Utils.Args.fromArgs().
     */
    public toString(): string {
        return `${Utils.Time.format("YYYY-MM-DD hh:mm:ss", new Date(this.timestamp))} >> ${this.emitter} emits ${this.name} ${Utils.Args.fromArgs(this.args)}`;
    }

    /**
     * @returns Promise which is resolved instant when Event has no retains.
     * @returns otherwise Promise which is resolved when last retain is released.
     */
    public then<T>(callback?: (data) => T | PromiseLike<T>): Promise<T> {
        if (this.finished)
            return Promise.resolve(this.data).then(callback);

        return this.onRelease.then(callback);
    }

    /**
     * Retains the Event until release is called.
     */
    public retain(): void {
        this.retains++;
    }

    /**
     * Reduces the retains.
     * Resolves all then promises, if Event is finished.
     * Throws an Error if called on finished Event.
     */
    public release(): void {
        if (this.finished)
            throw new Error("event is already finished");

        this.retains--;

        if (this.finished)
            this.onRelease.invoke(this.data);
    }
}