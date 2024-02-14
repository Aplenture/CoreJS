/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { App } from "../src";
import { EVENT_CACHE_CHANGED, EVENT_INIT } from "../src/constants";

describe("App", () => {
    describe("get/set", () => {
        it("get and sets values", () => {
            const app = new App("app");

            app.set("hello", "world");

            expect(app.get("hello")).equals("world");
        });

        it("emits changes", done => {
            const app = new App("app");

            let changes;

            app.on(EVENT_CACHE_CHANGED, async event => changes = event.args);
            app.set("test", 1);
            app.set("other", 2);

            Promise
                .resolve()
                .then(() => expect(changes).deep.equals({ "other": 2 }))
                .then(() => done())
                .catch(done);
        });
    });

    describe("init()", () => {
        it("emits event init", done => {
            const app = new App("app");

            app.once(EVENT_INIT, async () => done());
            app.init();
        });

        it("sets init value to true", () => {
            const app = new App("app");

            app.init();

            expect(app.initialized).equals(true);
        });
    });

    describe("serialization", () => {
        it("serializes cache", () => {
            const app = new App("app");

            app.set("hello", "world");

            expect(app.toJSON()).deep.contains({ cache: { data: { hello: "world" } } });
        });

        it("deseserializes cache", () => {
            const app = new App("app");

            app.fromJSON({ cache: { data: { hello: "world" } } });

            expect(app.get("hello")).equals("world");
        });

        it("emits all cache data", done => {
            const data = { one: 1, two: "2" };
            const app = new App("app");
            const expected = Object.assign({ "three": 3 }, data);

            let result;

            app.on(EVENT_CACHE_CHANGED, async event => result = event.args);
            app.set("three", 3);
            app.fromJSON({ cache: { data } });

            Promise
                .resolve()
                .then(() => expect(result).deep.contains(expected))
                .then(() => done())
                .catch(done);
        });
    });
});