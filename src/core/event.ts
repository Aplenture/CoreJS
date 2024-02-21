/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import * as Utils from "../utils";
import { Delegatable, Delegate } from "./delegate";

export class Event {
    public readonly args: NodeJS.ReadOnlyDict<any>;
    public readonly timestamp: number;

    private readonly _onData = new Delegate<any>();
    private readonly onRelease = new Delegate<any>();

    private data;
    private retains = 0;

    constructor(
        public readonly name: string,
        public readonly emitter: string,
        argsOrTimestamp?: NodeJS.ReadOnlyDict<any> | number,
        timestamp?: number
    ) {
        this.args = argsOrTimestamp instanceof Object ? argsOrTimestamp : {};
        this.timestamp = typeof argsOrTimestamp == "number" ? argsOrTimestamp : timestamp ?? Date.now();

        this.onData.on(data => this.data = data);
    }

    public get finished() { return this.retains == 0; }

    public get onData(): Delegatable<any> { return this._onData; }

    public toString() {
        return `${Utils.Time.format("YYYY-MM-DD hh:mm:ss", new Date(this.timestamp))} >> ${this.emitter} emits ${this.name} ${Utils.Args.toString(this.args)}`;
    }

    public then<T>(callback?: (data) => T | PromiseLike<T>) {
        if (this.finished)
            return Promise.resolve(this.data).then(callback);

        return this.onRelease.then(callback);
    }

    public send(data: any) {
        this._onData.invoke(data);
    }

    public retain() {
        this.retains++;
    }

    public release() {
        if (this.finished)
            throw new Error('event is already finished');

        this.retains--;

        if (this.finished)
            this.onRelease.invoke(this.data);
    }
}