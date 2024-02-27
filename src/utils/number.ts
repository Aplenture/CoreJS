/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

/**
 * @returns number as number.
 * @returns boolean as 1 or 0.
 * @returns string as number if valid.
 * @returns undefined otherwise.
 */
export function toNumber(value: any): number {
    if (undefined == value)
        return;

    value = Number(value);

    if (isNaN(value))
        return;

    return value;
}