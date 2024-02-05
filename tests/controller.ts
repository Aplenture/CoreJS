/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Controller, Event, Handler } from "../src";
import { EVENT_ACTIVE_CHANGED } from "../src/constants";

class MyHandler extends Handler<any> {
    public timestamp: number;
    public value = 0;

    public readonly execute = async (event: Event) => {
        this.timestamp = event.timestamp;
        this.value += event.args.value;
    }
}

describe("Controller", () => {
    describe("name", () => {
        it("concatinates all given classes", () => {
            const controller = new Controller("my", "own", "controller");

            expect(controller.name).equals("my/own/controller");
        });
    });

    describe("active state", () => {
        it("returns true without parent", () => {
            const child = new Controller<any>("child");

            expect(child.active).equals(true);
        });

        it("returns false without parent", () => {
            const child = new Controller("child");

            child.active = false;

            expect(child.active).equals(false);
        });

        it("returns true if parent is active", () => {
            const parent = new Controller<any>("parent");
            const child = new Controller<any>("child");

            parent.append(child);

            expect(child.active).equals(true);
        });

        it("returns false if parent is inactive", () => {
            const parent = new Controller<any>("parent");
            const child = new Controller<any>("child");

            parent.active = false;
            parent.append(child);

            expect(child.active).equals(false);
        });

        it("returns false if parent is active but child", () => {
            const parent = new Controller<any>("parent");
            const child = new Controller<any>("child");

            child.active = false;
            parent.append(child);

            expect(child.active).equals(false);
        });
    });

    describe("event handling", () => {
        it("propagates events between children", done => {
            const emitter = new Controller<any>("emitter");
            const receiver = new Controller<any>("receiver");
            const parent = new Controller<any>("parent");
            const emitterHandler = new MyHandler();
            const receiverHandler = new MyHandler();
            const parentHandler = new MyHandler();

            parent.append(emitter);
            parent.append(receiver);

            emitter.append(emitterHandler);
            receiver.append(receiverHandler);
            parent.append(parentHandler);

            parent.emit("event", { value: 1 });
            emitter.emit("other", { value: 2 });
            receiver.emit("", { value: 3 });

            Promise.resolve()
                .then(() => expect(emitterHandler.value).equals(6))
                .then(() => expect(receiverHandler.value).equals(6))
                .then(() => expect(parentHandler.value).equals(6))
                .then(() => done())
                .catch(done);
        });

        it("calls multiple handlers for same event", done => {
            const controller = new Controller<any>("controller");
            const handler1 = new MyHandler("event");
            const handler2 = new MyHandler("event");

            controller.append(handler1);
            controller.append(handler2);

            controller.emit("event", { value: 1 });
            controller.emit("other", { value: 2 });

            Promise.resolve()
                .then(() => expect(handler1.value).equals(1))
                .then(() => expect(handler2.value).equals(1))
                .then(() => done())
                .catch(done);
        });

        it("propagates deactivation", done => {
            const parent = new Controller<any>("parent");
            const child = new Controller<any>("child");

            child.on(EVENT_ACTIVE_CHANGED, async event => {
                expect(event.args.active).equals(false);
                done();
            });

            parent.append(child);
            parent.active = false;
        });

        it("propagates activation", done => {
            const parent = new Controller<any>("parent");
            const child = new Controller<any>("child");

            parent.active = false;

            Promise.resolve().then(() => {
                child.on(EVENT_ACTIVE_CHANGED, async event => {
                    expect(event.args.active).equals(true);
                    done();
                });

                parent.append(child);
                parent.active = true;
            });
        });

        it("skip propagination when active has not changed", done => {
            const parent = new Controller<any>("parent");
            const child = new Controller<any>("child");

            child.on(EVENT_ACTIVE_CHANGED, async () => done(new Error("event handler was called but nothing has changed")));

            parent.append(child);
            parent.active = true;

            Promise.resolve().then(() => done());
        });

        it("throws error on emitting when inactive", () => {
            const emitter = new Controller<any>("emitter");
            const receiver = new Controller<any>("receiver");
            const parent = new Controller<any>("parent");

            let result = 0;

            parent.append(emitter);
            parent.append(receiver);

            parent.active = false;

            try { parent.emit("event"); } catch (e) { result++; }
            try { emitter.emit("other"); } catch (e) { result++; }
            try { receiver.emit(""); } catch (e) { result++; }

            expect(result).equals(3);
        });

        it("skips emitting when inactive", done => {
            const emitter = new Controller<any>("emitter");
            const receiver = new Controller<any>("receiver");
            const parent = new Controller<any>("parent");
            const emitterHandler = new MyHandler("event");
            const receiverHandler = new MyHandler("event");
            const parentHandler = new MyHandler("event");

            parent.append(emitter);
            parent.append(receiver);

            emitter.append(emitterHandler);
            receiver.append(receiverHandler);
            parent.append(parentHandler);

            receiver.active = false;

            parent.emit("event", { value: 1 });
            emitter.emit("event", { value: 2 });

            Promise.resolve()
                .then(() => expect(emitterHandler.value).equals(3))
                .then(() => expect(receiverHandler.value).equals(0))
                .then(() => expect(parentHandler.value).equals(3))
                .then(() => done())
                .catch(done);
        });

        it("emits optional timestamp", done => {
            const timestamp = new Date("2024-02-05").getTime();
            const emitter = "emitter";
            const controller = new Controller<any>("controller");
            const handler = new MyHandler();

            controller.append(handler);
            controller.emit("event", { value: 2 }, emitter, timestamp);

            Promise.resolve()
                .then(() => expect(handler.timestamp).equals(timestamp))
                .then(() => done())
                .catch(done);
        });
    });

    describe("on()", () => {
        it("appends handler with callback only", done => {
            const controller = new Controller("controller");

            let result = 0;

            controller.on(async event => result += event.args.value);

            controller.emit("other", { value: 1 });
            controller.emit("event", { value: 2 });
            controller.emit("", { value: 3 });

            Promise.resolve()
                .then(() => expect(result).equals(6))
                .then(() => done())
                .catch(done);
        });

        it("appends handler with event name and callback", done => {
            const controller = new Controller("controller");

            let result = 0;

            controller.on("event", async event => result += event.args.value);

            controller.emit("other", { value: 1 });
            controller.emit("event", { value: 2 });
            controller.emit("", { value: 3 });

            Promise.resolve()
                .then(() => expect(result).equals(2))
                .then(() => done())
                .catch(done);
        });

        it("appends handler with config", done => {
            const emitter = new Controller<any>("emitter");
            const receiver = new Controller<any>("receiver");
            const parent = new Controller<any>("parent");

            let result = 0;

            parent.append(emitter);
            parent.append(receiver);

            receiver.on({
                event: "event",
                emitter: emitter.name,
                once: true,
                callback: async event => result += event.args.value
            });

            receiver.emit("event", { value: 1 });
            emitter.emit("other", { value: 2 });
            emitter.emit("event", { value: 3 });
            emitter.emit("event", { value: 4 });

            Promise.resolve()
                .then(() => expect(result).equals(3))
                .then(() => done())
                .catch(done);
        });
    });

    describe("once()", () => {
        it("appends handler with callback only", done => {
            const controller = new Controller("controller");

            let result = 0;

            controller.once(event => result += event.args.value);

            controller.emit("other", { value: 1 });
            controller.emit("event", { value: 2 });
            controller.emit("", { value: 3 });

            Promise.resolve()
                .then(() => expect(result).equals(1))
                .then(() => done())
                .catch(done);
        });

        it("appends handler with event name and callback", done => {
            const controller = new Controller("controller");

            let result = 0;

            controller.once("event", event => result += event.args.value);

            controller.emit("other", { value: 1 });
            controller.emit("event", { value: 2 });
            controller.emit("event", { value: 3 });

            Promise.resolve()
                .then(() => expect(result).equals(2))
                .then(() => done())
                .catch(done);
        });

        it("appends handler with config", done => {
            const emitter = new Controller<any>("emitter");
            const receiver = new Controller<any>("receiver");
            const parent = new Controller<any>("parent");

            let result = 0;

            parent.append(emitter);
            parent.append(receiver);

            receiver.once({
                event: "event",
                emitter: emitter.name,
                callback: event => result += event.args.value
            });

            receiver.emit("event", { value: 1 });
            emitter.emit("other", { value: 2 });
            emitter.emit("event", { value: 3 });
            emitter.emit("event", { value: 4 });

            Promise.resolve()
                .then(() => expect(result).equals(3))
                .then(() => done())
                .catch(done);
        });
    });

    describe("off()", () => {
        it("depends all event handlers", done => {
            const controller = new Controller("controller");

            let result = 0;

            controller.on(async event => result += event.args.value);
            controller.on("event", async event => result += event.args.value);

            controller.off();

            controller.emit("event", { value: 1 });

            Promise.resolve()
                .then(() => expect(result).equals(0))
                .then(() => done())
                .catch(done);
        });

        it("does not depend Controller", done => {
            const parent = new Controller<any>("parent");
            const child = new Controller<any>("child");

            let result = 0;

            parent.append(child);
            parent.on(async event => result += event.args.value);
            parent.on("event", async event => result += event.args.value);

            child.on("event", async event => result += event.args.value);

            parent.off();

            parent.emit("event", { value: 1 });

            Promise.resolve()
                .then(() => expect(result).equals(1))
                .then(() => done())
                .catch(done);
        });

        it("depends event handlers by name", done => {
            const controller = new Controller("controller");

            let result = 0;

            controller.on(async event => result += event.args.value);
            controller.on("event", async event => result += event.args.value);
            controller.on("event", async event => result += event.args.value);

            controller.off("event");

            controller.emit("event", { value: 1 });

            Promise.resolve()
                .then(() => expect(result).equals(1))
                .then(() => done())
                .catch(done);
        });

        it("depends event handlers by emitter", done => {
            const emitter = "my emitter";
            const controller = new Controller("controller");

            let result = 0;

            controller.on({ emitter }, async event => result += event.args.value);
            controller.on({ event: "event", emitter }, async event => result += event.args.value);
            controller.on("event", async event => result += event.args.value);

            controller.off(undefined, emitter);

            controller.emit("event", { value: 1 }, emitter);

            Promise.resolve()
                .then(() => expect(result).equals(1))
                .then(() => done())
                .catch(done);
        });

        it("depends event handlers by event name and emitter", done => {
            const emitter = "my emitter";
            const controller = new Controller("controller");

            let result = 0;

            controller.on({ emitter }, async event => result += event.args.value);
            controller.on({ event: "event", emitter }, async event => result += event.args.value);
            controller.on("event", async event => result += event.args.value);

            controller.off("event", emitter);

            controller.emit("event", { value: 1 }, emitter);

            Promise.resolve()
                .then(() => expect(result).equals(2))
                .then(() => done())
                .catch(done);
        });
    });
});