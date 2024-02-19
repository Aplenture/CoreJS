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
            const cache = new Cache("cache", data);

            expect(cache.get("hello")).equals("world", "cache missmatches given data");

            data.hello = "changed";

            expect(cache.get("hello")).equals("world", "cache is not a copy of given data");
        });
    });

    describe("has()", () => {
        it("returns false on unset key", () => {
            const cache = new Cache("cache");

            expect(cache.has("key")).is.false;
        });

        it("returns true on set key", () => {
            const cache = new Cache("cache", { key: "hello world" });

            expect(cache.has("key")).is.true;
        });

        it("returns true on null", () => {
            const cache = new Cache("cache", { key: null });

            expect(cache.has("key")).is.true;
        });

        it("returns false on undefined", () => {
            const cache = new Cache("cache", { key: undefined });

            expect(cache.has("key")).is.false;
        });
    });

    describe("get()", () => {
        it("returns the value of key", () => {
            const cache = new Cache("cache", { key: 1 });

            expect(cache.get("key")).equals(1);
        });

        it("returns default on unset key", () => {
            const cache = new Cache("cache");

            expect(cache.get("key", 2)).equals(2);
        });

        it("sets default on unset key", () => {
            const cache = new Cache("cache");

            expect(cache.get("key", 3)).equals(3);
            expect(cache.get("key", 4)).equals(3);
        });
    });

    describe("set()", () => {
        it("sets the value of key", () => {
            const cache = new Cache("cache");

            cache.set("key", 1);

            expect(cache.get("key")).equals(1);
        });

        // it("propagates changes by onChange", () => {
        //     const cache = new Cache("cache");

        //     let changes;

        //     cache.onChange.on(data => changes = data);
        //     cache.set("key", 1);

        //     expect(changes).deep.equals({ key: 1 });
        // });

        // it("propagates only changed value by onChange", () => {
        //     const cache = new Cache("cache", { hello: "world" });

        //     let changes;

        //     cache.onChange.on(data => changes = data);
        //     cache.set("key", 1);

        //     expect(changes).deep.equals({ key: 1 });
        // });
    });

    describe("serialization", () => {
        describe("toJSON()", () => {
            it("serializes cache data", () => {
                const data = { hello: "world", a: "b" };
                const cache = new Cache("cache", data);
                const json = cache.toJSON();

                expect(json).deep.contains({ data });
            });
        });

        describe("fromJSON()", () => {
            it("deserialized the cache data", () => {
                const data = { hello: "world", a: "b" };
                const cache = new Cache("cache");

                cache.fromJSON({ data });

                expect(cache.get("hello")).equals("world");
                expect(cache.get("a")).equals("b");
            });

            // it("propagates all changes by onChange", () => {
            //     const data = { hello: "world", test: 1 };
            //     const cache = new Cache("cache");

            //     let changes;

            //     cache.onChange.on(data => changes = data);
            //     cache.fromJSON({ data });

            //     expect(changes).deep.equals(data);
            // });

            // it("propagates all cache data by onChange", () => {
            //     const init = { asdf: -1 };
            //     const data = { hello: "world", test: 1 };
            //     const cache = new Cache("cache", init);
            //     const expected = Object.assign({}, init, data);

            //     let changes;

            //     cache.onChange.on(data => changes = data);
            //     cache.fromJSON({ data });

            //     expect(changes).deep.equals(expected);
            // });
        });
    });
});