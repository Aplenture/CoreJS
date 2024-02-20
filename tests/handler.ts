/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Controller, Event, Handler, ActionState } from "../src";

class MyHandler extends Handler<Controller<any>> {
    public executionCount = 0;
    public event: Event;

    public async execute(event: Event) {
        this.event = event;
        this.executionCount++;
    }
}

describe("Handler", () => {
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

        it("calls execute() multiple times if once is false", () => {
            const handler = new MyHandler();
            const event = new Event("event", { value: 1 }, "emitter");

            handler.handleEvent(event);
            handler.handleEvent(event);

            expect(handler.executionCount).equals(2);
        });
    });
});