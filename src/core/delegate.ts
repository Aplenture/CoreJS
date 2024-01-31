/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

export type DelegateCallback<T> = (data: T) => void;

/**
 * delegate interface without invoke api
 */
export interface Delegatable<T> {
    readonly length: number;

    readonly on: (...actions: DelegateCallback<T>[]) => void;
    readonly once: (action: DelegateCallback<T>) => void;
    readonly off: (action: DelegateCallback<T>) => void;
}

/**
 * allows multiple callback handling
 */
export class Delegate<T> implements Delegatable<T> {
    private callbacks: DelegateCallback<T>[] = [];

    constructor(...callbacks: DelegateCallback<T>[]) {
        this.on(...callbacks);
    }

    /**
     * number of callbacks
     */
    public get length() { return this.callbacks.length; }

    /**
     * adds an invokable callback
     * @param callback called on invoke
     */
    public on(...callback: DelegateCallback<T>[]) {
        this.callbacks.push(...callback);
    }

    /**
     * adds an invokeable callback which is called once
     * after fist call its removed automatically
     * @param callback called once on invoke
     */
    public once(callback: DelegateCallback<T>) {
        const tmp = args => {
            callback(args);
            this.off(tmp);
        };

        this.callbacks.push(tmp);
    }

    /**
     * removes a callback
     * @param callback will be removed
     */
    public off(callback: DelegateCallback<T>) {
        this.callbacks = this.callbacks.filter(tmp => tmp != callback);
    }

    /**
     * calls all added callbacks
     * @param args for callbacks
     */
    public invoke(args: T) {
        this.callbacks.forEach(action => action(args));
    }
}