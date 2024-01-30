/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { EVENT_INIT, CACHE_INIT } from "../constants";
import { Cache } from "./cache";
import { Controller } from "./controller";

export class App extends Controller<any> {
    public readonly cache: Cache;

    constructor(name: string, ...classes: string[]) {
        super(name, ...classes);

        this.cache = new Cache(name, ...classes);

        this.append(this.cache);
    }

    public get<T>(key: string): T {
        return this.cache.get(key);
    }

    public set(key: string, value: any) {
        this.cache.set(key, value);
    }

    public init() {
        this.set(CACHE_INIT, true);
        this.emit(EVENT_INIT);
    }

    public load(data: NodeJS.ReadOnlyDict<any>) {
        this.cache.load(data);
    }
}