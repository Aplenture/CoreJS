/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { toNumber } from "../src/utils/number";

describe("Number", () => {
    describe("toNumber()", () => {
        it("Returns number as number", () => {
            expect(toNumber(Number.MAX_SAFE_INTEGER)).equals(Number.MAX_SAFE_INTEGER);
            expect(toNumber(1)).equals(1);
            expect(toNumber(0.00001)).equals(0.00001);
            expect(toNumber(0)).equals(0);
            expect(toNumber(-0.00001)).equals(-0.00001);
            expect(toNumber(-1)).equals(-1);
            expect(toNumber(Number.MIN_SAFE_INTEGER)).equals(Number.MIN_SAFE_INTEGER);
        });

        it("Returns boolean as 1 or 0", () => {
            expect(toNumber(true)).equals(1);
            expect(toNumber(false)).equals(0);
        });

        it("Returns string as number if valid", () => {
            expect(toNumber(Number.MAX_SAFE_INTEGER.toString())).equals(Number.MAX_SAFE_INTEGER);
            expect(toNumber("1")).equals(1);
            expect(toNumber("0.00001")).equals(0.00001);
            expect(toNumber("0")).equals(0);
            expect(toNumber("-0.00001")).equals(-0.00001);
            expect(toNumber("-1")).equals(-1);
            expect(toNumber(Number.MIN_SAFE_INTEGER.toString())).equals(Number.MIN_SAFE_INTEGER);
        });

        it('Returns undefined otherwise', () => {
            expect(toNumber(undefined)).equals(undefined);
            expect(toNumber(null)).equals(undefined);
            expect(toNumber({})).equals(undefined);
            expect(toNumber("string")).equals(undefined);
            expect(toNumber("true")).equals(undefined);
            expect(toNumber("false")).equals(undefined);
        });
    });
});