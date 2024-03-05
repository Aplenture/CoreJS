/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Cache } from "../src";

class MyCache extends Cache {
    public setCalledData = {};

    public set(key: string, value: any): void {
        this.setCalledData[key] = value;
        super.set(key, value);
    }
}

describe("Cache", () => {
    describe("constructor()", () => {
        it("Param data copy of initial cache data", () => {
            const data = { hello: "world" };
            const cache = new Cache(data);

            data.hello = "changed";

            expect(cache.get("hello")).equals("world");
        });
    });

    describe("has()", () => {
        it("Returns true when value of key is set. Otherwise false is returned", () => {
            const data = { set: "hello world" };
            const cache = new Cache(data);

            expect(cache.has("set")).is.true;
            expect(cache.has("unset")).is.false;
        });
    });

    describe("get()", () => {
        it("Throws an Error if key is not a string", () => {
            const cache = new Cache();

            expect(() => cache.get({} as any)).throws("key needs to be a string");
        });

        it("Param _default optional default value", () => {
            const cache = new Cache();

            expect(() => cache.get("test")).not.throws(Error);
        });

        it("Returns value of given key if set", () => {
            const cache = new Cache({ hello: "world" });

            expect(cache.get("hello")).equals("world");
        });

        it("Returns otherwise _default if set", () => {
            const def = "default";
            const cache = new Cache();

            expect(cache.get("hello", def)).equals(def);
        });

        it("Returns otherwise undefined", () => {
            const cache = new Cache();

            expect(cache.get("hello")).is.undefined;
        });
    });

    describe("set()", () => {
        it("Sets the value of given key", () => {
            const key = "hello";
            const value = "world";
            const cache = new Cache();

            cache.set(key, value);

            expect(cache.get(key)).equals(value);
        });

        it("Throws an Error if key is not a string", () => {
            const cache = new Cache();

            expect(() => cache.set({} as any, 1)).throws("key needs to be a string");
        });

        it("Returns undefined", () => {
            const cache = new Cache();

            expect(cache.set("hello", "world")).is.undefined;
        });
    });

    describe("toJSON()", () => {
        it("Returns object with data of cache", () => {
            const data = { hello: "world" };
            const cache = new Cache(data);

            expect(cache.toJSON().data).deep.equals(data);
        });
    });

    describe("fromJSON()", () => {
        it("Parses cache data from object", () => {
            const data = { hello: "world" };
            const cache = new Cache();

            cache.fromJSON({ data });

            expect(cache.get("hello")).equals(data.hello);
        });

        it("Calls set() for every key value pair in data", () => {
            const data = {
                hello: "world",
                additional: 1
            };

            const cache = new MyCache();

            cache.fromJSON({ data });

            Object.keys(data).forEach(key => expect(cache.setCalledData[key]).equals(data[key]));
        });

        it("Returns undefined", () => {
            const cache = new Cache();

            expect(cache.fromJSON({ hello: "world" })).is.undefined;
        });
    });
});