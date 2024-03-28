/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Event } from "./event";
import { Module } from "./module";

/**
 * Continas Event emitting.
 */
export class Emitter<T extends Emitter<T>> extends Module<T> {
    /**
     * Calls parent.emit().
     * Catches unset parent.
     * @param event name or instance of event.
     * @param args optional arguments of event.
     * @param emitter optional name of event emitter.
     * @returns an Event of parent when parent is set.
     * @returns undefined when parent is unset.
     */
    public emit(event: Event | string, args?: NodeJS.ReadOnlyDict<any>, emitter?: string): Event {
        if (this.parent)
            return this.parent.emit(event, args, emitter);
    }
}