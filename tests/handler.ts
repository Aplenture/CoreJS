/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Controller, Event, Handler } from "../src";

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
});