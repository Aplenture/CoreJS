/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Action, ActionState, Event } from "../src";

class MyAction extends Action {
    public removeFromParentCalled = false;

    public get state(): ActionState { return super.state; }
    public set state(value) { super.state = value; }

    public removeFromParent(): void {
        this.removeFromParentCalled = true;
        super.removeFromParent();
    }
}

describe("Action", () => {
    describe("constructor()", () => {
        it("Throws an Error if callback is not given", () => {
            expect(() => new Action("test")).throws("invalid callback function");
            expect(() => new Action("test", "test" as any)).throws("invalid callback function");
        });
    });

    describe("handleEvent()", () => {
        it("Executes callback on event with matching name", () => {
            const event = new Event("my event", "my emitter");
            const action = new Action(event.name, async () => counter += 1);

            let counter = 0;

            action.handleEvent(event);
            action.handleEvent(new Event("any event", event.emitter));

            expect(counter, "has handled event with missmatching name").equals(1);
        });

        it("Executes callback on every event when name is unset", () => {
            const event = new Event("my event", "my emitter");
            const action = new Action(async () => counter += 1);

            let counter = 0;

            action.handleEvent(event);
            action.handleEvent(new Event("any event", event.emitter));

            expect(counter, "has not handled any event").equals(2);
        });

        it("Executes callback on event with matching emitter", () => {
            const event = new Event("my event", "my emitter");
            const action = new Action({ emitter: event.emitter }, async () => counter += 1);

            let counter = 0;

            action.handleEvent(event);
            action.handleEvent(new Event(event.name, "any emitter"));

            expect(counter, "has handled event with missmatching emitter").equals(1);
        });

        it("Executes callback on every event when emitter is unset", () => {
            const event = new Event("my event", "my emitter");
            const action = new Action(async () => counter += 1);

            let counter = 0;

            action.handleEvent(event);
            action.handleEvent(new Event(event.name, "any emitter"));

            expect(counter, "has not handled any event emitter").equals(2);
        });

        it("Executes callback on one event when once is true", () => {
            const event = new Event("my event", "my emitter");
            const action = new Action({ once: true }, async () => counter += 1);

            let counter = 0;

            action.handleEvent(event);
            action.handleEvent(event);

            expect(counter, "has handled event multiple times").equals(1);
        });

        it("Changes state from once to removing on execution", () => {
            const event = new Event("my event", "my emitter");
            const action = new Action({ once: true }, async () => { });

            expect(action.state).equals(ActionState.Once);

            action.handleEvent(event);

            expect(action.state).equals(ActionState.Removing);
        });

        it("Skips callback execution if state is removing", () => {
            const event = new Event("my event", "my emitter");
            const action = new MyAction(async () => counter += 1);

            let counter = 0;

            action.state = ActionState.Removing;
            action.handleEvent(event);

            expect(counter).equals(0);
        });

        it("Calls removeFromParent() when state is once and callback finished execution", async () => {
            const event = new Event("my event", "my emitter");
            const action = new MyAction({ once: true }, async () => { });

            await action.handleEvent(event);

            expect(action.removeFromParentCalled).is.true;
        });

        it("Returns undefined Promise", done => {
            const event = new Event("my event", "my emitter");
            const action = new MyAction(async () => { });
            const result = action.handleEvent(event);

            expect(result).is.a("promise");

            result
                .then(result => expect(result).is.undefined)
                .then(() => done())
                .catch(done);
        });
    });

    describe("toJSON()", () => {
        it("Returns object with state of Action", () => {
            expect(new MyAction(async () => { }).toJSON().state).equals(ActionState.Infinite);
            expect(new MyAction({ once: true }, async () => { }).toJSON().state).equals(ActionState.Once);
        });
    });

    describe("fromJSON()", () => {
        it("Parses Action state from object", () => {
            const state = ActionState.Once;
            const action = new MyAction(async () => { });

            expect(action.state).equals(ActionState.Infinite);

            action.fromJSON({ state });

            expect(action.state).equals(state);
        });

        it("Calls removeFromParent() if state is removing", () => {
            const action = new MyAction(async () => { });

            action.fromJSON({ state: ActionState.Removing });

            expect(action.removeFromParentCalled).is.true;
        });

        it("Returns undefined", () => {
            const action = new MyAction(async () => { });

            expect(action.fromJSON({ state: ActionState.Removing })).is.undefined;
        });
    });
});