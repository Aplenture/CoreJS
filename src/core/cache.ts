/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { COMMAND_GET, COMMAND_SET, EVENT_CACHE_CHANGED } from "../constants";
import { Controller } from "./controller";

export class Cache extends Controller<any> {
    private readonly data = {};

    constructor(name: string, ...classes: string[]) {
        super(name, ...classes, "cache");

        this.on(COMMAND_GET, async event => event.callback.invoke(this.get(event.args.key)));
        this.on(COMMAND_SET, async event => this.set(event.args.key, event.args.value));
    }

    public get<T>(key: string): T {
        if (typeof key != "string")
            throw new Error('key needs to be a string to retrun a value');

        return this.data[key];
    }

    public set(key: string, value: any) {
        if (typeof key != "string")
            throw new Error('key needs to be a string to set a value');

        this.data[key] = value;

        // emit changed data only
        const data = {};
        data[key] = value;
        this.emit(EVENT_CACHE_CHANGED, data);
    }

    public load(data: NodeJS.ReadOnlyDict<any>) {
        Object.keys(data).forEach(key => this.data[key] = data[key]);
        this.emit(EVENT_CACHE_CHANGED, Object.assign({}, this.data));
    }
}