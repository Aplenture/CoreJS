/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Event, Module } from "../src";
import { Serialization, Time } from "../src/utils";

describe("Event", () => {
    describe("onData", () => {
        it("sends multiple data", () => {
            const event = new Event("event", {}, "emitter");

            let result = 0;

            event.onData.on(data => result += data);
            event.send(1);
            event.send(2);

            expect(result).equals(3);
        });
    });

    describe("await()", () => {
        it("returns already propagated data", done => {
            const event = new Event("event", {}, "emitter");

            event.send(1);

            event
                .await()
                .then(data => expect(data).equals(1))
                .then(() => done())
                .catch(done);
        });

        it("returns latest propagated data if already propagated", done => {
            const event = new Event("event", {}, "emitter");

            event.send(1);
            event.send(2);

            event
                .await()
                .then(data => expect(data).equals(2))
                .then(() => done())
                .catch(done);
        });
    });

    describe("retain()", () => {
        it("delays resolving until release()", done => {
            const event = new Event("event", {}, "emitter");

            event.retain();
            event
                .await()
                .then(data => expect(data).equals(1))
                .then(() => done())
                .catch(done);

            event.send(1);
            event.release();
        });

        it("allows multiple calls", done => {
            const event = new Event("event", {}, "emitter");

            event.retain();
            event.retain();
            event.release();

            event
                .await()
                .then(data => expect(data).equals(1))
                .then(() => done())
                .catch(done);

            event.send(1);
            event.release();
        });
    });

    describe("toString()", () => {
        it("contains timestamp", () => {
            const timestamp = Date.now();
            const format = "YYYY-MM-DD hh:mm:ss";
            const event = new Event("event", {}, "emitter", timestamp);

            expect(event.toString()).contains(Time.format(format, new Date(timestamp)));
        });

        it("contains name of emitter", () => {
            const emitter = "my emitter";
            const event = new Event("event", {}, emitter);

            expect(event.toString()).contains(emitter);
        });

        it("contains name of event", () => {
            const event = new Event("my event", {}, "emitter");

            expect(event.toString()).contains(event.name);
        });

        it("contains arguments of object", () => {
            const args = { hello: "world" };
            const event = new Event("event", args, "emitter");

            expect(event.toString()).contains(Serialization.toString(args));
        });

        it("skips arguments of modules", () => {
            const module = new Module<any>("my module")
            const event = new Event("event", module, "emitter");

            expect(event.toString()).not.contains(Serialization.toString(module));
        });
    });
});