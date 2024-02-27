/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

/**
 * @returns true if value is 1.
 * @returns true if value is "true".
 * @returns true if value is "y".
 * @returns true if value is "yes".
 * @returns false if value is 0.
 * @returns false if value is "false".
 * @returns false if value is "n".
 * @returns false if value is "no".
 * @returns undefined otherwise.
 */
export function toBoolean(value: any): boolean {
    if (undefined == value)
        return;

    value = value
        .toString()
        .toLowerCase();

    if (value === "0") return false;
    if (value === "false") return false;
    if (value === "n") return false;
    if (value === "no") return false;

    if (value === "1") return true;
    if (value === "true") return true;
    if (value === "y") return true;
    if (value === "yes") return true;

    return undefined;
}

/**
 * @returns "true" if value is 1.
 * @returns "true" if value is "true".
 * @returns "true" if value is "y".
 * @returns "true" if value is "yes".
 * @returns "false" if value is 0.
 * @returns "false" if value is "false".
 * @returns "false" if value is "n".
 * @returns "false" if value is "no".
 * @returns "false" otherwise.
 */
export function fromBoolean(value: any): string {
    if (toBoolean(value))
        return "true"

    return "false";
}