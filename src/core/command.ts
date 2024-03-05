/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Controller } from "./controller";
import { Event } from "./event";
import { Handler } from "./handler";

export abstract class Command<T extends Controller<T>> extends Handler<T> {
    public abstract readonly description: string;
    public abstract readonly parameters?: any;

    constructor(name: string) {
        super(name);
    }

    public async handleEvent(event: Event): Promise<void> {
        if ((event.name == "help") ||
            (event.name == this.name && event.args.help)) {
            event.invoke({
                name: this.name,
                description: this.description,
                parameters: this.parameters
            });
        } else {
            await super.handleEvent(event);
        }
    }
}