/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

export function toBoolean(value: any): boolean {
    if (undefined == value)
        return;

    const lowercase = value
        .toString()
        .toLowerCase();

    if (lowercase === "0") return false;
    if (lowercase === "false") return false;
    if (lowercase === "n") return false;
    if (lowercase === "no") return false;

    if (lowercase === "1") return true;
    if (lowercase === "true") return true;
    if (lowercase === "y") return true;
    if (lowercase === "yes") return true;

    return undefined;
}

export function toString(value: any): string {
    if (value)
        return "1"

    return "0";
}