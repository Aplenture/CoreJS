/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Delegate } from "../src";

describe("Delegate", () => {
    describe("constructor()", () => {
        it("Param callbacks called every invoke()", () => {
            const callback1 = value => counter += value;
            const callback2 = value => counter += value * 2;
            const delegate = new Delegate<any>(callback1, callback2);

            let counter = 0;

            delegate.invoke(1);
            delegate.invoke(2);

            expect(counter).equals(9);
        });
    });

    describe("on()", () => {
        it("Adds invokable callbacks which are called every invoke()", () => {
            const delegate = new Delegate<any>();
            const callback1 = value => counter += value;
            const callback2 = value => counter += value * 2;

            let counter = 0;

            delegate.on(callback1, callback2);
            delegate.invoke(1);
            delegate.invoke(2);

            expect(counter).equals(9);
        });

        it("Returns undefined", () => {
            const delegate = new Delegate<void>();

            expect(delegate.on(() => { })).is.undefined;
        });
    });

    describe("once()", () => {
        it("Adds an invokeable callback which is called only once by invoke()", () => {
            const delegate = new Delegate<any>();
            const callback = value => counter += value;

            let counter = 0;

            delegate.once(callback);
            delegate.invoke(1);
            delegate.invoke(2);

            expect(counter).equals(1);
        });

        it("Returns undefined", () => {
            const delegate = new Delegate<void>();

            expect(delegate.once(() => { })).is.undefined;
        });
    });

    describe("off()", () => {
        it("Removes a callback", () => {
            const delegate = new Delegate<any>();
            const callback = value => counter += value;

            let counter = 0;

            delegate.on(callback);
            delegate.off(callback);
            delegate.invoke(1);

            expect(counter).equals(0);
        });

        it("Also a callback added by once()", () => {
            const delegate = new Delegate<any>();
            const callback = value => counter += value;

            let counter = 0;

            delegate.once(callback);
            delegate.off(callback);
            delegate.invoke(1);

            expect(counter).equals(0);
        });

        it("Returns undefined", () => {
            const delegate = new Delegate<void>();

            expect(delegate.off(() => { })).is.undefined;
        });
    });

    describe("then()", () => {
        it("Param callback called once on invoke() with invoke data", done => {
            const delegate = new Delegate<any>();

            let counter = 0;

            delegate.then(value => counter += value);
            delegate.invoke(1);
            delegate.invoke(3);

            Promise.resolve()
                .then(() => expect(counter).equals(1))
                .then(() => done())
                .catch(done);
        });

        it("Returns Promise which is resolved on callback if given", done => {
            const delegate = new Delegate<any>();

            expect(delegate.then(() => { })).is.a("promise");

            delegate
                .then(value => value + 1)
                .then(value => expect(value).equals(2));

            delegate.invoke(1);
            delegate.invoke(3);

            Promise.resolve()
                .then(() => done())
                .catch(done);
        });

        it("Returns otherwise Promise which is resolved on invoke()", done => {
            const delegate = new Delegate<any>();

            expect(delegate.then()).is.a("promise");

            delegate
                .then()
                .then(value => expect(value).equals(1));

            delegate.invoke(1);
            delegate.invoke(3);

            Promise.resolve()
                .then(() => done())
                .catch(done);
        });
    });

    describe("invoke()", () => {
        it("Calls all added callbacks", () => {
            const delegate = new Delegate<void>(
                () => counter += 1,
                () => counter += 2
            );

            let counter = 0;

            delegate.once(() => counter += 3);
            delegate.invoke();
            delegate.invoke();

            expect(counter).equals(9);
        });

        it("Param data given to callbacks", () => {
            const delegate = new Delegate<number>(
                value => counter += value * 1,
                value => counter += value * 2
            );

            let counter = 0;

            delegate.once(value => counter += value * 3);
            delegate.invoke(1);
            delegate.invoke(2);

            expect(counter).equals(12);
        });

        it("Returns undefined", () => {
            const delegate = new Delegate<void>();

            expect(delegate.invoke()).is.undefined;
        });
    });
});