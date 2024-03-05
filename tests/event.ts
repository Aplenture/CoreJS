/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Event } from "../src";
import { format } from "../src/utils/time";
import { fromArgs } from "../src/utils/args";

describe("Event", () => {
    describe("constructor()", () => {
        it("Argument argsOrTimestamp Event timestamp as number or Event args as Object", () => {
            const timestamp = new Date("2023-02-29").getTime();
            const event = new Event("my event name", "my emitter name", timestamp);

            expect(event.timestamp).equals(timestamp);
            expect(event.args).is.empty;
        });

        it("Argument timestamp default is Date.now()", () => {
            const event = new Event("my event name", "my emitter name");

            expect(Math.floor(event.timestamp / 1000)).equals(Math.floor(Date.now() / 1000));
        });
    });

    describe("toString()", () => {
        it("Parses Event properties to string", () => {
            const event = new Event("my event name", "my emitter name");

            expect(event.toString()).is.a("string");
        });

        it('Returns timestamp as "YYYY-MM-DD hh:mm:ss", emitter, name and args by Utils.Args.fromArgs()', () => {
            const date = new Date("2023-02-29T11:37");
            const args = { hello: "world" };
            const event = new Event("my event name", "my emitter name", args, date.getTime());

            expect(event.toString()).contains(format("YYYY-MM-DD hh:mm:ss", date));
            expect(event.toString()).contains(event.emitter);
            expect(event.toString()).contains(event.name);
            expect(event.toString()).contains(fromArgs(args));
        });
    });

    describe("then()", () => {
        it("Returns Promise which is resolved instant when Event has no retains", done => {
            const event = new Event("my event name", "my emitter name");

            let counter = 0;

            event
                .then(() => expect(counter).equals(0))
                .then(() => done())
                .catch(done);

            Promise
                .resolve()
                .then(() => counter++);
        });

        it("Returns otherwise Promise which is resolved when last retain is released", done => {
            const event = new Event("my event name", "my emitter name");

            let counter = 0;

            event.retain();

            event
                .then(() => expect(counter).equals(1))
                .then(() => done())
                .catch(done);

            Promise
                .resolve()
                .then(() => counter++)
                .then(() => event.release());
        });
    });

    describe("retain()", () => {
        it("Retains the Event until release is called", done => {
            const event = new Event("my event name", "my emitter name");

            event.retain();

            Promise.resolve()
                .then(() => expect(event.finished).is.false)
                .then(() => event.release())
                .then(() => expect(event.finished).is.true)
                .then(() => done())
                .catch(done);
        });

        it("Returns undefined", () => {
            const event = new Event("my event name", "my emitter name");

            expect(event.retain()).is.undefined;
        });
    });

    describe("release()", () => {
        it("Reduces the retains", () => {
            const event = new Event("my event name", "my emitter name");

            event.retain();

            expect(event.finished).is.false;

            event.release();

            expect(event.finished).is.true;
        });

        it("Resolves all then promises, if Event is finished", done => {
            const event = new Event("my event name", "my emitter name");

            let counter = 0;

            event.retain();

            event.then(() => counter += 1);
            event.then(() => counter += 2);
            event.then(() => counter += 3);

            event.then(() => expect(counter).equals(6))
                .then(() => done())
                .catch(done);

            event.release();
        });

        it("Throws an Error if called on finished Event", () => {
            const event = new Event("my event name", "my emitter name");

            expect(() => event.release()).throws("event is already finished");
        });

        it("Returns undefined", () => {
            const event = new Event("my event name", "my emitter name");

            event.retain();

            expect(event.release()).is.undefined;
        });
    });
});