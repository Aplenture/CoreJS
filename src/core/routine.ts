/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { EVENT_INIT, EVENT_START, EVENT_STOP } from "../constants";
import { ActionCallback } from "./action";
import { Controller } from "./controller";

export class Routine extends Controller<Controller<any>> {
    constructor(name: string, ...classes: string[]) {
        super(name, ...classes, "routine");
    }

    public get running(): boolean { throw new Error('method not implemented'); }

    public on(callback: ActionCallback): void {
        if (!(callback instanceof Function))
            throw new Error('callback is not a function');

        super.on(this.name, callback);
    }

    public once(callback: ActionCallback): void {
        if (!(callback instanceof Function))
            throw new Error('callback is not a function');

        super.once(this.name, callback);
    }

    public start(time = Date.now()) {
        if (this.running)
            return;

        this.emit(EVENT_START);

        this.emit(this.name, this, this.name, time);

        throw new Error('method not implemented');
    }

    public stop() {
        if (!this.running)
            return;

        this.emit(EVENT_STOP);

        throw new Error('method not implemented');
    }

    protected onEnabled(): void {
        super.onEnabled();

        this.start();
    }

    protected onDisabled(): void {
        super.onDisabled();

        this.stop();
    }

    protected onAppended(): void {
        super.onAppended();

        // if already init
        // start() when enabled
        // else add init event handler
        // to start at init event
        if (!this.initialized)
            super.once(EVENT_INIT, async () => this.enabled && this.start());
        else if (this.enabled)
            this.start();
    }

    protected onDepended(): void {
        super.onDepended();

        this.stop();
    }
}