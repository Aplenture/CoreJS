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
        it("Parses to json object", () => {
            const data = new Serializable();

            expect(data.toJSON()).instanceOf(Object);
        });

        it("Returns an empty Object", () => {
            const data = new Serializable();

            expect(data.toJSON()).instanceOf(Object);
            expect(data.toJSON()).is.empty;
        });
    });

    describe("toString()", () => {
        it("Parses to json string", () => {
            const data = new MySerializable("hello world");

            expect(data.toString()).equals('{"value":"hello world"}');
        });

        it("Calls this.toJSON()", () => {
            const data = new MySerializable();

            data.toString();

            expect(data.calledToJSON).is.true;
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

            data.fromJSON({});

            expect(data.calledFromJSON).is.true;
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