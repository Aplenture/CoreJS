/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Args } from "../src/utils";

describe("Args", () => {
    describe("fromArgs()", () => {
        it("Parses object to string", () => {
            expect(Args.fromArgs({ hello: "world" })).is.a("string");
        });

        it("Filters undefined and null keys", () => {
            expect(Args.fromArgs({ hello: "world", a: undefined, b: null as any })).equals("--hello world");
        });

        it("Splits array to multiple args with same key", () => {
            expect(Args.fromArgs({ a: [1, 2] })).equals("--a 1 --a 2");
        });

        it("Filters undefined and null values in arrays", () => {
            expect(Args.fromArgs({ a: [1, 2, undefined as any, null as any] })).equals("--a 1 --a 2");
        });

        it("Param args is optional", () => {
            expect(Args.fromArgs()).equals("");
        });

        it("Throws an Error if value is an Object", () => {
            expect(() => Args.fromArgs({ a: {} as any })).throws("a is an Object");
        });

        it("Param args is optional", () => {
            expect(Args.fromArgs()).equals("");
        });

        it("Returns args as '--text hello world --number 123 --boolean true'", () => {
            expect(Args.fromArgs({ text: "hello world", number: 123, boolean: true })).equals("--text hello world --number 123 --boolean true");
        });
    });

    describe("toArgs()", () => {
        it("Parses string to object", () => {
            expect(Args.toArgs("--text hello world --number 123 --boolean true")).is.a("object");
        });

        it("Filters empty keys", () => {
            expect(Args.toArgs("-- --text hello world --number 123 --boolean true")).deep.equals({
                text: "hello world",
                number: 123,
                boolean: true
            });
        });

        it("Filters invalid keys", () => {
            expect(Args.toArgs("--\n --text hello world --number 123 --boolean true")).deep.equals({
                text: "hello world",
                number: 123,
                boolean: true
            });
        });

        it("First tries to parse value to number", () => {
            const result = Args.toArgs('--number 123 --boolean 1');

            expect(result.number).is.a("number");
            expect(result.boolean).is.a("number");
        });

        it("Second tries to parse value to boolean", () => {
            const result = Args.toArgs('--boolean true --empty');

            expect(result.boolean).is.a("boolean");
            expect(result.empty).is.a("boolean");
        });

        it("Finaly parses value to string", () => {
            const result = Args.toArgs('--number "456" --boolean "true"');

            expect(result.number).is.a("string");
            expect(result.boolean).is.a("string");
        });

        it("Returns args as object", () => {
            expect(Args.toArgs("--text hello world --number 123 --boolean true")).deep.equals({
                text: "hello world",
                number: 123,
                boolean: true
            });
        });

        it("Returns array on duplicate keys", () => {
            const result = Args.toArgs("--a 1 --b 2 --a 3");

            expect(result.a).is.an("array");
            expect(result.b).is.a("number");
        });
    });
});