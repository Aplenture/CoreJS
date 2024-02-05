/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Module } from "./module";

/**Module to handle getter and setter. */
export class Handler<T extends Handler<T>> extends Module<T> {
    /**
     * Returns whether value exists.
     * @param key of the value
     */
    public has(key: string): boolean {
        if (this.parent)
            return this.parent.has(key);

        return false;
    }

    /**
     * Returns value by key from parent if parent is set.
     * Otherwise undefined is returned.
     * @param key of value to return
     * @param _default is returned when parent is not set
     * @returns value or undefined
     */
    public get<T>(key: string, _default?: T): T {
        if (this.parent)
            return this.parent.get(key, _default);

        return _default;
    }

    /**
     * Sets a value by key from parent if parent is set.
     * Otherwise nothing is done.
     * @param key of value to set
     * @param value of key to set
     */
    public set(key: string, value: any) {
        if (this.parent)
            this.parent.set(key, value);
    }
}