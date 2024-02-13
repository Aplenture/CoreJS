/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Controller, Event, Handler, HandlerState } from "../src";

class MyHandler extends Handler<Controller<any>> {
    public executionCount = 0;
    public event: Event;

    public get state() { return super.state; }
    public set state(value) { super.state = value; }

    public async execute(event: Event) {
        this.event = event;
        this.executionCount++;
    }
}

describe("Handler", () => {
    describe("constructor()", () => {
        it("instantiates with config", () => {
            const emitter = "my emitter";
            const handler = new MyHandler({ event: "event", emitter, once: true });

            expect(handler.name, "name").equals("event");
            expect(handler.emitter, "emitter").equals(emitter);
            expect(handler.once, "once").equals(true);
        });

        it("instantiates with event name only", () => {
            const handler = new MyHandler("event");

            expect(handler.name, "name").equals("event");
            expect(handler.emitter, "emitter").is.undefined;
            expect(handler.once, "once").is.false;
        });
    });

    describe("handleEvent()", () => {
        it("calls execute()", () => {
            const handler = new MyHandler();
            const event = new Event("event", { value: 1 }, "emitter");

            handler.handleEvent(event);

            expect(handler.event.args.value).equals(1);
        });

        it("retains event", () => {
            const handler = new MyHandler();
            const event = new Event("event", { value: 1 }, "emitter");

            handler.handleEvent(event);

            expect(event.retains).equals(1);
        });

        it("releases event", done => {
            const handler = new MyHandler();
            const event = new Event("event", { value: 1 }, "emitter");

            handler.handleEvent(event);

            event.await()
                .then(() => expect(event.retains).equals(0))
                .then(() => done())
                .catch(done);
        });

        it("skips execute() on missmatching event name", done => {
            const handler = new MyHandler("other");
            const event = new Event("event", { value: 1 }, "emitter");

            handler.handleEvent(event);

            event.await()
                .then(() => expect(handler.event).is.undefined)
                .then(() => done())
                .catch(done);
        });

        it("calls execute() on matching event name", done => {
            const handler = new MyHandler("event");
            const event = new Event("event", { value: 1 }, "emitter");

            handler.handleEvent(event);

            event.await()
                .then(() => expect(handler.event).is.not.undefined)
                .then(() => done())
                .catch(done);
        });

        it("skips execute() on missmatching event emitter", done => {
            const handler = new MyHandler({ emitter: "other" });
            const event = new Event("event", { value: 1 }, "emitter");

            handler.handleEvent(event);

            event.await()
                .then(() => expect(handler.event).is.undefined)
                .then(() => done())
                .catch(done);
        });

        it("calls execute() on matching event emitter", done => {
            const handler = new MyHandler({ emitter: "emitter" });
            const event = new Event("event", { value: 1 }, "emitter");

            handler.handleEvent(event);

            event.await()
                .then(() => expect(handler.event).is.not.undefined)
                .then(() => done())
                .catch(done);
        });

        it("calls execute() multiple times if once is false", () => {
            const handler = new MyHandler();
            const event = new Event("event", { value: 1 }, "emitter");

            handler.handleEvent(event);
            handler.handleEvent(event);

            expect(handler.executionCount).equals(2);
        });

        it("calls execute() once is true", () => {
            const handler = new MyHandler({ once: true });
            const event = new Event("event", { value: 1 }, "emitter");

            handler.handleEvent(event);
            handler.handleEvent(event);

            expect(handler.state).equals(HandlerState.Removing);
            expect(handler.executionCount).equals(1);
        });
    });

    describe("serialization", () => {
        it("serializes the state", () => {
            const handler = new MyHandler();

            expect(handler.toJSON()).deep.contains({ state: HandlerState.Infinite });

            handler.state = HandlerState.Removing;

            expect(handler.toJSON()).deep.contains({ state: HandlerState.Removing });
        });

        it("deserializes the state", () => {
            const handler = new MyHandler();

            expect(handler.state).equals(HandlerState.Infinite);

            handler.state = HandlerState.Once;
            handler.fromJSON({ state: HandlerState.Removing });

            expect(handler.state).equals(HandlerState.Removing);
        });
    });
});