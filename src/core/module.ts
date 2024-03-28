/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { Serializable } from "./serializable";

/** 
 * Contains parent handling.
 */
export class Module<T extends Module<T>> extends Serializable {
    private _parent: T = null;

    public get parent(): T { return this._parent; }
    private set parent(value) { this._parent = value; }

    /**
     * Sets parent of child to this.
     * Throws an Error when parent is already this.
     * Calls child.removeFromParent() before setting parent.
     * Calls child.onAppended() after setting parent.
     * It`s recommended to call super.append().
     */
    public append(child: Module<Module<T>>): void {
        if (child.parent == this)
            throw new Error("parent is already this");

        child.removeFromParent();
        child.parent = this;
        child.onAppended();
    }

    /**
     * Unsets parent of child to null.
     * Throws an Error when parent is not this.
     * Calls child.onDepended() after setting parent.
     * It`s recommended to call super.depend().
     */
    public depend(child: Module<Module<T>>): void {
        if (child.parent != this)
            throw new Error("parent is not this");

        child.parent = null;
        child.onDepended();
    }

    /**
     * Calls parent.depend().
     * Catches unset parent.
     * It`s recommended to call super.removeFromParent().
     */
    public removeFromParent(): void {
        if (this.parent)
            this.parent.depend(this);
    }

    /**
     * Called when parent is set.
     * It`s recommended to call super.onAppended().
     */
    protected onAppended(): void { }

    /** 
     * Called when parent is unset.
     * It`s recommended to call super.onDepended().
     */
    protected onDepended(): void { }
}