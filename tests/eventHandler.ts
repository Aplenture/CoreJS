/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Emitter, Event, EventHandler, Handler, Module } from "../src";

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

    protected execute(event: Event) {
        this.event = event;
        this.counter++;
    }
}

describe("EventHandler", () => {
    describe("handleEvent()", () => {
        it("calls execute()", done => {
            const handler = new MyHandler();
            const event = new Event("event", {}, new Emitter("emitter"));

            handler.handleEvent(event);

            Promise.resolve()
                .then(() => expect(handler.event).equals(event))
                .then(() => done())
                .catch(done);
        });

        it("delays execute() call", () => {
            const handler = new MyHandler();
            const event = new Event("event", {}, new Emitter("emitter"));

            handler.handleEvent(event);

            expect(handler.event).is.undefined;
        });

        it("skips execute() on missmatching event emitter", done => {
            const handler = new MyHandler({ event: "other" });
            const event = new Event("event", {}, new Emitter("emitter"));

            handler.handleEvent(event);

            Promise.resolve()
                .then(() => expect(handler.event).is.undefined)
                .then(() => done())
                .catch(done);
        });

        it("calls execute() on matching event emitter", done => {
            const handler = new MyHandler({ event: "event" });
            const event = new Event("event", {}, new Emitter("emitter"));

            handler.handleEvent(event);

            Promise.resolve()
                .then(() => expect(handler.event).equals(event))
                .then(() => done())
                .catch(done);
        });

        it("skips execute() on missmatching event emitter", done => {
            const handler = new MyHandler({ emitter: new Emitter("emitter") });
            const event = new Event("event", {}, new Emitter("emitter"));

            handler.handleEvent(event);

            Promise.resolve()
                .then(() => expect(handler.event).is.undefined)
                .then(() => done())
                .catch(done);
        });

        it("calls execute() on matching event emitter", done => {
            const emitter = new Emitter("emitter");
            const handler = new MyHandler({ emitter });
            const event = new Event("event", {}, emitter);

            handler.handleEvent(event);

            Promise.resolve()
                .then(() => expect(handler.event).equals(event))
                .then(() => done())
                .catch(done);
        });

        it("skips execute() on missmatching parent", done => {
            const handler = new MyHandler({ onParent: true });
            const event = new Event("event", {}, new Emitter("emitter"));

            handler.handleEvent(event);

            Promise.resolve()
                .then(() => expect(handler.event).is.undefined)
                .then(() => done())
                .catch(done);
        });

        it("calls execute() on matching parent", done => {
            const module = new Module<any>("module");
            const handler = new MyHandler({ onParent: true });
            const event = new Event("event", {}, module);

            module.append(handler);
            handler.handleEvent(event);

            Promise.resolve()
                .then(() => expect(handler.event).equals(event))
                .then(() => done())
                .catch(done);
        });

        it("calls execute() once if set", done => {
            const parent = new MyHandler();
            const child = new MyHandler({ once: true });
            const event = new Event("event", {}, parent);

            parent.append(child);

            parent.handleEvent(event);
            parent.handleEvent(event);

            Promise.resolve()
                .then(() => expect(child.counter).equals(1))
                .then(() => done())
                .catch(done);
        });
    });
});