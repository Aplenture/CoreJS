/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Event } from "./event";

/**
 * Basic module class.
 * Contains parent handling.
 */
export class Module<T extends Module<T>> {
    private _parent: T = null;

    constructor(public readonly name: string) { }

    /** Parent module. */
    public get parent() { return this._parent; }
    private set parent(value) { this._parent = value; }

    /**
     * First calls removeFromParent().
     * Then changes the parent of a module to this.
     * @param child where to change the parent
     */
    public append(child: Module<Module<T>>) {
        child.removeFromParent();
        child.parent = this;
    }

    /**
     * Removes the parent if its a child from this.
     * @param child where to remove the parent
     */
    public depend(child: Module<Module<T>>) {
        if (child.parent != this)
            throw new Error('wrong parent');

        child.parent = null;
    }

    /**
     * Calls depend by parent if parent is set.
     */
    public removeFromParent() {
        if (this.parent)
            this.parent.depend(this);
    }

    /**
     * Emits an event to parent if parent is set.
     * @param event name of event
     * @param args arguments of event, default is this
     * @param emitter emitter of event, default is this
     * @returns an event
     */
    public emit(event: string, args: NodeJS.ReadOnlyDict<any> = this, emitter: string = this.name, timestamp?: number): Event {
        if (this.parent)
            return this.parent.emit(event, args, emitter, timestamp);
    }
}