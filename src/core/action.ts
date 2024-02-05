/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Controller } from "./controller";
import { Event } from "./event";
import { Handler, HandlerConfig } from "./handler";

export type ActionCallback = (event: Event) => Promise<any>;

export interface ActionConfig extends HandlerConfig {
    /** Called on event execution */
    readonly callback?: ActionCallback;
}

/** Event handler shell for callbacks */
export class Action extends Handler<Controller<any>> {
    protected readonly execute: ActionCallback;

    /**
     * @param config config, event name or callback
     * @param callback callback
     */
    constructor(config: ActionConfig | string | ActionCallback, callback?: ActionCallback) {
        super(!(config instanceof Function) && config);

        if (config instanceof Function)
            this.execute = config;
        else if (config instanceof Object && config.callback instanceof Function)
            this.execute = config.callback;
        else if (callback instanceof Function)
            this.execute = callback

        if (!(this.execute instanceof Function))
            throw new Error('invalid callback function');
    }
}