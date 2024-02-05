/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { EVENT_INIT, CACHE_INIT } from "../constants";
import { CacheController } from "./cacheController";
import { Controller } from "./controller";

/** Basic Controller with cache handling. */
export class App extends Controller<any> {
    public readonly cacheController: CacheController;

    constructor(name: string, ...classes: string[]) {
        super(name, ...classes);

        this.cacheController = new CacheController(name, ...classes);

        this.append(this.cacheController);
    }

    /**
     * Returns the value of a key if set.
     * Otherwise given default is set and returned.
     * @param key of the value
     * @param _default if key is unset, default will be set and returned
     */
    public get<T>(key: string, _default?: T): T {
        return this.cacheController.get(key, _default);
    }

    /**
     * Changes the value of a key.
     * Emits changed data.
     * @param key of the value
     * @param value of the key
     */
    public set(key: string, value: any) {
        this.cacheController.set(key, value);
    }

    /**
     * Emits init event.
     * Sets init to true in cache.
     */
    public init() {
        this.set(CACHE_INIT, true);
        this.emit(EVENT_INIT);
    }

    /** Returns a JSON, containing the cache data. */
    public serialze() {
        return this.cacheController.serialze();
    }

    /**
     * Changes the cache data by JSON string or any object values.
     * Emits changed data.
     * @param data JSON or object with cache data
     */
    public deserialze(data: string | NodeJS.ReadOnlyDict<any>) {
        this.cacheController.deserialze(data);
    }
}