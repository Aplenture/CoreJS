/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Handler } from "./handler";
import { Event } from "./event";
import { EventHandler, HandlerConfig } from "./eventHandler";

export type ActionCallback = (event: Event) => any;

export interface ActionConfig extends HandlerConfig {
    /** Called on event execution */
    readonly callback: ActionCallback;
}

/** Event handler shell for callbacks */
export class ActionHandler extends EventHandler<Handler<any>> {
    protected readonly execute: ActionCallback;

    constructor(config: ActionConfig) {
        super(config);

        this.execute = config.callback;

        if (!(this.execute instanceof Function))
            throw new Error('invalid callback function');
    }
}