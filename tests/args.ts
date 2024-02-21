/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Args } from "../src/utils";

describe.only("Args", () => {
    describe("toString()", () => {
        it("Parses args to string", () => {
            expect(Args.toString({ hello: "world" })).is.a("string");
        });

        it("Formats to --key value", () => {
            expect(Args.toString({ hello: "world" })).equals("--hello world");
        });

        it("Filters undefined and null keys", () => {
            expect(Args.toString({ hello: "world", a: undefined, b: null })).equals("--hello world");
        });

        it("Splits array to multiple args with same key", () => {
            expect(Args.toString({ a: [1, 2] })).equals("--a 1 --a 2");
        });

        it("Filters undefined and null values in arrays", () => {
            expect(Args.toString({ a: [1, 2, undefined, null] })).equals("--a 1 --a 2");
        });

        it("Param args is optional", () => {
            expect(Args.toString()).equals("");
        });

        it("Throws an Error if value is an Object", () => {
            expect(() => Args.toString({ a: {} })).throws("a is an Object");
        });
    });

    describe("toArgs()", () => {
        it("Parses args to string", () => {
            expect(Args.toArgs("--string hello world --number -1 --boolean true")).deep.equals({
                string: "hello world",
                number: -1,
                boolean: true
            });
        });
    });
});