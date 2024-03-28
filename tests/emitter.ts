/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Emitter, Event } from "../src";

describe("Emitter", () => {
    describe("emit()", () => {
        it("Calls parent.emit()", () => {
            const parent = new Parent();
            const child = new Emitter();
            const event = "my event";
            const args = { hello: "world" };
            const emitter = "my emitter";

            parent.append(child);
            child.emit(event, args, emitter);

            expect(parent.event).equals(event);
            expect(parent.args).equals(args);
            expect(parent.emitter).equals(emitter);
        });

        it("Catches unset parent", () => {
            const emitter = new Emitter();

            expect(() => emitter.emit("test")).not.throw();
        });

        it("Param event name or instance of event", () => {
            const parent = new Parent();
            const child = new Emitter();
            const eventName = "name test";
            const event = new Event("event test", "");

            parent.append(child);
            child.emit(eventName);

            expect(parent.event).equals(eventName);

            child.emit(event);

            expect(parent.event).equals(event);
        });

        it("Param args optional arguments of event", () => {
            const parent = new Parent();
            const child = new Emitter();

            parent.append(child);
            child.emit("test");

            expect(parent.args).is.undefined;
        });

        it("Param emitter optional name of event emitter", () => {
            const parent = new Parent();
            const child = new Emitter();

            parent.append(child);
            child.emit("test");

            expect(parent.emitter).is.undefined;
        });

        it("Returns an Event of parent when parent is set", () => {
            const parent = new Parent();
            const child = new Emitter();

            parent.append(child);

            expect(child.emit("test")).instanceOf(Event);
        });

        it("Returns undefined when parent is unset", () => {
            const emitter = new Emitter();

            expect(emitter.emit("test")).is.undefined;
        });
    });
});

class Parent extends Emitter<any> {
    public emitCalled = false;
    public event;
    public args;
    public emitter;

    public emit(event: Event | string, args, emitter: string): Event {
        this.emitCalled = true;
        this.event = event;
        this.args = args;
        this.emitter = emitter;

        if (event instanceof Event)
            return event;

        return new Event(event, emitter, args);
    }
}