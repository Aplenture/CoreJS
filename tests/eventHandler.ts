/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Event, EventHandler, Handler, Module } from "../src";

class MyHandler extends EventHandler<Handler<any>> {
    public children: EventHandler<any>[] = [];

    public event: Event;
    public counter = 0;

    public append(child: EventHandler<any>): void {
        super.append(child);
        this.children.push(child);
    }

    public depend(child: Module<Module<Handler<any>>>): void {
        super.depend(child);
        this.children = this.children.filter(tmp => child != tmp);
    }

    public handleEvent(event: Event): void {
        super.handleEvent(event);
        this.children.forEach(child => child.handleEvent(event));
    }

    protected async execute(event: Event) {
        this.event = event;
        this.counter++;
    }
}

describe("EventHandler", () => {
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
            const event = new Event("event", {}, "emitter");

            handler.handleEvent(event);

            expect(handler.event).equals(event);
        });

        it("retains event", () => {
            const handler = new MyHandler();
            const event = new Event("event", {}, "emitter");

            handler.handleEvent(event);

            expect(event.retains).equals(1);
        });

        it("releases event", done => {
            const handler = new MyHandler();
            const event = new Event("event", {}, "emitter");

            event
                .await()
                .then(() => expect(handler.event).equals(event))
                .then(() => done())
                .catch(done);

            handler.handleEvent(event);
        });

        it("skips execute() on missmatching event emitter", () => {
            const handler = new MyHandler({ event: "other" });
            const event = new Event("event", {}, "emitter");

            handler.handleEvent(event);

            expect(handler.event).is.undefined;
        });

        it("calls execute() on matching event emitter", () => {
            const handler = new MyHandler({ event: "event" });
            const event = new Event("event", {}, "emitter");

            handler.handleEvent(event);


            expect(handler.event).equals(event);
        });

        it("skips execute() on missmatching event emitter", () => {
            const handler = new MyHandler({ emitter: "handler emitter" });
            const event = new Event("event", {}, "event emitter");

            handler.handleEvent(event);

            expect(handler.event).is.undefined;
        });

        it("calls execute() on matching event emitter", () => {
            const emitter = "my emitter";
            const handler = new MyHandler({ emitter });
            const event = new Event("event", {}, emitter);

            handler.handleEvent(event);

            expect(handler.event).equals(event);
        });

        it("calls execute() once if set", () => {
            const parent = new MyHandler();
            const child = new MyHandler({ once: true });
            const event = new Event("event", {}, parent.name);

            parent.append(child);

            parent.handleEvent(event);
            parent.handleEvent(event);

            expect(child.counter).equals(1);
        });
    });
});