import { fromHex } from "../utils/bigMath";

export const BASE58: readonly string[] = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
]

export function random(bytes = 32): bigint {
    return fromHex(randomHex(bytes));
}

export const randomHex = (function () {
    try {
        const crypto = eval("window.crypto");

        return function (bytes = 32): string {
            if (bytes < 1)
                throw new RangeError(`bytes must be > 0`);

            return crypto.getRandomValues(new Uint8Array(bytes)).reduce((o, v) => o + ('00' + v.toString(16)).slice(-2), '');
        }
    } catch (e) { }

    try {
        const crypto = eval("require('crypto')");

        return function (bytes = 32): string {
            if (bytes < 1)
                throw new RangeError(`bytes must be > 0`);

            return crypto.randomBytes(bytes).toString('hex');
        }
    } catch (e) { }

    return function (): string {
        throw new Error(`random is not supported`);
    }
})();

/*!
 * mulberry32 seeded pseudo random function
 * https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
 */
export function randomSeeded(seed: number): number {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

export function randomRanged(max: number, min = 0, seed = Number(random(4))): number {
    return min + Math.floor(randomSeeded(seed) * (max - min + 1));
}

/**
 * Shuffles array in place
 * inspired by https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 * @param {Array} items items An array containing the items.
 */
export function shuffle<T>(items: readonly T[], seed = Number(random(4))): T[] {
    const result = Object.assign([], items);

    for (let i = items.length - 1; i > 0; --i) {
        const j = randomRanged(i, 0, seed + i);

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

export function randomPassword(blocks = 3, blocksize = 6): string {
    let result = '';

    for (let i = 0; i < blocks; ++i) {
        if (result.length)
            result += '-';

        for (let j = 0; j < blocksize; ++j)
            result += BASE58[randomRanged(BASE58.length)];
    }

    return result;
}

/**
 * random pastel color generator
 * https://stackoverflow.com/questions/43193341/how-to-generate-random-pastel-or-brighter-color-in-javascript/43195379#43195379
 * https://stackoverflow.com/a/44134328
 */
export function randomColor(): string {
    // return "hsl(" + (360 * Math.random()).toFixed(2) + ',' +
    //     (25 + 70 * Math.random()).toFixed(2) + '%,' +
    //     (85 + 10 * Math.random()).toFixed(2) + '%)';

    const h = 360 * Math.random();
    const s = (25 + 70 * Math.random()) / 100;
    const l = (85 + 10 * Math.random()) / 100;

    const a = s * Math.min(l, 1 - l);

    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };

    return `#${f(0)}${f(8)}${f(4)}`;
}