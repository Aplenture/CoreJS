/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Module } from "../src";

describe("Module", () => {
    describe("append()", () => {
        it("Sets parent of child to this", () => {
            const parent = new MyModule("parent");
            const child = new MyModule("child");

            parent.append(child);

            expect(child.parent).equals(parent);
        });

        it("Throws an Error when parent is already this", () => {
            const parent = new MyModule("parent");
            const child = new MyModule("child");

            parent.append(child);

            expect(() => parent.append(child)).throws("parent is already this");
        });

        it("Calls child.removeFromParent() before setting parent", () => {
            const parent = new MyModule("parent");
            const child = new MyModule("child");

            parent.append(child);

            expect(parent.removeFromParentCalled).is.false;
            expect(child.removeFromParentCalled).is.true;
        });

        it("Calls child.onAppended() after setting parent", () => {
            const parent = new MyModule("parent");
            const child = new MyModule("child");

            parent.append(child);

            expect(parent.onAppendedCalled).is.false;
            expect(child.onAppendedCalled).is.true;
        });
    });

    describe("depend()", () => {
        it("Unsets parent of child to null", () => {
            const parent = new MyModule("parent");
            const child = new MyModule("child");

            parent.append(child);
            parent.depend(child);

            expect(child.parent).is.null;
        });

        it("Throws an Error when parent is not this", () => {
            const parent = new MyModule("parent");
            const child = new MyModule("child");

            expect(() => parent.depend(child)).throws("parent is not this");
        });

        it("Calls child.onDepended() after setting parent", () => {
            const parent = new MyModule("parent");
            const child = new MyModule("child");

            parent.append(child);
            parent.depend(child);

            expect(parent.onDependedCalled).is.false;
            expect(child.onDependedCalled).is.true;
        });
    });

    describe("removeFromParent()", () => {
        it("Calls parent.depend()", () => {
            const parent = new MyModule("parent");
            const child = new MyModule("child");

            parent.append(child);
            child.removeFromParent();

            expect(parent.dependCalled).is.true;
            expect(child.dependCalled).is.false;
        });

        it("Catches when parent is not set", () => {
            const child = new MyModule("child");

            expect(() => child.removeFromParent()).not.throw();
        });
    });
});

class MyModule extends Module<any> {
    public dependCalled = false;
    public removeFromParentCalled = false;
    public onAppendedCalled = false;
    public onDependedCalled = false;

    public depend(child: Module<Module<any>>): void {
        super.depend(child);
        this.dependCalled = true;
    }

    public removeFromParent(): void {
        super.removeFromParent();
        this.removeFromParentCalled = true;
    }

    public onAppended(): void {
        super.onAppended();
        this.onAppendedCalled = true;
    }

    public onDepended(): void {
        super.onDepended();
        this.onDependedCalled = true;
    }
}