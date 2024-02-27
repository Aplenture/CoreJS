/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Event } from "./event";
import { Controller } from "./controller";
import { Emitter } from "./emitter";

/** Handles events with matching name. */
export abstract class Handler<T extends Controller<T>> extends Emitter<T> {
    /**
     * Handles events with matching name.
     * @param name optional event handling name. When empty, handler responds on every event.
     */
    constructor(name?: string) {
        super(name);
    }

    /**
     * Called on event with matching name.
     * Called on every when name is unset.
     * @returns any Promise.
     */
    protected abstract execute(event: Event): Promise<any>;

    /**
     * Calls this.execute() on event with matching name.
     * Calls this.execute() on every event when name is unset.
     * Calls this.execute() with the event argument.
     * Calls event.retain() before this.execute().
     * Calls event.release() after this.execute().
     * @returns void Promise
     */
    public async handleEvent(event: Event): Promise<void> {
        if (this.name != undefined && this.name != event.name)
            return;

        event.retain();

        await this.execute(event);

        event.release();
    }

    /**
     * Called when parent is enabled.
     * It`s recommended to call super.onEnabled().
     */
    public onEnabled(): void { }

    /**
     * Called when parent is disabled.
     * It`s recommended to call super.onDisabled().
     */
    public onDisabled(): void { }
}