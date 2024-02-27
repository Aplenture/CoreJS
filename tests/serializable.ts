/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Serializable } from "../src";

describe("Serializable", () => {
    describe("toJSON()", () => {
        it("Parses to object", () => {
            const data = new Serializable();

            expect(data.toJSON()).instanceOf(Object);
        });

        it("Returns empty Object", () => {
            const data = new Serializable();

            expect(data.toJSON()).instanceOf(Object);
            expect(data.toJSON()).is.empty;
        });
    });

    describe("toString()", () => {
        it("Parses to string", () => {
            const data = new MySerializable("hello world");

            expect(data.toString()).is.a('string');
        });

        it("Calls this.toJSON()", () => {
            const data = new MySerializable();

            data.toString();

            expect(data.calledToJSON).is.true;
        });

        it("Returns json string", () => {
            const data = new MySerializable("hello world");

            expect(data.toString()).equals('{"value":"hello world"}');
        });
    });

    describe("fromString()", () => {
        it("Parses from json string", () => {
            const data = new MySerializable();

            data.fromString('{"value":"hello world"}');

            expect(data.value).equals("hello world");
        });

        it("Calls this.fromJSON()", () => {
            const data = new MySerializable();

            data.fromString("{}");

            expect(data.calledFromJSON).is.true;
        });

        it("Argument data json string, throws an Error on invalid format", () => {
            const data = new MySerializable("hello world");

            expect(() => data.fromString("hello world")).throws("invalid json format");
        });

        it("Returns void", () => {
            const data = new Serializable();

            expect(data.fromString("{}")).is.undefined;
        });
    });

    describe("fromJSON()", () => {
        it("Returns void", () => {
            const data = new Serializable();

            expect(data.fromJSON({})).is.undefined;
        });
    });
});

class MySerializable extends Serializable {
    public calledToJSON = false;
    public calledFromJSON = false;

    constructor(public value?: any) {
        super();
    }

    public toJSON(): NodeJS.Dict<any> {
        const data = super.toJSON();

        this.calledToJSON = true;
        data.value = this.value;

        return data;
    }

    public fromJSON(data: NodeJS.ReadOnlyDict<any>): void {
        super.fromJSON(data);

        this.calledFromJSON = true;
        this.value = data.value;
    }
}