/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Controller, Event, Handler, HandlerState } from "../src";

class MyHandler extends Handler<Controller<any>> {
    public async execute(event: Event) { }
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