/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Serializable } from "./serializable";

export class Stopwatch extends Serializable {
    private _running = false;
    private _startTime = 0;
    private _stopTime = 0;

    constructor() {
        super();
    }

    public get running() { return this._running; }
    private set running(value) { this._running = value; }

    public get startTime() { return this._startTime; }
    private set startTime(value) { this._startTime = value; }

    public get stopTime() { return this._stopTime; }
    private set stopTime(value) { this._stopTime = value; }

    public get duration() { return (this.stopTime || Date.now()) - this.startTime; }

    public start(time = Date.now()) {
        if (this.running)
            throw new Error("Stopwatch is currently running");

        this.reset(time);
    }

    public stop(time = Date.now()) {
        if (!this.running)
            throw new Error("Stopwatch is not running");

        this.running = false;
        this.stopTime = time;
    }

    public restart(time = Date.now()) {
        this.reset(time);
    }

    public reset(start?: number, stop?: number) {
        this.running = start && !stop;
        this.startTime = start ?? 0;
        this.stopTime = stop ?? 0;
    }

    public toJSON(): NodeJS.Dict<any> {
        const data = super.toJSON();

        data.start = this.startTime;
        data.stop = this.stopTime;

        return data;
    }

    public fromJSON(data: NodeJS.ReadOnlyDict<any>): void {
        super.fromJSON(data);

        this.reset(data.start, data.stop);
    }
}
