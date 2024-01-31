/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2023 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { ActionHandler, Emitter, Event } from "../src";

describe("ActionHandler", () => {
    describe("callback", () => {
        it("is called with event argument", done => {
            const event = new Event("event", {}, new Emitter("emitter"));
            const handler = new ActionHandler({ callback: event => output = event });

            let output: Event;

            handler.handleEvent(event);

            Promise.resolve()
                .then(() => expect(output).equals(event))
                .then(() => done())
                .catch(done);
        });
    });
});