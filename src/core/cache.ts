/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Serializable } from "./serializable";

/** 
 * Storage for app specific values.
 * Contains usefull methods to handle values.
 * Implements data serialization.
 */
export class Cache extends Serializable {
    private readonly data: NodeJS.Dict<any>;

    /** 
     * Storage for app specific values.
     * Contains usefull methods to handle values.
     * Implements data serialization.
     * @param data copy of initial cache data.
     */
    constructor(data: NodeJS.ReadOnlyDict<any> = {}) {
        super();

        this.data = Object.assign({}, data);
    }

    /**
     * @param key of the value to test.
     * @returns true when value of key is set. Otherwise false is returned.
     */
    public has(key: string): boolean {
        return this.data[key] !== undefined;
    }

    /**
     * Throws an Error if key is not a string.
     * @param key of the value to get.
     * @param _default optional default value.
     * @returns value of given key if set.
     * @returns otherwise _default if set.
     * @returns otherwise undefined.
     */
    public get<T>(key: string, _default?: T): T {
        if (typeof key != "string")
            throw new Error("key needs to be a string");

        if (this.data[key] === undefined)
            this.data[key] = _default;

        return this.data[key];
    }

    /**
     * Sets the value of given key.
     * Throws an Error if key is not a string.
     * @param key of the value to set.
     * @param value of the key to set.
     */
    public set(key: string, value: any): void {
        if (typeof key != "string")
            throw new Error("key needs to be a string");

        this.data[key] = value;
    }

    /**
     * It`s recommended to call super.fromString().
     * @returns object with data of cache.
     */
    public toJSON(): NodeJS.Dict<any> {
        const data = super.toJSON();

        data.data = this.data;

        return data;
    }

    /** 
     * Parses cache data from object.
     * Calls set() for every key value pair in data.
     * It`s recommended to call super.fromJSON().
     */
    public fromJSON(data: NodeJS.ReadOnlyDict<any>): void {
        super.fromJSON(data);

        if (!data.data)
            return;

        Object.keys(data.data).forEach(key => this.set(key, data.data[key]));
    }
}