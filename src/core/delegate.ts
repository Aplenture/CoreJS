/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

export type DelegateCallback<T> = (data: T) => void;

/** Delegate interface without invoke api. */
export interface Delegatable<T> {
    /** Number of added callbacks. */
    readonly length: number;

    /**
     * Adds an invokable callback.
     * @param callback called on invoke
     */
    readonly on: (...callbacks: DelegateCallback<T>[]) => void;

    /**
     * Adds an invokeable callback which is called once.
     * After fist call its removed automatically.
     * @param callback called once on invoke
     */
    readonly once: (callback: DelegateCallback<T>) => void;

    /**
     * Removes a callback.
     * @param callback will be removed
     */
    readonly off: (callback: DelegateCallback<T>) => void;

    /** Returns a promise to await next invoke. */
    readonly await: () => Promise<T>;
}

/** Allows multiple callback handling. */
export class Delegate<T> implements Delegatable<T> {
    private callbacks: DelegateCallback<T>[] = [];

    constructor(...callbacks: DelegateCallback<T>[]) {
        this.on(...callbacks);
    }

    public get length() { return this.callbacks.length; }

    public on(...callbacks: DelegateCallback<T>[]) {
        this.callbacks.push(...callbacks);
    }

    public once(callback: DelegateCallback<T>) {
        const onceCallback = data => {
            callback(data);
            this.off(onceCallback);
        };

        this.on(onceCallback);
    }

    public off(callback: DelegateCallback<T>) {
        this.callbacks = this.callbacks.filter(tmp => tmp != callback);
    }

    public await() {
        return new Promise<T>(resolve => this.once(data => resolve(data)));
    }

    /**
     * Calls all added callbacks.
     * @param data for callbacks
     */
    public invoke(data: T) {
        this.callbacks.forEach(action => action(data));
    }
}