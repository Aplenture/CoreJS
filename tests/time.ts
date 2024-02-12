/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Time } from "../src";

describe("Time", () => {
    describe("format()", () => {
        it("serializes complete Date", () => {
            const format = Time.format("YYYY-MM-DD hh:mm:ss.mss", new Date("2024-02-05T13:37:42.666"));

            expect(format).equals("2024-02-05 13:37:42.666");
        });

        it("serializes without time", () => {
            const format = Time.format("YYYY-MM-DD", new Date("2024-02-05T13:37:42.666"));

            expect(format).equals("2024-02-05");
        });

        it("serializes time only", () => {
            const format = Time.format("hh:mm:ss.mss", new Date("2024-02-05T13:37:42.666"));

            expect(format).equals("13:37:42.666");
        });

        it("serializes without milliseconds", () => {
            const format = Time.format("YYYY-MM-DD hh:mm:ss", new Date("2024-02-05T13:37:42.666"));

            expect(format).equals("2024-02-05 13:37:42");
        });
    });
});