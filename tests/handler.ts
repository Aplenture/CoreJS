/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Handler } from "../src";

class MyHandler extends Handler<Handler<any>> {
    constructor(name: string, public readonly data: NodeJS.Dict<any>) {
        super(name);
    }

    public get<T>(key: string): T {
        return this.data[key];
    }

    public set(key: string, value: any) {
        this.data[key] = value;
    }
}

describe("Handler", () => {
    describe("get()", () => {
        it("returns undefined without parent", () => {
            const handler = new Handler("handler");

            expect(handler.get("hello")).is.undefined;
        });

        it("returns value of parent", () => {
            const parent = new MyHandler("parent", { hello: "world" });
            const child = new Handler<any>("child");

            parent.append(child);

            expect(child.get("hello")).equals("world");
        });
    });

    describe("set()", () => {
        it("sets value of parent", () => {
            const parent = new MyHandler("parent", { hello: "world" });
            const child = new Handler<any>("child");

            parent.append(child);
            child.set("hello", -1);

            expect(parent.get("hello")).equals(-1);
        });
    });
});