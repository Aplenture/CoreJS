export const NEGATIVE_ONE = BigInt(-1);
export const ZERO = BigInt(0);
export const ONE = BigInt(1);

export function fromHex(hex: string): bigint {
    return BigInt('0x' + hex);
}

export function toHex(value: bigint | number | string, length?: number): string {
    if (length)
        return value.toString(16).padStart(length, '0');

    return value.toString(16);
}

export function calcLength(value: bigint): number {
    return value.toString(2).length;
}

// Extended Euclidean algorithm
export function calcEGCD(a: bigint, b: bigint): {
    readonly g: bigint;
    readonly x: bigint;
    readonly y: bigint;
} {
    if (a <= ZERO || b <= ZERO)
        throw new RangeError('a and b must be > 0');

    let x = ZERO;
    let y = ONE;
    let u = ONE;
    let v = ZERO;

    let q: bigint;
    let r: bigint;
    let m: bigint;
    let n: bigint;

    while (a !== ZERO) {
        q = b / a;
        r = b % a;
        m = x - (u * q);
        n = y - (v * q);
        b = a;
        a = r;
        x = u;
        y = v;
        u = m;
        v = n;
    }

    return {
        g: b,
        x: x,
        y: y
    }
}

export function calcMod(v: bigint, m: bigint): bigint {
    return (v % m + m) % m;
}

export function calcModInv(v: bigint, m: bigint): bigint {
    const tmp = calcEGCD(calcMod(v, m), m);

    if (tmp.g != ONE)
        throw new RangeError(`${v.toString()} does not have inverse modulo ${m.toString()}`);

    return calcMod(tmp.x, m);
}

export function byteLength(value: bigint): number {
    return Math.ceil(value.toString(2).length / 8);
}