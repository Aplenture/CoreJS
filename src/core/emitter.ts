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
     * Catches unset parent.
     * @returns an Event by parent when parent is set.
     * @returns undefined when parent is unset.
     */
    public emit(event: string, args: NodeJS.ReadOnlyDict<any> = this, emitter: string = this.name, timestamp?: number): Event {
        if (this.parent)
            return this.parent.emit(event, args, emitter, timestamp);
    }
}