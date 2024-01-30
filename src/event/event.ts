/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Delegatable, Delegate } from "../core/delegate";
import { Emitter } from "../core/emitter";

export class Event {
    public readonly callback = new Delegate<any>();

    private readonly _start = new Delegate<void>();
    private readonly _end = new Delegate<void>();
    private readonly promises: Promise<void>[] = [];

    private _data: any;

    constructor(
        public readonly name: string,
        public readonly args: NodeJS.ReadOnlyDict<any>,
        public readonly emitter: Emitter
    ) {
        this.callback.on(data => this.data = data);

        Promise.resolve()
            .then(() => this._start.invoke())
            .then(() => Promise.all(this.promises))
            .then(() => this._end.invoke());
    }

    public get data() { return this._data; }
    private set data(value) { this._data = value; }

    public get start(): Delegatable<void> { return this._start; }
    public get end(): Delegatable<void> { return this._end; }

    public await() {
        return new Promise<any>(resolve => this.end.once(() => resolve(this.data)));
    }

    public append(...promises: Promise<void>[]) {
        this.promises.push(...promises);
    }
}