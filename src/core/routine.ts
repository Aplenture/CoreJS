/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { EVENT_ACTIVE_CHANGED, CACHE_INIT, EVENT_INIT } from "../constants";
import { Module } from "./module";
import { Controller } from "./controller";
import { Handler } from "../event/handler";

export class Routine extends Handler<Controller<any>> {
    constructor(public readonly command: string) {
        super({ event: EVENT_ACTIVE_CHANGED, onParent: true });
    }

    public get running(): boolean { throw new Error('method not implemented'); }

    public append(child: Module<Module<Controller<any>>>): void {
        super.append(child);

        // execute if app is already initialized
        // otherwise execute on init event
        if (this.get(CACHE_INIT))
            this.execute();
        else
            this.parent.once(EVENT_INIT, () => this.execute());
    }

    public depend(child: Module<Module<Controller<any>>>): void {
        super.depend(child);
        this.stop();
    }

    protected async execute(): Promise<void> {
        if (this.parent.active)
            this.start();
        else
            this.stop();
    }

    protected start() {
        if (this.running)
            return;

        this.emit(this.command);

        throw new Error('method not implemented');
    }

    protected stop() {
        if (!this.running)
            return;

        throw new Error('method not implemented');
    }
}