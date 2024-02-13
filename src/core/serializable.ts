/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

/** Basic serialization handling. */
export class Serializable {
    /** 
     * Serializes the module in JSON string.
     * It`s recommended to call super.toString().
     */
    public toString() {
        return JSON.stringify(this.toJSON());
    }

    /** 
     * Serializes to JSON object.
     * It`s recommended to call super.toJSON().
     */
    public toJSON(): NodeJS.Dict<any> {
        return {};
    }

    /** 
     * Deserializes from JSON string.
     * It`s recommended to call super.fromString().
     */
    public fromString(data: string) {
        this.fromJSON(JSON.parse(data));
    }

    /** 
     * Deserializes from JSON object.
     * It`s recommended to call super.fromJSON().
     */
    public fromJSON(data: NodeJS.ReadOnlyDict<any>) { }
}