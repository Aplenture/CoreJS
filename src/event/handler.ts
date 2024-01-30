/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Emitter } from "../core/emitter";
import { Handler as CoreHandler } from "../core/handler";
import { Event } from "./event";

export interface HandlerConfig {
    readonly event?: string;
    readonly emitter?: Emitter;
    readonly onParent?: boolean;
    readonly once?: boolean;
}

export abstract class Handler<T extends CoreHandler<T>> extends CoreHandler<T> {
    public readonly emitter?: Emitter;
    public readonly onParent?: boolean;
    public readonly once?: boolean;

    constructor(config: HandlerConfig = {}) {
        super(config.event);

        this.emitter = config.emitter;
        this.onParent = config.onParent;
        this.once = config.once;
    }

    public emit(event: string, args: NodeJS.ReadOnlyDict<any> = this.parent, emitter: Emitter = this.parent): Event {
        if (this.parent)
            return this.parent.emit(event, args, emitter);
    }

    public handleEvent(event: Event) {
        if (this.name != undefined && this.name != event.name)
            return;

        if (this.onParent && !this.hasParent(event.emitter))
            return;

        if (this.emitter != undefined && this.emitter != event.emitter)
            return;

        event.append(this.execute(event));

        if (this.once)
            this.parent.depend(this);
    }

    protected abstract execute(event: Event): Promise<void>;
}