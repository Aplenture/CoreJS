/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Action, ActionCallback, Event, ActionState } from "../src";

class MyAction extends Action {
    public readonly execute: ActionCallback;

    public event: Event;
    public executionCount = 0;

    public get state() { return super.state; }
    public set state(value) { super.state = value; }
}

describe("Action", () => {
    describe("constructor()", () => {
        it("instantiates with config", () => {
            const emitter = "my emitter";
            const callback = async () => { };
            const handler = new MyAction({ event: "event", emitter, once: true, callback });

            expect(handler.name, "name").equals("event");
            expect(handler.emitter, "emitter").equals(emitter);
            expect(handler.execute, "execute").equals(callback);
            expect(handler.once, "once").equals(true);
        });

        it("instantiates with callback only", () => {
            const callback = async () => { };
            const handler = new MyAction(callback);

            expect(handler.execute, "execute").equals(callback);
            expect(handler.name, "name").is.undefined;
            expect(handler.emitter, "emitter").is.undefined;
            expect(handler.once, "once").is.false;
        });

        it("instantiates with event name and callback only", () => {
            const callback = async () => { };
            const handler = new MyAction("event", callback);

            expect(handler.name, "name").equals("event");
            expect(handler.execute, "execute").equals(callback);
            expect(handler.emitter, "emitter").is.undefined;
            expect(handler.once, "once").is.false;
        });

        it("ignores callback argument when first argument is callback", () => {
            const callback1 = async () => { };
            const callback2 = async () => { };
            const handler = new MyAction(callback1, callback2);

            expect(handler.execute, "execute").equals(callback1);
            expect(handler.execute, "execute").not.equals(callback2);
        });

        it("ignores callback argument when first argument is config", () => {
            const callback1 = async () => { };
            const callback2 = async () => { };
            const handler = new MyAction({ callback: callback1 }, callback2);

            expect(handler.execute, "execute").equals(callback1);
            expect(handler.execute, "execute").not.equals(callback2);
        });
    });

    describe("handleEvent()", () => {

        it("skips execute() on missmatching event emitter", done => {
            const handler = new MyAction({ emitter: "other" });
            const event = new Event("event", { value: 1 }, "emitter");

            handler.handleEvent(event);

            event.await()
                .then(() => expect(handler.event).is.undefined)
                .then(() => done())
                .catch(done);
        });

        it("calls execute() on matching event emitter", done => {
            const handler = new MyAction({ emitter: "emitter" });
            const event = new Event("event", { value: 1 }, "emitter");

            handler.handleEvent(event);

            event.await()
                .then(() => expect(handler.event).is.not.undefined)
                .then(() => done())
                .catch(done);
        });


        it("calls execute() once is true", () => {
            const handler = new MyAction({ once: true });
            const event = new Event("event", { value: 1 }, "emitter");

            handler.handleEvent(event);
            handler.handleEvent(event);

            expect(handler.state).equals(ActionState.Removing);
            expect(handler.executionCount).equals(1);
        });
    });

    describe("serialization", () => {
        it("serializes the state", () => {
            const handler = new MyAction("handler");

            expect(handler.toJSON()).deep.contains({ state: ActionState.Infinite });

            handler.state = ActionState.Removing;

            expect(handler.toJSON()).deep.contains({ state: ActionState.Removing });
        });

        it("deserializes the state", () => {
            const handler = new MyAction("handler");

            expect(handler.state).equals(ActionState.Infinite);

            handler.state = ActionState.Once;
            handler.fromJSON({ state: ActionState.Removing });

            expect(handler.state).equals(ActionState.Removing);
        });
    });
});