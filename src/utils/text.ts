import { toHash } from "../crypto";

const STRING_FALSE = "false";
const STRING_TRUE = "true";
const STRING_N = "n";
const STRING_NO = "no";
const STRING_Y = "y";
const STRING_YES = "yes";

interface CurrencyOptions {
    readonly locales?: string;
    readonly currency?: string;
    readonly digits?: number;
}

export function parseToTime(value: string | number | undefined): number {
    if (undefined === value)
        return;

    if (!isNaN(Number(value)))
        value = Number(value);

    const result = new Date(value).getTime();

    if (isNaN(result))
        return;

    return result;
}

export function parseToString(value: any): string {
    if (undefined === value)
        return;

    return value.toString();
}

export function parseToNumber(value: string | number | undefined): number {
    if (undefined === value)
        return;

    const result = Number(value);

    if (isNaN(result))
        return;

    return result;
}

export function parseToBool(value: string | number | boolean | undefined): boolean {
    if (undefined === value)
        return;

    const lowercase = value
        .toString()
        .toLowerCase();

    if (lowercase === STRING_FALSE) return false;
    if (lowercase === STRING_N) return false;
    if (lowercase === STRING_NO) return false;

    if (lowercase === STRING_TRUE) return true;
    if (lowercase === STRING_Y) return true;
    if (lowercase === STRING_YES) return true;

    const number = Number(value);

    if (isNaN(number)) return true;
    if (number != 0) return true;

    return false;
}

export function parseFromBool(value: any): string {
    return value
        ? STRING_TRUE
        : STRING_FALSE;
}

export function parseToJSON<T>(data: string, def?: T): T {
    try {
        return JSON.parse(data) as T;
    } catch (e) {
        return def;
    }
}

export function toFirstUpperCase(value: string): string {
    return value[0].toUpperCase() + value.slice(1).toLowerCase();
}

export function toFirstLowerCase(value: string): string {
    return value[0].toLowerCase() + value.slice(1);
}

export function encodeString(value: string): string {
    return encodeURIComponent(value);
}

export function decodeString(value: string): string {
    return decodeURIComponent(value);
}

export function hexToByte(hex: string, index = 0): number {
    return parseInt(hex.substr(index * 2, 2), 16);
}

export function bitsToString(value: number): string {
    let result = '';

    for (let i = 1; i <= 32; ++i)
        result += 0 == (value & (1 << i)) ? '0' : '1';

    return result;
}

export function parseArgsFromString(value: string): NodeJS.Dict<string | readonly string[]> {
    const result: NodeJS.Dict<string | string[]> = {};

    value.split('--').forEach(str => {
        if (!str)
            return;

        if (!/\S/.test(str))
            return;

        const split = str.split(' ');
        const key = split[0].replace(/\s+$/, '');
        const value = split.slice(1).join(' ').replace(/\s+$/, '') || "1";

        if (undefined == result[key])
            result[key] = value;
        else if (Array.isArray(result[key]))
            (result[key] as string[]).push(value);
        else
            result[key] = [result[key] as string, value];
    });

    return result;
}

export function parseArgsToString(args: NodeJS.ReadOnlyDict<string | readonly string[]>): string {
    return Object.keys(args)
        .map(key => `--${key} ${args[key]}`)
        .join(' ');
}

export function parseToNumeric(value: string): string {
    return value.replace(/[^0-9\-]/g, '') || '0';
}

export function formatCurrency(value = 0, options: CurrencyOptions = {}): string {
    return (value / 100).toLocaleString(options.locales, {
        style: 'currency',
        currency: options.currency || 'EUR',
        minimumFractionDigits: undefined == options.digits ? 2 : options.digits
    });
}

export function generateColor(text: string): string {
    return (
        parseInt(
            parseInt(toHash(text), 36)
                .toExponential()
                .slice(2, -5)
            , 10) & 0xFFFFFF
    ).toString(16).toUpperCase();
}

export function URLParamsToString(params: NodeJS.Dict<any> = {}): string {
    if (!params)
        return '';

    const args = [];

    for (const key in params) {
        if (typeof params[key] == 'boolean')
            args.push(`${key}=${params[key] ? 1 : 0}`);
        else if (Array.isArray(params[key]))
            (params[key] as any).forEach(value => args.push(`${key}=${encodeString(value)}`));
        else
            args.push(`${key}=${encodeString(params[key] as any)}`)
    }

    return args.join('&');
}