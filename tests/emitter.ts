/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Emitter } from "../src/core";

describe("Emitter", () => {
    describe("toString()", () => {
        it("returns the name", () => {
            const emitter = new Emitter("emitter");

            expect(emitter.toString()).equals(emitter.name);
        });
    });
});