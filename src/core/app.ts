/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { EVENT_INIT, CACHE_INIT } from "../constants";
import { CacheController } from "./cacheController";
import { Controller } from "./controller";

export class App extends Controller<any> {
    public readonly cacheController: CacheController;

    constructor(name: string, ...classes: string[]) {
        super(name, ...classes);

        this.cacheController = new CacheController(name, ...classes);

        this.append(this.cacheController);
    }

    public get<T>(key: string, _default?: T): T {
        return this.cacheController.get(key, _default);
    }

    public set(key: string, value: any) {
        this.cacheController.set(key, value);
    }

    public init() {
        this.set(CACHE_INIT, true);
        this.emit(EVENT_INIT);
    }

    public serialze() {
        return this.cacheController.serialze();
    }

    public deserialze(data: string | NodeJS.ReadOnlyDict<any>) {
        this.cacheController.deserialze(data);
    }
}