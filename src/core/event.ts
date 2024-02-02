/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Serialization } from "../utils";
import { Delegate } from "./delegate";
import { Emitter } from "./emitter";

export class Event {
    /** Allows to propagate data */
    public readonly onData = new Delegate<any>();

    /** Allows to propagate messages */
    public readonly onMessage = new Delegate<string>();

    private _data;

    /**
     * @param name of the event
     * @param args of the event
     * @param emitter of the event
     */
    constructor(
        public readonly name: string,
        public readonly args: NodeJS.ReadOnlyDict<any>,
        public readonly emitter: Emitter
    ) {
        this.onData.on(data => this.data = data);
    }

    /** Latest propagated data by onData. */
    public get data() { return this._data; }
    private set data(value) { this._data = value; }

    /** Retuns event parameters as string. */
    public toString() { return `${this.emitter.name} >> ${this.name} ${Serialization.toString(this.args)}`; }

    /**
     * Returns promise with propagated data.
     * If data was already propagated last is returned.
     * Otherwise next is returned.
     */
    public await() {
        return this.data === undefined
            // create promise for next propagated data
            ? this.onData.await()
            // returns last propagated data
            : Promise.resolve(this.data);
    }

    /** Sends data by calling invoke() from onData. */
    public send(data: any) {
        this.onData.invoke(data);
    }

    /** Sends message by calling invoke() from onMessage. */
    public write(message: string) {
        this.onMessage.invoke(message);
    }
}