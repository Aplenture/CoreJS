/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { toBoolean } from "./boolean";
import { toNumber } from "./number";

/** 
 * Parses args to string.
 * Formats to --key value.
 * Filters undefined and null keys.
 * Splits array to multiple args with same key.
 * Filters undefined and null values in arrays.
 * Throws an Error if value is an Object.
 * @param args is optional.
 * @returns args as string.
 */
export function toString(args?: NodeJS.ReadOnlyDict<any>): string {
    if (!args)
        return "";

    return Object.keys(args)
        .filter(key => undefined != args[key])
        .map(key => {
            if (Array.isArray(args[key]))
                return args[key]
                    .filter(value => undefined != value)
                    .map(value => `--${key} ${value}`)
                    .join(' ');

            if (args[key] instanceof Object)
                throw new Error(`${key} is an Object`);

            return `--${key} ${args[key]}`;
        })
        .join(' ');
}

export function toArgs(value: string): NodeJS.Dict<any> {
    const result: NodeJS.Dict<any> = {};

    value.split('--').forEach(str => {
        if (!str)
            return;

        if (!/\S/.test(str))
            return;

        const split = str.split(' ');
        const key = split[0].replace(/\s+$/, '');
        const text: any = split.slice(1).join(' ').replace(/\s+$/, '') || "1";

        let value: any = toBoolean(text);

        if (value == undefined) value = toNumber(text);
        if (value == undefined) value = text;

        if (undefined == result[key])
            result[key] = value;
        else if (Array.isArray(result[key]))
            result[key].push(value);
        else
            result[key] = [result[key], value];
    });

    return result;
}