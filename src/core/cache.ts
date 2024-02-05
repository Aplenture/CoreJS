/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Delegatable, Delegate } from "./delegate";

/** Data container with some usefull API's. */
export class Cache {
    private readonly _onChange = new Delegate<NodeJS.ReadOnlyDict<any>>();
    private readonly data: NodeJS.Dict<any>;

    /**
     * @param data initial data
     */
    constructor(data: NodeJS.ReadOnlyDict<any> = {}) {
        this.data = Object.assign({}, data);
    }

    /** Invoked when cache data has changed. */
    public get onChange(): Delegatable<NodeJS.ReadOnlyDict<any>> { return this._onChange; }

    /** Returns a copy of cache data. */
    public toJSON() {
        return Object.assign({}, this.data);
    }

    /** Returns a serialization of the cache data. */
    public toString() {
        return this.serialze();
    }

    /**
     * Returns whether cache contains a value for a specific key.
     * @param key of the value
     */
    public has(key: string) {
        return this.data[key] !== undefined;
    }

    /**
     * Returns the value of a key if set.
     * Otherwise given default is set and returned.
     * @param key of the value
     * @param _default if key is unset, default will be set and returned
     */
    public get<T>(key: string, _default?: T): T {
        // catch if key is not a string
        if (typeof key != "string")
            throw new Error('key needs to be a string to return a value');

        // set default if key is unset
        if (this.data[key] === undefined)
            this.data[key] = _default;

        return this.data[key];
    }

    /**
     * Changes the value of a key.
     * Propagates changed data by onChange.
     * @param key of the value
     * @param value of the key
     */
    public set(key: string, value: any) {
        // catch if key is not a string
        if (typeof key != "string")
            throw new Error('key needs to be a string to set a value');

        this.data[key] = value;

        // propagate changed data only
        const data = {};
        data[key] = value;
        this._onChange.invoke(data);
    }

    /**
     * Returns a JSON, containing the cache data.
     */
    public serialze() {
        return JSON.stringify(this);
    }

    /**
     * Changes the cache data by JSON string or any object values.
     * Propagates changed data by onChange.
     * @param data JSON or object with cache data
     */
    public deserialze(data: string | NodeJS.ReadOnlyDict<any>) {
        // parse JSON string to object if needed
        if (typeof data == "string")
            data = JSON.parse(data);

        // change data by all object values
        Object.keys(data).forEach(key => this.data[key] = data[key]);

        // propagate all data
        this._onChange.invoke(this.toJSON());
    }
}