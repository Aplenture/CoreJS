/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Emitter } from "./emitter";
import { Handler } from "./handler";
import { Event } from "./event";

export interface HandlerConfig {
    /** If set execute() is called by events with this name only. */
    readonly event?: string;
    /** If set execute() is called by this emitter only. */
    readonly emitter?: Emitter;
    /** If set execute() is called by parents only. */
    readonly onParent?: boolean;
    /**
     * If set execute() is called only once.
     * After that removeFromParent() is called.
     */
    readonly once?: boolean;
}

/**
 * Abstract class for event handling.
 * Decides on which event the handler is executed.
 */
export abstract class EventHandler<T extends Handler<T>> extends Handler<T> {
    /** If set execute() is called by this emitter only. */
    public readonly emitter?: Emitter;

    /** If set execute() is called by parents only. */
    public readonly onParent?: boolean;

    /**
     * If set execute() is called only once.
     * After that removeFromParent() is called.
     */
    public readonly once?: boolean;

    constructor(config: HandlerConfig = {}) {
        super(config.event);

        this.emitter = config.emitter;
        this.onParent = config.onParent;
        this.once = config.once;
    }

    /**
     * Emits an event to parent if parent is set.
     * @param event name of event
     * @param args optional arguments of event
     * @param emitter optional emitter of event
     * @returns an event
     */
    public emit(event: string, args?: NodeJS.ReadOnlyDict<any>, emitter?: Emitter): Event {
        if (this.parent)
            return this.parent.emit(event, args, emitter);
    }

    /** 
     * Decides on which event the handler is executed.
     * Delays the execution call to let other handler prepare the event handling.
     * @param event
     */
    public handleEvent(event: Event) {
        // skip if name is missmatching
        if (this.name != undefined && this.name != event.name)
            return;

        // skip if parent is expected
        if (this.onParent && !this.hasParent(event.emitter))
            return;

        // skip if emitter is missmatching
        if (this.emitter != undefined && this.emitter != event.emitter)
            return;

        // delay execution
        // to let other handler prepare the event handling
        Promise.resolve()
            .then(() => this.execute(event));

        // remove from parent if once is true
        if (this.once)
            this.removeFromParent();
    }

    /**
     * Is called when event properties are matching.
     * @param event
     */
    protected abstract execute(event: Event): any;
}