/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Emitter, Event } from "../src";

describe("Event", () => {
    describe("data", () => {
        it("returns already propagated data", done => {
            const event = new Event("event", {}, new Emitter("emitter"));

            event.onData.invoke(1);

            event.data
                .then(data => expect(data).equals(1))
                .then(() => done())
                .catch(done);
        });

        it("returns latest propagated data if already propagated", done => {
            const event = new Event("event", {}, new Emitter("emitter"));

            event.onData.invoke(1);
            event.onData.invoke(2);

            event.data
                .then(data => expect(data).equals(2))
                .then(() => done())
                .catch(done);
        });

        it("returns first propagated data if not already propagated", done => {
            const event = new Event("event", {}, new Emitter("emitter"));

            event.data
                .then(data => expect(data).equals(1))
                .then(() => done())
                .catch(done);

            event.onData.invoke(1);
            event.onData.invoke(2);
        });
    });
});