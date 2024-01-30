/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Handler as CoreHandler } from "../core/handler";
import { Event } from "./event";
import { Handler as EventHandler, HandlerConfig } from "./handler";

type Execute = (event: Event) => Promise<void>;

export interface ActionConfig extends HandlerConfig {
    readonly callback: Execute;
}

export class Action extends EventHandler<CoreHandler<any>> {
    protected readonly execute: Execute;

    constructor(config: ActionConfig) {
        super(config);

        this.execute = config.callback;

        if (!(this.execute instanceof Function))
            throw new Error('invalid callback function');
    }
}