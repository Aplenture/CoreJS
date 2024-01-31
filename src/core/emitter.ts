/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

/**
 * Basic emitter class.
 * Contains name handling.
 */
export class Emitter {
    constructor(public readonly name: string) { }

    /**
     * Returns the name.
     * @returns the name
     */
    public toString() { return this.name; }
}