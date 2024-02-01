/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { ActionHandler, Emitter, Event } from "../src";

class MyHandler extends ActionHandler {
    public readonly execute;
}

describe("ActionHandler", () => {
    describe("constructor()", () => {
        it("instantiates with config", () => {
            const emitter = new Emitter("emitter");
            const callback = () => { };
            const handler = new MyHandler({ event: "event", emitter, onParent: true, once: true, callback });

            expect(handler.name).equals("event");
            expect(handler.emitter).equals(emitter);
            expect(handler.execute).equals(callback);
            expect(handler.onParent).equals(true);
            expect(handler.once).equals(true);
        });

        it("instantiates with callback only", () => {
            const callback = () => { };
            const handler = new MyHandler(callback);

            expect(handler.execute).equals(callback);
            expect(handler.name).is.undefined;
            expect(handler.emitter).is.undefined;
            expect(handler.onParent).is.undefined;
            expect(handler.once).is.undefined;
        });

        it("instantiates with event name and callback only", () => {
            const callback = () => { };
            const handler = new MyHandler("event", callback);

            expect(handler.name).equals("event");
            expect(handler.execute).equals(callback);
            expect(handler.emitter).is.undefined;
            expect(handler.onParent).is.undefined;
            expect(handler.once).is.undefined;
        });

        it("ignores callback argument when first argument is callback", () => {
            const callback1 = () => { };
            const callback2 = () => { };
            const handler = new MyHandler(callback1, callback2);

            expect(handler.execute).equals(callback1);
            expect(handler.execute).not.equals(callback2);
        });

        it("ignores callback argument when first argument is config", () => {
            const callback1 = () => { };
            const callback2 = () => { };
            const handler = new MyHandler({ callback: callback1 }, callback2);

            expect(handler.execute).equals(callback1);
            expect(handler.execute).not.equals(callback2);
        });
    });

    describe("callback", () => {
        it("is called with event argument", done => {
            const event = new Event("event", {}, new Emitter("emitter"));
            const handler = new ActionHandler(event => output = event);

            let output: Event;

            handler.handleEvent(event);

            Promise.resolve()
                .then(() => expect(output).equals(event))
                .then(() => done())
                .catch(done);
        });

        it("allows to instantate by config", done => {
            const emitter = new Emitter("emitter");
            const event = new Event("event", {}, emitter);
            const handler = new ActionHandler({
                event: event.name,
                emitter,
                callback: event => output = event,
            });

            let output: Event;

            handler.handleEvent(new Event("other", {}, emitter));
            handler.handleEvent(event);
            handler.handleEvent(new Event("event", {}, new Emitter("other")));

            Promise.resolve()
                .then(() => expect(output).equals(event))
                .then(() => done())
                .catch(done);
        });
    });
});