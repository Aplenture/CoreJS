/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { toBoolean, fromBoolean } from "../src/utils/boolean";

describe("Boolean", () => {
    describe("toBoolean()", () => {
        it("Returns true if value is 1", () => expect(toBoolean(1)).equals(true));
        it('Returns true if value is "true"', () => expect(toBoolean("true")).equals(true));
        it('Returns true if value is "y"', () => expect(toBoolean("y")).equals(true));
        it('Returns true if value is "yes"', () => expect(toBoolean("yes")).equals(true));

        it("Returns false if value is 0", () => expect(toBoolean(0)).equals(false));
        it('Returns false if value is "false"', () => expect(toBoolean("false")).equals(false));
        it('Returns false if value is "n"', () => expect(toBoolean("n")).equals(false));
        it('Returns false if value is "no"', () => expect(toBoolean("no")).equals(false));

        it('Returns undefined otherwise', () => {
            expect(toBoolean(undefined)).equals(undefined);
            expect(toBoolean(null)).equals(undefined);
            expect(toBoolean("string")).equals(undefined);
            expect(toBoolean(-1)).equals(undefined);
            expect(toBoolean({})).equals(undefined);
        });
    });

    describe("fromBoolean()", () => {
        it('Returns "true" if value is 1', () => expect(fromBoolean(1)).equals("true"));
        it('Returns "true" if value is "true"', () => expect(fromBoolean("true")).equals("true"));
        it('Returns "true" if value is "y"', () => expect(fromBoolean("y")).equals("true"));
        it('Returns "true" if value is "yes"', () => expect(fromBoolean("yes")).equals("true"));

        it('Returns "false" if value is 0', () => expect(fromBoolean(0)).equals("false"));
        it('Returns "false" if value is "false"', () => expect(fromBoolean("false")).equals("false"));
        it('Returns "false" if value is "n"', () => expect(fromBoolean("n")).equals("false"));
        it('Returns "false" if value is "no"', () => expect(fromBoolean("no")).equals("false"));

        it('Returns "false" otherwise', () => {
            expect(fromBoolean(undefined)).equals("false");
            expect(fromBoolean(null)).equals("false");
            expect(fromBoolean("string")).equals("false");
            expect(fromBoolean(-1)).equals("false");
            expect(fromBoolean({})).equals("false");
        });
    });
});