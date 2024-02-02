/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { CacheController } from "../src";
import { COMMAND_GET, COMMAND_SET, EVENT_CACHE_CHANGED } from "../src/constants";

describe("CacheController", () => {
    describe("event handling", () => {
        describe("set()", () => {
            it("emits changes", done => {
                const controller = new CacheController("controller");

                let changes;

                controller.on(EVENT_CACHE_CHANGED, async event => changes = event.args);
                controller.set("test", 1);
                controller.set("other", 2);

                Promise
                    .resolve()
                    .then(() => expect(changes).deep.equals({ "other": 2 }))
                    .then(() => done())
                    .catch(done);
            });
        });

        describe("deserialize()", () => {
            it("emits all cache data", done => {
                const data = { one: 1, two: "2" };
                const controller = new CacheController("controller");

                let changes;

                controller.on(EVENT_CACHE_CHANGED, async event => changes = event.args);
                controller.set("three", 3);
                controller.deserialze(data);

                Promise
                    .resolve()
                    .then(() => expect(changes).deep.equals(Object.assign({ "three": 3 }, data)))
                    .then(() => done())
                    .catch(done);
            });
        });
    });

    describe("commands", () => {
        describe("get", () => {
            it("returns the value of key", done => {
                const controller = new CacheController("controller");

                controller.set("test", 1);

                controller
                    .emit(COMMAND_GET, { key: "test" })
                    .await()
                    .then(data => expect(data).equals(1))
                    .then(() => done())
                    .catch(done);
            });
        });

        describe("set", () => {
            it("sets the value of key", done => {
                const controller = new CacheController("controller");

                controller.emit(COMMAND_SET, { key: "test", value: 2 });

                Promise
                    .resolve()
                    .then(() => expect(controller.get("test")).equals(2))
                    .then(() => done())
                    .catch(done);
            });
        });
    });
});