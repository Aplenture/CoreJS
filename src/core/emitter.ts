/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

/**
 * basic emitter class
 * contains name handling
 */
export class Emitter {
    constructor(public readonly name: string) { }

    public toString() { return this.name; }
}