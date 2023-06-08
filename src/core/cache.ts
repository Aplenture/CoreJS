import { Config } from "./config";
import { Event } from "./event";

interface Data {
    readonly key: string;
    readonly value: any;
}

export class Cache extends Config {
    public readonly onChanged = new Event<Cache, Data>('Cache.onChanged');

    public set<T>(key: string, value: T) {
        this.data[key] = value;
        this.onChanged.emit(this, { key, value });
    }
}