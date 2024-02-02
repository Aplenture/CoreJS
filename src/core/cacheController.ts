/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { COMMAND_GET, COMMAND_SET, EVENT_CACHE_CHANGED } from "../constants";
import { Cache } from "./cache";
import { Controller } from "./controller";

/** Controller for a cache. */
export class CacheController extends Controller<any> {
    private readonly cache = new Cache();

    constructor(name: string, ...classes: string[]) {
        super(name, ...classes, "cache");

        // emit all changes of cache
        this.cache.onChange.on(data => this.emit(EVENT_CACHE_CHANGED, data));

        // add commands for cache handling
        this.on(COMMAND_GET, async event => event.send(this.get(event.args.key)));
        this.on(COMMAND_SET, async event => this.set(event.args.key, event.args.value));
    }

    /**
     * Returns whether cache contains a value for a specific key.
     * @param key of the value
     */
    public has(key: string) {
        return this.cache.has(key);
    }

    /**
     * Returns the value of a key if set.
     * Otherwise given default is set and returned.
     * @param key of the value
     * @param _default if key is unset, default will be set and returned
     */
    public get<T>(key: string, _default?: T): T {
        return this.cache.get(key, _default);
    }

    /**
     * Changes the value of a key.
     * Emits changed data.
     * @param key of the value
     * @param value of the key
     */
    public set(key: string, value: any) {
        this.cache.set(key, value);
    }

    /**
     * Returns a JSON, containing the cache data.
     */
    public serialze() {
        return this.cache.serialze();
    }

    /**
     * Changes the cache data by JSON string or any object values.
     * Emits changed data.
     * @param data JSON or object with cache data
     */
    public deserialze(data: string | NodeJS.ReadOnlyDict<any>) {
        this.cache.deserialze(data);
    }
}