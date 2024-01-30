/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Module } from "./module";

export class Handler<T extends Handler<T>> extends Module<T> {
    protected get<T>(key: string): T {
        if (this.parent)
            return this.parent.get(key);
    }

    protected set(key: string, value: any) {
        if (this.parent)
            this.parent.set(key, value);
    }
}