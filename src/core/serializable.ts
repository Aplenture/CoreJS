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
     * Parses to string.
     * Calls this.toJSON().
     * It`s recommended to call super.toString().
     * @returns json string.
     */
    public toString(): string {
        return JSON.stringify(this.toJSON());
    }

    /** 
     * Parses to object.
     * It`s recommended to call super.toJSON().
     * @returns empty Object.
     */
    public toJSON(): NodeJS.Dict<any> {
        return {};
    }

    /** 
     * Parses from string.
     * Calls this.fromJSON().
     * It`s recommended to call super.fromString().
     * @argument data json string, throws an Error on invalid format.
     */
    public fromString(data: string): void {
        try {
            data = JSON.parse(data);
        } catch (error) {
            throw new Error("invalid json format");
        }

        this.fromJSON(data as any);
    }

    /** 
     * Parses from object.
     * It`s recommended to call super.fromJSON().
     */
    public fromJSON(data: NodeJS.ReadOnlyDict<any>): void { }
}