/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Event, Module } from "../src";

class MyModule extends Module<MyModule> {
    public calledDepend = false;
    public calledRemoveFromParent = false;
    public calledEvent: string;
    public eventArgs;
    public eventEmitter;
    public calledOnAppended = false;
    public calledOnDepended = false;

    public depend(child: Module<Module<MyModule>>): void {
        this.calledDepend = true;
        super.depend(child);
    }

    public removeFromParent(): void {
        this.calledRemoveFromParent = true;
        super.removeFromParent();
    }

    public emit(event: string, args?: NodeJS.ReadOnlyDict<any>, emitter?: string): Event {
        this.calledEvent = event;
        this.eventArgs = args;
        this.eventEmitter = emitter;

        return super.emit(event, args, emitter);
    }

    protected onAppended(): void {
        this.calledOnAppended = true;
    }

    protected onDepended(): void {
        this.calledOnDepended = true;
    }
}

describe("Module", () => {
    describe("append()", () => {
        it("sets parent of children", () => {
            const parent = new MyModule("parent");
            const child1 = new MyModule("child1");
            const child2 = new MyModule("child2");

            parent.append(child1);
            parent.append(child2);

            expect(child1.parent).equals(parent);
            expect(child2.parent).equals(parent);
        });

        it("changes parent of children", () => {
            const parent1 = new MyModule("parent1");
            const parent2 = new MyModule("parent2");

            const child1 = new MyModule("child1");
            const child2 = new MyModule("child2");

            parent1.append(child1);
            parent1.append(child2);

            parent2.append(child2);

            expect(child1.parent).equals(parent1);
            expect(child2.parent).equals(parent2);
        });

        it("calls depend() at parent", () => {
            const parent1 = new MyModule("parent1");
            const parent2 = new MyModule("parent2");

            const child1 = new MyModule("child1");
            const child2 = new MyModule("child2");

            parent1.append(child1);
            parent1.append(child2);

            parent2.append(child2);

            expect(parent1.calledDepend).equals(true);
            expect(parent2.calledDepend).equals(false);

            expect(child1.calledDepend).equals(false);
            expect(child2.calledDepend).equals(false);
        });

        it("calls removeFromParent() at children", () => {
            const parent1 = new MyModule("parent1");
            const parent2 = new MyModule("parent2");

            const child1 = new MyModule("child1");
            const child2 = new MyModule("child2");

            parent1.append(child1);
            parent1.append(child2);

            parent2.append(child2);

            expect(parent1.calledRemoveFromParent).equals(false);
            expect(parent2.calledRemoveFromParent).equals(false);

            expect(child1.calledRemoveFromParent).equals(true);
            expect(child2.calledRemoveFromParent).equals(true);
        });

        it("calls onAppended()", () => {
            const parent = new MyModule("parent");
            const child = new MyModule("child");

            parent.append(child);

            expect(parent.calledOnAppended, "parent.calledOnAppended").is.false;
            expect(child.calledOnAppended, "child.calledOnAppended").is.true;
        });

        it("calls onDepended()", () => {
            const parent = new MyModule("parent");
            const child = new MyModule("child");

            parent.append(child);
            parent.depend(child);

            expect(parent.calledOnDepended, "parent.calledOnDepended").is.false;
            expect(child.calledOnDepended, "child.calledOnDepended").is.true;
        });
    });

    describe("depend()", () => {
        it("resets parent of children", () => {
            const parent1 = new MyModule("parent1");

            const child1 = new MyModule("child1");
            const child2 = new MyModule("child2");

            parent1.append(child1);
            parent1.append(child2);

            parent1.depend(child2);

            expect(child1.parent).equals(parent1);
            expect(child2.parent).equals(null);
        });
    });

    describe("removeFromParent()", () => {
        it("resets parent of children", () => {
            const parent1 = new MyModule("parent1");

            const child1 = new MyModule("child1");
            const child2 = new MyModule("child2");

            parent1.append(child1);
            parent1.append(child2);

            child2.removeFromParent();

            expect(child1.parent).equals(parent1);
            expect(child2.parent).equals(null);
        });

        it("calls depend() at parent", () => {
            const parent1 = new MyModule("parent1");

            const child1 = new MyModule("child1");
            const child2 = new MyModule("child2");

            parent1.append(child1);
            parent1.append(child2);

            child2.removeFromParent();

            expect(parent1.calledDepend).equals(true);

            expect(child1.calledDepend).equals(false);
            expect(child2.calledDepend).equals(false);
        });
    });

    describe("emit()", () => {
        it("emits event args to parent", () => {
            const parent1 = new MyModule("parent1");
            const child1 = new MyModule("child1");

            parent1.append(child1);
            child1.emit("hello", { hello: "world" });

            expect(parent1.calledEvent).equals("hello");
            expect(parent1.eventArgs).contains({ hello: "world" });
            expect(parent1.eventEmitter).equals(child1.name);
        });
    });
});