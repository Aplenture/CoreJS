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
            expect(() => new Action(async () => { })).not.throws();
        });

        it("Param event name or once flag or callback of event", () => {
            const event = "my event";
            const once = true;
            const callback = async () => { };

            expect(new Action(event, callback).event).equals(event);
            expect(new Action(once, callback).once).equals(once);
            expect(new Action(callback)["execute"]).equals(callback);
        });

        it("Param emitter name or once flag or callback of event", () => {
            const emitter = "my emitter";
            const once = true;
            const callback = async () => { };

            expect(new Action("event", emitter, callback).emitter).equals(emitter);
            expect(new Action("event", once, callback).once).equals(once);
            expect(new Action("event", callback)["execute"]).equals(callback);
        });

        it("Param once flag or callback of event", () => {
            const once = true;
            const callback = async () => { };

            expect(new Action("event", "emitter", once, callback).once).equals(once);
            expect(new Action("event", "emitter", callback)["execute"]).equals(callback);
        });

        it("Param callback of event", () => {
            const callback = async () => { };

            expect(new Action("event", "emitter", true, callback)["execute"]).equals(callback);
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
            const action = new Action(null, event.emitter, async () => counter += 1);

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
            const action = new Action(null, true, async () => counter += 1);

            let counter = 0;

            action.handleEvent(event);
            action.handleEvent(event);

            expect(counter, "has handled event multiple times").equals(1);
        });

        it("Changes state from once to removing on execution", () => {
            const event = new Event("my event", "my emitter");
            const action = new Action(null, true, async () => { });

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

        it("Calls this.removeFromParent() when state is once and callback finished execution", async () => {
            const event = new Event("my event", "my emitter");
            const action = new MyAction(null, true, async () => { });

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
            expect(new MyAction(null, true, async () => { }).toJSON().state).equals(ActionState.Once);
        });
    });

    describe("fromJSON()", () => {
        it("Parses Action state from object", () => {
            const state = ActionState.Once;
            const action = new MyAction(async () => { });

            expect(action.state).equals(ActionState.Infinite);

            action.fromJSON({ event: null, state });

            expect(action.state).equals(state);
        });

        it("Calls this.removeFromParent() if state is removing", () => {
            const action = new MyAction(async () => { });

            action.fromJSON({ event: null, state: ActionState.Removing });

            expect(action.removeFromParentCalled).is.true;
        });

        it("Returns undefined", () => {
            const action = new MyAction(async () => { });

            expect(action.fromJSON({ event: null, state: ActionState.Removing })).is.undefined;
        });
    });
});