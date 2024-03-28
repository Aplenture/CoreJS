/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Event } from "./event";
import { Controller } from "./controller";
import { Emitter } from "./emitter";

/** 
 * Contains Event handling.
 */
export abstract class Handler<T extends Controller<T>> extends Emitter<T> {
    /**
     * Contains Event handling.
     * @param event optional specific event when to respond. If empty handler responds on every event.
     */
    constructor(public readonly event: string | null = null) {
        super();
    }

    /**
     * Called on event with matching name.
     * Called on every when name is unset.
     * @returns any Promise.
     */
    protected abstract execute(event: Event): Promise<any>;

    /**
     * Calls parent.emit() with parent as emitter.
     * Catches unset parent.
     * @param event name or instance of event.
     * @param args optional arguments of event.
     * @returns an Event of parent when parent is set.
     * @returns undefined when parent is unset.
     */
    public emit(event: string | Event, args?: NodeJS.ReadOnlyDict<any>): Event {
        if (this.parent)
            return this.parent.emit(event, args);
    }

    /**
     * Calls this.execute() on event with matching name.
     * Calls this.execute() on every event when name is unset.
     * Calls this.execute() with the event argument.
     * Calls event.retain() before execute().
     * Calls event.release() after execute().
     * It`s recommended to call super.handleEvent().
     * @returns void Promise
     */
    public async handleEvent(event: Event): Promise<void> {
        if (this.event != undefined && this.event != event.name)
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

    /**
     * @returns Object with event name.
     */
    public toJSON(): NodeJS.Dict<any> {
        const data = super.toJSON();

        data.event = this.event;

        return data;
    }

    /** 
     * Parses from object.
     * Throws an Error on missmatching event name.
     * It`s recommended to call super.fromJSON().
     */
    public fromJSON(data: NodeJS.ReadOnlyDict<any>): void {
        if (data.event !== this.event)
            throw new Error("missmatching event name");

        super.fromJSON(data);
    }
}