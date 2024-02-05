/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Serialization } from "../src";

describe("Serialization", () => {
    describe("toString()", () => {
        it("serializes an object", () => {
            expect(Serialization.toString({
                string: "hello world",
                number: -1,
                boolean: true
            })).equals("--string hello world --number -1 --boolean true");
        });
    });
});