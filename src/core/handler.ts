/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Event } from "./event";
import { Controller } from "./controller";
import { Module } from "./module";

export abstract class Handler<T extends Controller<T>> extends Module<T> {
    protected abstract execute(event: Event): Promise<any>;

    constructor(name?: string) {
        super(name);
    }

    public async handleEvent(event: Event) {
        // skip if name is missmatching
        if (this.name != undefined && this.name != event.name)
            return;

        // retain event before execution
        event.retain();

        await this.execute(event);

        // release event after execution
        event.release();
    }

    /**
     * Called when controller is enabled.
     * It`s recommended to call super.onEnabled().
     */
    public onEnabled() { }

    /**
     * Called when controller is disabled.
     * It`s recommended to call super.onDisabled().
     */
    public onDisabled() { }
}