import { Event } from "./event";

interface Data {
    readonly key: string;
    readonly value: any;
}

export class Context {
    public readonly onChanged = new Event<Context, Data>('Context.onChanged');

    protected data: NodeJS.Dict<any>;

    constructor(data: NodeJS.ReadOnlyDict<any> = {}) {
        this.data = Context.flatten(data);
    }

    public has(key: string): boolean {
        return undefined !== this.data[key];
    }

    public get<T>(key: string): T | undefined {
        return this.data[key];
    }

    public getAll<T>(prefix: string): NodeJS.ReadOnlyDict<T> {
        const result = {};

        Object
            .keys(this.data)
            .filter(key => 0 == key.indexOf(prefix))
            .forEach(key => result[key] = this.data[key]);

        return result;
    }

    public getSafe<T>(key: string, type?: string): T {
        this.require(key, type);

        return this.data[key];
    }

    public set<T>(key: string, value: T) {
        this.data[key] = value;
        this.onChanged.emit(this, { key, value });
    }

    public require(key: string, type?: string) {
        if (!key)
            throw new Error('key is undefined');

        if (undefined === this.data[key])
            throw new Error(`missing value '${key}' in context`);

        if (type && typeof this.data[key] != type)
            throw new Error(`value '${key}' in context is not type of '${type}' (${this.data[key]})`);
    }

    protected static flatten(source: any, target = {}, rootKey?: string): any {
        for (const dataKey in source) {
            const newRootKey = rootKey
                ? `${rootKey}.${dataKey}`
                : dataKey;

            if (typeof source[dataKey] === 'object')
                this.flatten(source[dataKey], target, newRootKey)
            else
                target[newRootKey] = source[dataKey];
        }

        return target;
    }
}