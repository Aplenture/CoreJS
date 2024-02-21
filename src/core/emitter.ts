/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Event } from "./event";
import { Module } from "./module";

/**
 * Emits events to parent.
 */
export class Emitter<T extends Emitter<T>> extends Module<T> {
    /**
     * Calls parent.emit().
     * Calls parent.emit() with the args.
     * Catches unset parent.
     * @param event name.
     * @param args default is undefined.
     * @param emitter name, default is this.
     * @param timestamp default is undefined.
     * @returns an Event by parent when parent is set.
     * @returns undefined when parent is unset.
     */
    public emit(event: string, args?: NodeJS.ReadOnlyDict<any>, emitter: string = this.name, timestamp?: number): Event {
        if (this.parent)
            return this.parent.emit(event, args, emitter, timestamp);
    }
}