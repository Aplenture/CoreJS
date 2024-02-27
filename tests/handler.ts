/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Controller, Event, Handler } from "../src";

describe("Handler", () => {
    describe("handleEvent()", () => {
        it("Calls this.execute() on event with matching name", () => {
            const handler = new MyHandler("event");

            handler.handleEvent(new Event("event", "emitter", { value: 1 }));
            handler.handleEvent(new Event("another", "emitter", { value: 2 }));

            expect(handler.value).equals(1);
        });

        it("Calls this.execute() on every event when name is unset", () => {
            const handler = new MyHandler();

            handler.handleEvent(new Event("event", "emitter", { value: 1 }));
            handler.handleEvent(new Event("another", "emitter", { value: 2 }));

            expect(handler.value).equals(3);
        });

        it("Calls this.execute() with the event argument", () => {
            const handler = new MyHandler();
            const event = new Event("event", "emitter", { value: 1 });

            handler.handleEvent(event);

            expect(handler.event).equals(event);
        });

        it("Calls event.retain() before this.execute()", () => {
            const handler = new MyHandler();
            const event = new Event("event", "emitter", { value: 1 });

            expect(event.finished).is.true;

            handler.handleEvent(event);

            expect(event.finished).is.false;
        });

        it("Calls event.release() after this.execute()", async () => {
            const handler = new MyHandler();
            const event = new Event("event", "emitter", { value: 1 });

            expect(event.finished).is.true;

            await handler.handleEvent(event);

            expect(event.finished).is.true;
        });

        it("Returns void Promise", async () => {
            const handler = new MyHandler();
            const event = new Event("event", "emitter", { value: 1 });

            expect(handler.handleEvent(event)).instanceOf(Promise);
            expect(await handler.handleEvent(event)).is.undefined;
        });
    });

    describe("onEnabled()", () => {
        it("Returns void", async () => {
            const handler = new MyHandler();

            expect(handler.onEnabled()).is.undefined;
        });
    });

    describe("onDisabled()", () => {
        it("Returns void", async () => {
            const handler = new MyHandler();

            expect(handler.onDisabled()).is.undefined;
        });
    });
});

class MyHandler extends Handler<Controller<any>> {
    public value = 0;
    public event: Event;

    public async execute(event: Event) {
        this.event = event;
        this.value += event.args.value ?? 0;
    }
}