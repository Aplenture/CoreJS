/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Delegate } from "../src";

class Handler {
    public counter = 0;
    public readonly add = (value: number) => { this.counter += value; }
}

describe.skip("Delegate", () => {
    describe("invoke()", () => {
        it("calls without args", () => {
            const handler = new Handler();
            const delegate = new Delegate<void>(() => handler.add(1));

            delegate.invoke();
            delegate.invoke();

            expect(handler.counter).equals(2);
        });

        it("calls with args", () => {
            const handler = new Handler();
            const delegate = new Delegate<number>(handler.add);

            delegate.invoke(1);
            delegate.invoke(2);

            expect(handler.counter).equals(3);
        });
    });

    describe("off()", () => {
        it("removes callbacks", () => {
            const handler1 = new Handler();
            const handler2 = new Handler();
            const handler3 = new Handler();

            const delegate = new Delegate<number>();

            delegate.on(handler1.add);
            delegate.on(handler2.add);
            delegate.on(handler3.add);

            delegate.off(handler2.add);
            delegate.off(handler3.add);

            delegate.invoke(1);

            expect(handler1.counter, "handler 1").equals(1);
            expect(handler2.counter, "handler 2").equals(0);
            expect(handler3.counter, "handler 3").equals(0);
        });
    });

    describe("once()", () => {
        it("calls once", () => {
            const handler = new Handler();
            const delegate = new Delegate<number>();

            delegate.once(handler.add);

            delegate.invoke(1);
            delegate.invoke(2);

            expect(handler.counter).equals(1);
        });
    });
});