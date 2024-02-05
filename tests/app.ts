/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { App } from "../src";
import { CACHE_INIT, EVENT_INIT } from "../src/constants";

describe("App", () => {
    describe("get/set", () => {
        it("get and sets values", () => {
            const app = new App("app");

            app.set("hello", "world");

            expect(app.get("hello")).equals("world");
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
    });
});