/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Controller, Event, Handler } from "../src";

describe("Handler", () => {
    describe("emit()", () => {
        it("Calls parent.emit() with parent as emitter", () => {
            const controller = new Controller("my controller");
            const handler = new MyHandler();

            controller.append(handler);

            expect(handler.emit("my event").emitter).equals(controller.name);
        });
    });

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

            expect(handler.executedEvent).equals(event);
        });

        it("Calls event.retain() before execute()", () => {
            const handler = new MyHandler();
            const event = new Event("event", "emitter", { value: 1 });

            expect(event.finished).is.true;

            handler.handleEvent(event);

            expect(event.finished).is.false;
        });

        it("Calls event.release() after execute()", async () => {
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

    describe("toJSON()", () => {
        it("Returns Object with event name", () => {
            const event = "my event";
            const handler = new MyHandler(event);

            expect(handler.toJSON()).contains({ event });
        });
    });

    describe("fromJSON()", () => {
        it("Parses from object", () => {
            const event = "my event";
            const handler = new MyHandler(event);

            expect(() => handler.fromJSON({ event })).not.throw();
        });

        it("Throws an Error on missmatching event name", () => {
            const event = "my event";
            const handler = new MyHandler(event);

            expect(() => handler.fromJSON({ event: "hello world" })).throws("missmatching event name");
        });
    });
});

class MyHandler extends Handler<Controller<any>> {
    public value = 0;
    public executedEvent: Event;

    public async execute(event: Event) {
        this.executedEvent = event;
        this.value += event.args.value ?? 0;
    }
}