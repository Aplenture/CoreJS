/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Controller, Event, Handler, HandlerState } from "../src";
import { EVENT_ENABLED_CHANGED } from "../src/constants";

class MyHandler extends Handler<any> {
    public event: Event;
    public value = 0;
    public calledOnEnabled = false;
    public calledOnDisabled = false;

    public get state() { return super.state; }
    public set state(value) { super.state = value; }

    public readonly execute = async (event: Event) => {
        this.event = event;
        this.value += event.args.value;
    }

    public onEnabled(): void {
        super.onEnabled();
        this.calledOnEnabled = true;
    }

    public onDisabled(): void {
        super.onDisabled();
        this.calledOnDisabled = true;
    }
}

class MyController extends Controller<any> {
    public calledOnEnabled = false;
    public calledOnDisabled = false;

    public onEnabled(): void {
        super.onEnabled();
        this.calledOnEnabled = true;
    }

    public onDisabled(): void {
        super.onDisabled();
        this.calledOnDisabled = true;
    }
}

describe("Controller", () => {
    describe("name", () => {
        it("concatinates all given classes", () => {
            const controller = new Controller("my", "own", "controller");

            expect(controller.name).equals("my/own/controller");
        });
    });

    describe("enabled handling", () => {
        describe("enabled property", () => {
            it("returns true without parent", () => {
                const child = new Controller<any>("child");

                expect(child.enabled).equals(true);
            });

            it("returns false without parent", () => {
                const child = new Controller("child");

                child.enabled = false;

                expect(child.enabled).equals(false);
            });

            it("returns true if parent is enabled", () => {
                const parent = new Controller<any>("parent");
                const child = new Controller<any>("child");

                parent.append(child);

                expect(child.enabled).equals(true);
            });

            it("returns false if parent is disabled", () => {
                const parent = new Controller<any>("parent");
                const child = new Controller<any>("child");

                parent.enabled = false;
                parent.append(child);

                expect(child.enabled).equals(false);
            });

            it("returns false if parent is enabled but child", () => {
                const parent = new Controller<any>("parent");
                const child = new Controller<any>("child");

                child.enabled = false;
                parent.append(child);

                expect(child.enabled).equals(false);
            });

            it("calls onDisabled()", () => {
                const controller = new MyController("controller");

                controller.enabled = false;

                expect(controller.calledOnDisabled).is.true;
            });

            it("calls onEnabled()", () => {
                const controller = new MyController("controller");

                controller.enabled = false;
                controller.enabled = true;

                expect(controller.calledOnEnabled).is.true;
            });
        });

        describe("event handlers", () => {
            it("calls onDisabled()", () => {
                const parent = new Controller<any>("parent");
                const child = new MyHandler("child");

                parent.append(child);
                parent.enabled = false;

                expect(child.calledOnDisabled).is.true;
            });

            it("calls onEnabled()", () => {
                const parent = new Controller<any>("parent");
                const child = new MyHandler("child");

                parent.enabled = false;
                parent.append(child);
                parent.enabled = true;

                expect(child.calledOnEnabled).is.true;
            });
        });

        describe("children", () => {
            it("calls onDisabled() on enabled child", () => {
                const parent = new Controller<any>("parent");
                const child = new MyController("child");

                parent.append(child);
                parent.enabled = false;

                expect(child.calledOnDisabled).is.true;
            });

            it("calls onEnabled() on enabled child", () => {
                const parent = new Controller<any>("parent");
                const child = new MyController("child");

                parent.enabled = false;
                parent.append(child);
                parent.enabled = true;

                expect(child.calledOnEnabled).is.true;
            });

            it("skips onDisabled() on disabled child", () => {
                const parent = new Controller<any>("parent");
                const child = new MyController("child");

                child.enabled = false;
                child.calledOnDisabled = false;

                parent.append(child);
                parent.enabled = false;

                expect(child.calledOnDisabled).is.false;
            });

            it("skips onEnabled() on disabled child", () => {
                const parent = new Controller<any>("parent");
                const child = new MyController("child");

                child.enabled = false;

                parent.enabled = false;
                parent.append(child);
                parent.enabled = true;

                expect(child.calledOnEnabled).is.false;
            });

            it("skips onDisabled() on disabled parent", () => {
                const parent = new Controller<any>("parent");
                const child = new MyController("child");

                parent.enabled = false;
                parent.append(child);

                child.enabled = false;

                expect(child.calledOnDisabled).is.false;
            });

            it("skips onEnabled() on disabled parent", () => {
                const parent = new Controller<any>("parent");
                const child = new MyController("child");

                parent.enabled = false;
                parent.append(child);

                child.enabled = false;
                child.enabled = true;

                expect(child.calledOnEnabled).is.false;
            });
        });
    });

    describe("event handling", () => {
        describe("retain", () => {
            it("retains event", () => {
                const controller = new Controller("controller");

                const event = controller.emit("event");

                expect(event.retains).equals(1);
            });

            it("releases event", done => {
                const controller = new Controller("controller");

                const event = controller.emit("event");

                event.await()
                    .then(() => expect(event.retains).equals(0))
                    .then(() => done())
                    .catch(done);
            });
        });

        describe("children", () => {
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

            it("skips disabled propagation", done => {
                const parent = new Controller<any>("parent");
                const child = new Controller<any>("child");

                child.on(EVENT_ENABLED_CHANGED, async () => done(new Error('propagated disabled')));

                parent.append(child);
                parent.enabled = false;

                Promise.resolve().then(() => {
                    expect(child.enabled).equals(false);
                    done();
                });
            });

            it("propagates enabled", done => {
                const parent = new Controller<any>("parent");
                const child = new Controller<any>("child");

                parent.enabled = false;

                Promise.resolve().then(() => {
                    child.on(EVENT_ENABLED_CHANGED, async event => {
                        expect(event.args.enabled).equals(true);
                        done();
                    });

                    parent.append(child);
                    parent.enabled = true;
                });
            });

            it("skip propagination when enabled has not changed", done => {
                const parent = new Controller<any>("parent");
                const child = new Controller<any>("child");

                child.on(EVENT_ENABLED_CHANGED, async () => done(new Error("event handler was called but nothing has changed")));

                parent.append(child);
                parent.enabled = true;

                Promise.resolve().then(() => done());
            });

            it("throws error on emitting when disabled", () => {
                const emitter = new Controller<any>("emitter");
                const receiver = new Controller<any>("receiver");
                const parent = new Controller<any>("parent");

                let result = 0;

                parent.append(emitter);
                parent.append(receiver);

                parent.enabled = false;

                try { parent.emit("event"); } catch (e) { result++; }
                try { emitter.emit("other"); } catch (e) { result++; }
                try { receiver.emit(""); } catch (e) { result++; }

                expect(result).equals(3);
            });

            it("skips emitting when disabled", done => {
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

                receiver.enabled = false;

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
                    .then(() => expect(handler.event.timestamp).equals(timestamp))
                    .then(() => done())
                    .catch(done);
            });
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

    describe("serialization", () => {
        describe("toJSON()", () => {
            it("serializes enabled", () => {
                const controller = new Controller("controller");

                expect(controller.toJSON()).deep.contains({ enabled: true });

                controller.enabled = false;

                expect(controller.toJSON()).deep.contains({ enabled: false });
            });

            it("serializes event handlers", () => {
                const controller = new Controller("controller");
                const firstHandler = new MyHandler("firstHandler");
                const secondHandler = new MyHandler("secondHandler");
                const firstController = new Controller<any>("firstController");
                const secondController = new Controller<any>("secondController");

                firstHandler.state = HandlerState.Once;
                secondHandler.state = HandlerState.Removing;
                secondController.enabled = false;

                controller.append(firstHandler);
                controller.append(secondHandler);
                controller.append(firstController);
                controller.append(secondController);

                expect(controller.toJSON()).deep.contains({
                    eventHandlers: {
                        firstHandler: { state: HandlerState.Once },
                        secondHandler: { state: HandlerState.Removing },
                        firstController: { enabled: true },
                        secondController: { enabled: false }
                    }
                });
            });
        });

        describe("fromJSON()", () => {
            it("deserializes enabled", () => {
                const controller = new Controller("controller");

                expect(controller.enabled).is.true;

                controller.fromJSON({ enabled: false });

                expect(controller.enabled).is.false;
            });

            it("deserializes event handlers", () => {
                const controller = new Controller("controller");
                const first = new MyHandler("first");
                const second = new MyHandler("second");

                controller.append(first);
                controller.append(second);

                controller.fromJSON({
                    eventHandlers: {
                        first: { state: HandlerState.Once },
                        second: { state: HandlerState.Removing }
                    }
                });

                expect(first.state).equals(HandlerState.Once);
                expect(second.state).equals(HandlerState.Removing);
            });

            it("deserializes children", () => {
                const controller = new Controller<any>("controller");
                const first = new Controller<any>("first");
                const second = new Controller<any>("second");

                second.enabled = false;

                controller.append(first);
                controller.append(second);

                controller.fromJSON({
                    children: {
                        first: { enabled: true },
                        second: { enabled: false }
                    }
                });

                expect(first.enabled).is.true;
                expect(second.enabled).is.false;
            });
        });
    });
});