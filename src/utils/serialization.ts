/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

/** 
 * Parses args to string.
 * Example { test: "hello world", enabled: true } to '--test hello world --enabled true'.
 */
export function toString(args: NodeJS.ReadOnlyDict<any> = {}): string {
    return "" + Object.keys(args)
        .filter(key => undefined !== args[key])
        .map(key => `--${key} ${args[key]}`)
        .join(' ');
}