/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

/**
 * Parsing from and to json object/string.
 */
export class Serializable {
    /** 
     * Parses to json string.
     * Calls this.toJSON().
     * It`s recommended to call super.toString().
     */
    public toString() {
        return JSON.stringify(this.toJSON());
    }

    /** 
     * Parses to json object.
     * It`s recommended to call super.toJSON().
     * @returns an empty Object.
     */
    public toJSON(): NodeJS.Dict<any> {
        return {};
    }

    /** 
     * Parses from json string.
     * Calls this.fromJSON().
     * It`s recommended to call super.fromString().
     */
    public fromString(data: string) {
        this.fromJSON(JSON.parse(data));
    }

    /** 
     * Parses from json object.
     * It`s recommended to call super.fromJSON().
     */
    public fromJSON(data: NodeJS.ReadOnlyDict<any>) { }
}