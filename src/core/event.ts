/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Serialization, Time } from "../utils";
import { Delegatable, Delegate } from "./delegate";
import { Module } from "./module";

export class Event {
    private readonly _onData = new Delegate<any>();
    private readonly onRelease = new Delegate<any>();

    private data;
    private _retains = 0;

    /**
     * @param name of the event
     * @param args of the event
     * @param emitter of the event
     * @param timestamp of the event
     */
    constructor(
        public readonly name: string,
        public readonly args: NodeJS.ReadOnlyDict<any>,
        public readonly emitter: string,
        public readonly timestamp = Date.now()
    ) {
        // sets data on sending
        this.onData.on(data => this.data = data);
    }

    /** Returns number of retains until releasing. */
    public get retains() { return this._retains; }
    private set retains(value) { this._retains = value; }

    /** Propagates data. */
    public get onData(): Delegatable<any> { return this._onData; }

    /** Retuns event properties as log. */
    public toString() {
        const time = Time.format("YYYY-MM-DD hh:mm:ss", new Date(this.timestamp));
        const args = this.args instanceof Module
            ? ""
            : Serialization.toString(this.args);

        return `${time} >> ${this.emitter} emits ${this.name} ${args}`;
    }

    /** Returns promise to wait until event is released. */
    public then<T>(callback?: (data) => T | PromiseLike<T>) {
        return this.retains == 0
            ? Promise.resolve(this.data).then(callback)
            : this.onRelease.then(callback);
    }

    /** Sends data via onData. */
    public send(data: any) {
        this._onData.invoke(data);
    }

    /** Increases retain counter. */
    public retain() {
        this.retains++;
    }

    /** 
     * Decreases retain counter. 
     * If retain counter is 0, await promises will be invoked.
     */
    public release() {
        if (this.retains == 0)
            throw new Error('event is already released');

        this.retains--;

        if (this.retains == 0)
            this.onRelease.invoke(this.data);
    }
}