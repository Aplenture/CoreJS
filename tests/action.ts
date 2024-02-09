/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Action, Event } from "../src";

describe("Action", () => {
    describe("constructor()", () => {
        it("instantiates with config", () => {
            const emitter = "my emitter";
            const callback = async () => { };
            const handler = new Action({ event: "event", emitter, once: true, callback });

            expect(handler.name, "name").equals("event");
            expect(handler.emitter, "emitter").equals(emitter);
            expect(handler.execute, "execute").equals(callback);
            expect(handler.once, "once").equals(true);
        });

        it("instantiates with callback only", () => {
            const callback = async () => { };
            const handler = new Action(callback);

            expect(handler.execute, "execute").equals(callback);
            expect(handler.name, "name").is.undefined;
            expect(handler.emitter, "emitter").is.undefined;
            expect(handler.once, "once").is.false;
        });

        it("instantiates with event name and callback only", () => {
            const callback = async () => { };
            const handler = new Action("event", callback);

            expect(handler.name, "name").equals("event");
            expect(handler.execute, "execute").equals(callback);
            expect(handler.emitter, "emitter").is.undefined;
            expect(handler.once, "once").is.false;
        });

        it("ignores callback argument when first argument is callback", () => {
            const callback1 = async () => { };
            const callback2 = async () => { };
            const handler = new Action(callback1, callback2);

            expect(handler.execute, "execute").equals(callback1);
            expect(handler.execute, "execute").not.equals(callback2);
        });

        it("ignores callback argument when first argument is config", () => {
            const callback1 = async () => { };
            const callback2 = async () => { };
            const handler = new Action({ callback: callback1 }, callback2);

            expect(handler.execute, "execute").equals(callback1);
            expect(handler.execute, "execute").not.equals(callback2);
        });
    });
});