/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { App } from "../src";
import { CACHE_INIT, EVENT_CACHE_CHANGED, EVENT_INIT } from "../src/constants";

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

            app.on(EVENT_INIT, async () => done());
            app.init();
        });

        it("sets init value to true", () => {
            const app = new App("app");

            app.init();

            expect(app.get(CACHE_INIT)).equals(true);
        });
    });

    describe("serialization", () => {
        it("serializes cache", () => {
            const app = new App("app");

            app.set("hello", "world");

            expect(app.serialze()).contains('"hello":"world"');
        });

        it("seserializes cache", () => {
            const app = new App("app");

            app.deserialze({ hello: "world" });

            expect(app.get("hello")).equals("world");
        });

        it("emits all cache data", done => {
            const data = { one: 1, two: "2" };
            const app = new App("app");

            let changes;

            app.on(EVENT_CACHE_CHANGED, async event => changes = event.args);
            app.set("three", 3);
            app.deserialze(data);

            Promise
                .resolve()
                .then(() => expect(changes).deep.equals(Object.assign({ "three": 3 }, data)))
                .then(() => done())
                .catch(done);
        });
    });
});