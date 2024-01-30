/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

type Callback<T> = (data: T) => void;

export interface Delegatable<T> {
    readonly on: (...actions: Callback<T>[]) => void;
    readonly once: (action: Callback<T>) => void;
    readonly off: (action: Callback<T>) => void;
}

export class Delegate<T> implements Delegatable<T> {
    private actions: Callback<T>[] = [];

    constructor(...actions: Callback<T>[]) {
        this.on(...actions);
    }

    public get length() { return this.actions.length; }

    public on(...actions: Callback<T>[]) {
        this.actions.push(...actions);
    }

    public once(action: Callback<T>) {
        const tmp = args => {
            action(args);
            this.off(tmp);
        };

        this.actions.push(tmp);
    }

    public off(action: Callback<T>) {
        this.actions = this.actions.filter(tmp => tmp != action);
    }

    public invoke(args: T) {
        this.actions.forEach(action => action(args));
    }
}