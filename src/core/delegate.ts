/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

export type DelegateCallback<T> = (data: T) => void;

/**
 * Delegate interface without invoke api.
 */
export interface Delegatable<T> {
    /**
     * Number of added callbacks.
     */
    readonly length: number;

    /**
     * Adds invokable callbacks which are called every invoke().
     */
    readonly on: (...callbacks: DelegateCallback<T>[]) => void;

    /**
     * Adds an invokeable callback which is called only once by invoke().
     */
    readonly once: (callback: DelegateCallback<T>) => void;

    /**
     * Removes a callback.
     * Also a callback added by once().
     */
    readonly off: (callback: DelegateCallback<T>) => void;

    /**
     * @param callback called once on invoke() with invoke data.
     * @returns Promise which is resolved on callback if given.
     * @returns otherwise Promise which is resolved on invoke().
     */
    readonly then: <U>(callback?: (data: T) => U | PromiseLike<U>) => Promise<U>;
}

/**
 * Handles multiple callbacks.
 */
export class Delegate<T> implements Delegatable<T> {
    private callbacks: DelegateCallback<T>[];

    /**
     * Handles multiple callbacks.
     * @param callbacks called every invoke(). 
     */
    constructor(...callbacks: DelegateCallback<T>[]) {
        this.callbacks = callbacks;
    }

    public get length(): number { return this.callbacks.length; }

    public on(...callbacks: DelegateCallback<T>[]): void {
        this.callbacks.push(...callbacks);
    }

    public once(callback: DelegateCallback<T>): void {
        const removeCallback = () => {
            this.off(callback);
            this.off(removeCallback);
        };

        this.on(callback);
        this.on(removeCallback);
    }

    public off(callback: DelegateCallback<T>): void {
        this.callbacks = this.callbacks.filter(tmp => tmp != callback);
    }

    public then<U>(callback?: (data: T) => U | PromiseLike<U>): Promise<U> {
        return new Promise<T>(resolve => this.once(data => resolve(data)))
            .then(callback);
    }

    /**
     * Calls all added callbacks.
     * @param data given to callbacks.
     */
    public invoke(data: T): void {
        this.callbacks.forEach(action => action(data));
    }
}