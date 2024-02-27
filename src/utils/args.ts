/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { toBoolean } from "./boolean";
import { toNumber } from "./number";

type Arg = string | number | boolean | Arg[];

/** 
 * Parses object to string.
 * Filters undefined and null keys.
 * Splits array to multiple args with same key.
 * Filters undefined and null values in arrays.
 * Throws an Error if value is an Object.
 * @param args is optional.
 * @returns args as '--text hello world --number 123 --boolean true'.
 */
export function fromArgs(args?: NodeJS.ReadOnlyDict<Arg>): string {
    if (!args)
        return "";

    return Object.keys(args)
        .filter(key => undefined != args[key])
        .map(key => {
            if (Array.isArray(args[key]))
                return (args[key] as Arg[])
                    .filter(value => undefined != value)
                    .map(value => `--${key} ${value}`)
                    .join(' ');

            if (args[key] instanceof Object)
                throw new Error(`${key} is an Object`);

            return `--${key} ${args[key]}`;
        })
        .join(' ');
}

/**
 * Parses string to object.
 * Filters empty keys.
 * Filters invalid keys.
 * First tries to parse value to number.
 * Second tries to parse value to boolean.
 * Finaly parses value to string.
 * Creates an array on duplicate keys.
 * @returns args as object.
 * @returns array on duplicate keys.
 */
export function toArgs(value: string): NodeJS.Dict<Arg> {
    const result: NodeJS.Dict<any> = {};

    // iterate all key value pairs
    value.split('--').forEach(str => {
        // filter empty keys
        if (!str)
            return;

        // filter invalid keys
        if (!/\S/.test(str))
            return;

        // split string by whitespaces
        // to calculate key and value
        const split = str.split(' ');

        // use first split as key
        // remove depending spaces from key
        const key = split[0].replace(/\s+$/, '');

        // use rest of split as value
        // remove depending spaces from value
        // use true if there are no value
        const stringValue = split.slice(1).join(' ').replace(/\s+$/, '') || "true";

        let parsedValue;

        if (parsedValue == undefined) parsedValue = toNumber(stringValue);
        if (parsedValue == undefined) parsedValue = toBoolean(stringValue);
        if (parsedValue == undefined) parsedValue = stringValue;

        // set value if key is unset
        if (undefined == result[key])
            result[key] = parsedValue;
        // push value if key is an array
        else if (Array.isArray(result[key]))
            result[key].push(parsedValue);
        // make key to array if there is already a value
        else
            result[key] = [result[key], parsedValue];
    });

    return result;
}