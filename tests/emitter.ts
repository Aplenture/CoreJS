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

        it("Catches unset parent", () => {
            const emitter = new Parent("emitter");

            expect(() => emitter.emit("test")).not.throw();
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

    public emit(event: string): Event {
        this.emitCalled = true;

        return new Event(event, {}, "");
    }
}