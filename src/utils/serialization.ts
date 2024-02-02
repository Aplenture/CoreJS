/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

export function toString(args: NodeJS.ReadOnlyDict<any> = {}): string {
    return "" + Object.keys(args)
        .filter(key => undefined !== args[key])
        .sort((a, b) => a.localeCompare(b))
        .map(key => `--${key} ${args[key]}`)
        .join(' ');
}