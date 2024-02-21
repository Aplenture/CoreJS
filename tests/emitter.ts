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
            const parent = new Parent("parent");
            const child = new Emitter("child");

            parent.append(child);
            child.emit("test");

            expect(parent.emitCalled).is.true;
        });

        it("Calls parent.emit() with the args", () => {
            const parent = new Parent("parent");
            const child = new Emitter("child");
            const event = "my event";
            const args = { hello: "world" };
            const emitter = "my emitter";
            const timestamp = Date.now() - 1000 * 60;

            parent.append(child);
            child.emit(event, args, emitter, timestamp);

            expect(parent.event).equals(event);
            expect(parent.args).equals(args);
            expect(parent.emitter).equals(emitter);
            expect(parent.timestamp).equals(timestamp);
        });

        it("Catches unset parent", () => {
            const emitter = new Emitter("emitter");

            expect(() => emitter.emit("test")).not.throw();
        });

        it("Param event name", () => {
            const parent = new Parent("parent");
            const child = new Emitter("child");
            const event = "test";

            parent.append(child);
            child.emit(event);

            expect(parent.event).equals(event);
        });

        it("Param args default is undefined", () => {
            const parent = new Parent("parent");
            const child = new Emitter("child");

            parent.append(child);
            child.emit("test");

            expect(parent.args).is.undefined;
        });

        it("Param emitter name, default is this", () => {
            const parent = new Parent("parent");
            const child = new Emitter("child");

            parent.append(child);
            child.emit("test");

            expect(parent.emitter).equals(child.name);
        });

        it("Param timestamp default is undefined", () => {
            const parent = new Parent("parent");
            const child = new Emitter("child");

            parent.append(child);
            child.emit("test");

            expect(parent.timestamp).is.undefined;
        });

        it("Returns an Event by parent when parent is set", () => {
            const parent = new Parent("parent");
            const child = new Emitter("child");

            parent.append(child);

            expect(child.emit("test")).instanceOf(Event);
        });

        it("Returns undefined when parent is unset", () => {
            const emitter = new Emitter("emitter");

            expect(emitter.emit("test")).is.undefined;
        });
    });
});

class Parent extends Emitter<any> {
    public emitCalled = false;
    public event;
    public args;
    public emitter;
    public timestamp;

    public emit(event: string, args, emitter, timestamp): Event {
        this.emitCalled = true;
        this.event = event;
        this.args = args;
        this.emitter = emitter;
        this.timestamp = timestamp;

        return new Event(event, "");
    }
}