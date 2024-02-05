/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Cache } from "../src";

describe("Cache", () => {
    describe("instantiation", () => {
        it("fills cache with copy of givien data", () => {
            const data = { hello: "world" };
            const cache = new Cache(data);

            expect(cache.get("hello")).equals("world", "cache missmatches given data");

            data.hello = "changed";

            expect(cache.get("hello")).equals("world", "cache is not a copy of given data");
        });
    });

    describe("toJSON()", () => {
        it("returns a copy of cache data", () => {
            const data = { hello: "world" };
            const cache = new Cache(data);
            const json = cache.toJSON();

            expect(json.hello).equals("world", "JSON missmatches given data");

            data.hello = "changed";

            expect(json.hello).equals("world", "JSON is not a copy of given data");
        });
    });

    describe("toString()", () => {
        it("returns a serialization of the cache data", () => {
            const data = { hello: "world" };
            const cache = new Cache(data);

            expect(cache.toString()).equals(JSON.stringify(data));
        });
    });

    describe("serialze()", () => {
        it("returns a serialization of the cache data", () => {
            const data = { hello: "world" };
            const cache = new Cache(data);

            expect(cache.serialze()).equals(JSON.stringify(data));
        });
    });

    describe("has()", () => {
        it("returns false on unset key", () => {
            const cache = new Cache();

            expect(cache.has("key")).is.false;
        });

        it("returns true on set key", () => {
            const cache = new Cache({ key: "hello world" });

            expect(cache.has("key")).is.true;
        });

        it("returns true on null", () => {
            const cache = new Cache({ key: null });

            expect(cache.has("key")).is.true;
        });

        it("returns false on undefined", () => {
            const cache = new Cache({ key: undefined });

            expect(cache.has("key")).is.false;
        });
    });

    describe("get()", () => {
        it("returns the value of key", () => {
            const cache = new Cache({ key: 1 });

            expect(cache.get("key")).equals(1);
        });

        it("returns default on unset key", () => {
            const cache = new Cache();

            expect(cache.get("key", 2)).equals(2);
        });

        it("sets default on unset key", () => {
            const cache = new Cache();

            expect(cache.get("key", 3)).equals(3);
            expect(cache.get("key", 4)).equals(3);
        });
    });

    describe("set()", () => {
        it("sets the value of key", () => {
            const cache = new Cache();

            cache.set("key", 1);

            expect(cache.get("key")).equals(1);
        });

        it("propagates changes by onChange", () => {
            const cache = new Cache();

            let changes;

            cache.onChange.on(data => changes = data);
            cache.set("key", 1);

            expect(changes).deep.equals({ key: 1 });
        });

        it("propagates only changed value by onChange", () => {
            const cache = new Cache({ hello: "world" });

            let changes;

            cache.onChange.on(data => changes = data);
            cache.set("key", 1);

            expect(changes).deep.equals({ key: 1 });
        });
    });

    describe("deserialze()", () => {
        it("changes the cache data by object", () => {
            const data = { hello: "world" };
            const cache = new Cache();

            cache.deserialze(data);

            Object.keys(data).forEach(key => expect(cache.get(key)).equals(data[key], `cache[${key}] missmatches data[${key}]`));
        });

        it("changes the cache data by string", () => {
            const data = { hello: "world" };
            const cache = new Cache();

            cache.deserialze(JSON.stringify(data));

            Object.keys(data).forEach(key => expect(cache.get(key)).equals(data[key], `cache[${key}] missmatches data[${key}]`));
        });

        it("propagates all changes by onChange", () => {
            const data = { hello: "world", test: 1 };
            const cache = new Cache();

            let changes;

            cache.onChange.on(data => changes = data);
            cache.deserialze(data);

            expect(changes).deep.equals(data);
        });

        it("propagates all cache data by onChange", () => {
            const init = { asdf: -1 };
            const data = { hello: "world", test: 1 };
            const cache = new Cache(init);

            let changes;

            cache.onChange.on(data => changes = data);
            cache.deserialze(data);

            expect(changes).deep.equals(Object.assign({}, init, data));
        });
    });
});