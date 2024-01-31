/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Delegate } from "./delegate";
import { Emitter } from "./emitter";

export class Event {
    /** Allows to propagate data */
    public readonly onData = new Delegate<any>();

    /** Allows to propagate messages */
    public readonly onMessage = new Delegate<string>();

    private _data;

    constructor(
        public readonly name: string,
        public readonly args: NodeJS.ReadOnlyDict<any>,
        public readonly emitter: Emitter
    ) {
        this.onData.on(data => this.data = data);
    }

    /**
     * Returns promise with propagated data.
     * If data was already propagated last is returned.
     * Otherwise next is returned.
     */
    public get data() {
        return this._data === undefined
            // create promise for next propagated data
            ? new Promise(resolve => this.onData.once(data => resolve(data)))
            // returns last propagated data
            : Promise.resolve(this._data);
    }

    private set data(value) { this._data = value; }
}