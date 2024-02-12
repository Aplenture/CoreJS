/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Serializable } from "../src";

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

describe("Serializable", () => {
    describe("toJSON()", () => {
        it("returns an object", () => {
            const data = new Serializable();

            expect(data.toJSON()).instanceOf(Object);
        });
    });

    describe("toString()", () => {
        it("calls toJSON()", () => {
            const data = new MySerializable();

            data.toString();

            expect(data.calledToJSON).is.true;
        });

        it("serializes to JSON string", () => {
            const data = new MySerializable("hello world");

            expect(data.toString()).equals('{"value":"hello world"}');
        });
    });

    describe("fromString()", () => {
        it("calls fromJSON()", () => {
            const data = new MySerializable();

            data.fromJSON({});

            expect(data.calledFromJSON).is.true;
        });

        it("deserializes from JSON string", () => {
            const data = new MySerializable();

            data.fromString('{"value":"hello world"}');

            expect(data.value).equals("hello world");
        });
    });
});