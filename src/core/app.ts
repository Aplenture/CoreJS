/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { EVENT_INIT } from "../constants";
import { Cache } from "./cache";
import { Controller } from "./controller";

/** Basic Controller with cache handling. */
export class App extends Controller<any> {
    private readonly cache: Cache;

    constructor(name: string, ...classes: string[]) {
        super(name, ...classes);

        this.cache = new Cache();
    }

    /** App initialization state. */
    public get initialized(): boolean { return this.get("cache_init"); }
    private set initialized(value: boolean) { this.set("cache_init", value); }

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
        this.emit(key);
    }

    /**
     * Emits init event.
     * Sets init to true in cache.
     */
    public init() {
        this.initialized = true;
        this.emit(EVENT_INIT);
    }

    public toJSON(): NodeJS.Dict<any> {
        const data = super.toJSON();

        // serialize cache
        data.cache = this.cache.toJSON();

        return data;
    }

    public fromJSON(data: NodeJS.ReadOnlyDict<any>): void {
        super.fromJSON(data);

        // deserialize cache
        if (data.cache)
            this.cache.fromJSON(data.cache);
    }
}