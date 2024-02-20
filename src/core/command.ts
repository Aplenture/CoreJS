/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Controller } from "./controller";
import { Handler } from "./handler";

export abstract class Command<T extends Controller<T>> extends Handler<T> {
    public abstract readonly description: string;

    constructor(name: string) {
        super(name);
    }
}