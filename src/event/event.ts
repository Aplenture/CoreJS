/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Delegate } from "../core/delegate";
import { Emitter } from "../core/emitter";

export class Event {
    public readonly onData = new Delegate<any>();
    public readonly onMessage = new Delegate<string>();

    private _data;

    constructor(
        public readonly name: string,
        public readonly args: NodeJS.ReadOnlyDict<any>,
        public readonly emitter: Emitter
    ) {
        this.onData.on(data => this.data = data);
    }

    public get data() {
        return this._data === undefined
            ? new Promise(resolve => this.onData.once(data => resolve(data)))
            : Promise.resolve(this._data);
    }

    private set data(value) { this._data = value; }
}