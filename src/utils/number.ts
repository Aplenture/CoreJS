/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

export function toNumber(value: any): number {
    if (undefined == value)
        return;

    const result = Number(value);

    if (isNaN(result))
        return;

    return result;
}