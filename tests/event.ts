/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Emitter, Event } from "../src";

describe("Event", () => {
    describe("onData", () => {
        it("sends multiple data", () => {
            const event = new Event("event", {}, new Emitter("emitter"));

            let result = 0;

            event.onData.on(data => result += data);
            event.send(1);
            event.send(2);

            expect(result).equals(3);
        });
    });

    describe("await()", () => {
        it("returns already propagated data", done => {
            const event = new Event("event", {}, new Emitter("emitter"));

            event.send(1);

            event
                .await()
                .then(data => expect(data).equals(1))
                .then(() => done())
                .catch(done);
        });

        it("returns latest propagated data if already propagated", done => {
            const event = new Event("event", {}, new Emitter("emitter"));

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
            const event = new Event("event", {}, new Emitter("emitter"));

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
            const event = new Event("event", {}, new Emitter("emitter"));

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
});