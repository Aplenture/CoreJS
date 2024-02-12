/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { EVENT_ENABLED_CHANGED, CACHE_INIT, EVENT_INIT } from "../constants";
import { Controller } from "./controller";
import { Handler } from "./handler";
import { Delegatable, Delegate, DelegateCallback } from "./delegate";

export class Routine extends Handler<Controller<any>> {
    private readonly _onExecute: Delegate<number>;

    constructor(commandOrCallback: string | DelegateCallback<number>) {
        super({ event: EVENT_ENABLED_CHANGED });

        const callback = typeof commandOrCallback == "string"
            ? () => this.emit(commandOrCallback)
            : commandOrCallback;

        this._onExecute = new Delegate(callback);
    }

    public get onExecute(): Delegatable<number> { return this._onExecute; }
    public get running(): boolean { throw new Error('method not implemented'); }

    public async execute(): Promise<void> {
        if (this.parent.enabled)
            this.start();
        else
            this.stop();
    }

    public start(time = Date.now()) {
        if (this.running)
            return;

        this._onExecute.invoke(time);

        throw new Error('method not implemented');
    }

    public stop() {
        if (!this.running)
            return;

        throw new Error('method not implemented');
    }

    protected onAppended(): void {
        super.onAppended();

        // execute if app is already initialized
        // otherwise execute on init event
        if (this.parent.get(CACHE_INIT))
            this.execute();
        else
            this.parent.once(EVENT_INIT, () => this.execute());
    }

    protected onDepended(): void {
        super.onDepended();

        this.stop();
    }
}