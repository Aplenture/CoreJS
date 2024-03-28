/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Action, Controller, EVENT_DEBUG, EVENT_ENABLED_CHANGED, EVENT_INIT, Event, Module } from "../src";

describe.only("Controller", () => {
    describe("constructor()", () => {
        it("Param name of Controller, concatinated with classes", () => {
            const controller = new MyController("my", "test", "controller");

            expect(controller.name).equals("my/test/controller");
        });

        it("Param classes optional prefixes of Controller name", () => {
            const controller = new MyController("controller");

            expect(controller.name).equals("controller");
        });
    });

    describe("initialized", () => {
        it("Calls this.get() with init event", () => {
            const controller = new MyController("controller");

            controller.initialized;

            expect(controller.getKey).equals(EVENT_INIT);
        });

        it("Returns true when parent is initialized", () => {
            const controller = new MyController("controller");
            const parent = new Parent("parent");

            parent.initialized = true;
            parent.append(controller);

            expect(controller.initialized).is.true;
        });

        it("Returns false when parent is not initialized", () => {
            const controller = new MyController("controller");
            const parent = new Parent("parent");

            parent.initialized = false;
            parent.append(controller);

            expect(controller.initialized).is.false;
        });

        it("Returns false when parent is unset", () => {
            const controller = new MyController("controller");

            expect(controller.initialized).is.false;
        });
    });

    describe("debug", () => {
        describe("get", () => {
            it("Calls this.get() with debug event", () => {
                const controller = new MyController("controller");

                controller.debug;

                expect(controller.getKey).equals(EVENT_DEBUG);
            });

            it("Returns true when parent is in debug mode", () => {
                const controller = new MyController("controller");
                const parent = new Parent("parent");

                parent.debug = true;
                parent.append(controller);

                expect(controller.debug).is.true;
            });

            it("Returns false when parent is not in debug mode", () => {
                const controller = new MyController("controller");
                const parent = new Parent("parent");

                parent.debug = false;
                parent.append(controller);

                expect(controller.debug).is.false;
            });

            it("Returns false when parent is unset", () => {
                const controller = new MyController("controller");

                expect(controller.debug).is.false;
            });
        });

        describe("set", () => {
            it("Calls this.set() with debug event", () => {
                const controller = new MyController("controller");

                controller.debug = true;

                expect(controller.setKey).equals(EVENT_DEBUG);
            });

            it("Changes parents debug mode", () => {
                const controller = new MyController("controller");
                const parent = new Parent("parent");

                parent.append(controller);
                controller.debug = true;

                expect(parent.debug).is.true;
            });
        });
    });

    describe("enabled", () => {
        it("Default is true", () => {
            const controller = new MyController("controller");

            expect(controller.enabled).is.true;
        });

        it("Returns false when Controller is disabled", () => {
            const controller = new MyController("controller");

            controller.enabled = false;

            expect(controller.enabled).is.false;
        });

        it("Returns true when parent is enabled", () => {
            const controller = new MyController("controller");
            const parent = new Parent("parent");

            parent.enabled = true;
            parent.append(controller)

            expect(controller.enabled).is.true;
        });

        it("Returns false when parent is disabled", () => {
            const controller = new MyController("controller");
            const parent = new Parent("parent");

            parent.enabled = false;
            parent.append(controller)

            expect(controller.enabled).is.false;
        });

        it("Returns true when Controller is enabled and parent is unset", () => {
            const controller = new MyController("controller");

            controller.enabled = true;

            expect(controller.enabled).is.true;
        });

        it("Calls this.emit() with enabled changed event when parent is enabled", () => {
            const controller = new MyController("controller");
            const parent = new Parent("parent");

            parent.enabled = true;
            parent.append(controller);

            // test it by disabling
            controller.enabled = false;
            expect(controller.emitEvent).equals(EVENT_ENABLED_CHANGED);

            // test it by enabling
            controller.emitEvent = "";
            controller.enabled = true;
            expect(controller.emitEvent).equals(EVENT_ENABLED_CHANGED);
        });

        it("Calls this.emit() with enabled changed event when parent is unset", () => {
            const controller = new MyController("controller");

            // test it by disabling
            controller.enabled = false;
            expect(controller.emitEvent).equals(EVENT_ENABLED_CHANGED);

            // test it by enabling
            controller.emitEvent = "";
            controller.enabled = true;
            expect(controller.emitEvent).equals(EVENT_ENABLED_CHANGED);
        });

        it("Skips calling this.emit() when parent is disabled", () => {
            const controller = new MyController("controller");
            const parent = new Parent("parent");

            parent.enabled = false;
            parent.append(controller);

            // test it by disabling
            controller.enabled = false;
            expect(controller.emitEvent).is.undefined;

            // test it by enabling
            controller.enabled = true;
            expect(controller.emitEvent).is.undefined;
        });

        it("Calls this.onEnabled() on true when parent is enabled", () => {
            const controller = new MyController("controller");
            const parent = new Parent("parent");

            parent.enabled = true;
            parent.append(controller);

            controller.enabled = false;
            controller.enabled = true;

            expect(controller.onEnabledCalled).is.true;
        });

        it("Calls this.onEnabled() on true when parent is unset", () => {
            const controller = new MyController("controller");

            controller.enabled = false;
            controller.enabled = true;

            expect(controller.onEnabledCalled).is.true;
        });

        it("Skips calling this.onEnabled() when parent is disabled", () => {
            const controller = new MyController("controller");
            const parent = new Parent("parent");

            parent.enabled = false;
            parent.append(controller);

            controller.enabled = false;
            controller.enabled = true;

            expect(controller.onEnabledCalled).is.false;
        });

        it("Calls this.onDisabled() on false when parent is enabled", () => {
            const controller = new MyController("controller");
            const parent = new Parent("parent");

            parent.enabled = true;
            parent.append(controller);

            controller.enabled = false;

            expect(controller.onDisabledCalled).is.true;
        });

        it("Calls this.onDisabled() on false when parent is unset", () => {
            const controller = new MyController("controller");

            controller.enabled = false;

            expect(controller.onDisabledCalled).is.true;
        });

        it("Skips calling this.onDisabled() when parent is disabled", () => {
            const controller = new MyController("controller");
            const parent = new Parent("parent");

            parent.enabled = false;
            parent.append(controller);

            controller.enabled = false;

            expect(controller.onDisabledCalled).is.false;
        });

        it("Skips all handling when value does not change current enabled state to avoid duplicate emits", () => {
            const controller = new MyController("controller");

            controller.enabled = true;

            expect(controller.emitEvent).is.undefined;
            expect(controller.onEnabledCalled).is.false;
            expect(controller.onDisabledCalled).is.false;

            controller.enabled = false;
            controller.onDisabledCalled = false;
            controller.enabled = false;

            expect(controller.onDisabledCalled).is.false;
        });
    });

    describe("has()", () => {
        it("Calls parent.has()", () => {
            const controller = new MyController("controller");
            const parent = new Parent("parent");

            parent.append(controller);

            controller.has("hello");

            expect(parent.hasKey).equals("hello");
        });

        it("Returns true if value is set in parent", () => {
            const controller = new MyController("controller");
            const parent = new Parent("parent");

            parent.append(controller);

            expect(controller.has(EVENT_INIT)).is.true;
        });

        it("false if value is unset in parent", () => {
            const controller = new MyController("controller");
            const parent = new Parent("parent");

            parent.append(controller);

            expect(controller.has("hello world")).is.false;
        });

        it("false if parent is not set", () => {
            const controller = new MyController("controller");

            expect(controller.has(EVENT_INIT)).is.false;
        });
    });

    describe("get()", () => {
        it("Calls parent.get()", () => {
            const controller = new MyController("controller");
            const parent = new Parent("parent");

            parent.append(controller);

            controller.get("hello");

            expect(parent.getKey).equals("hello");
        });

        it("Returns the value of parent", () => {
            const controller = new MyController("controller");
            const parent = new Parent("parent");

            parent.append(controller);

            expect(controller.get(EVENT_INIT, true)).is.false;
            expect(controller.get("hello", "world")).is.undefined;
        });

        it("_default if parent is not set", () => {
            const controller = new MyController("controller");

            expect(controller.get("hello", "world")).equals("world");
        });
    });

    describe("set()", () => {
        it("Calls parent.set()", () => {
            const controller = new MyController("controller");
            const parent = new Parent("parent");

            parent.append(controller);

            controller.set("hello", "world");

            expect(parent.setKey).equals("hello");
        });

        it("Catches unset parent", () => {
            const controller = new MyController("controller");

            expect(() => controller.set("hello", "world")).not.throw();
        });

        it("Returns void", () => {
            const controller = new MyController("controller");

            expect(controller.set("hello", "world")).is.undefined;
        });
    });

    describe("append()", () => {
        it("Appends Controller", () => {
            const parent = new MyController("parent");
            const child = new MyController("child");

            expect(parent.children).has.length(0);

            parent.append(child);

            expect(parent.handlers).has.length(0);
            expect(parent.children).has.length(1);
            expect(parent.children).contains(child);
        });

        it("Appends Handler", () => {
            const parent = new MyController("parent");
            const handler = new Action(async () => { });

            expect(parent.handlers).has.length(0);

            parent.append(handler);

            expect(parent.children).has.length(0);
            expect(parent.handlers).has.length(1);
            expect(parent.handlers).contains(handler);
        });

        it("It`s recommended to call super.append()", () => {
            const parent = new MyController("parent");
            const child = new MyController("child");

            parent.append(child);

            expect(child.parent).equals(parent);
        });
    });

    describe("depend()", () => {
        it("Depends Controller", () => {
            const parent = new MyController("parent");
            const child = new MyController("child");

            parent.append(child);
            parent.depend(child);

            expect(parent.children).has.length(0);
        });

        it("Depends Handler", () => {
            const parent = new MyController("parent");
            const handler = new Action(async () => { });

            parent.append(handler);
            parent.depend(handler);

            expect(parent.handlers).has.length(0);
        });

        it("It`s recommended to call super.depend()", () => {
            const parent = new MyController("parent");
            const child = new MyController("child");

            expect(() => parent.depend(child)).throws("parent is not this");
        });
    });

    describe("on()", () => {
        it("Appends an Action by this.append()", () => {
            const controller = new MyController("controller");
            const event = "my event";
            const emitter = "my emitter";
            const callback = async () => { };

            controller.on(event, emitter, callback);

            expect(controller.appended.event, "event").equals(event);
            expect(controller.appended.emitter, "emitter").equals(emitter);
            expect(controller.appended.once, "once").equals(false);
            expect(controller.appended.execute, "callback").equals(callback);
        });

        it("Throws an Error on init event Handler because init event Handler should be appended by once()", () => {
            const controller = new MyController("controller");

            expect(() => controller.on(EVENT_INIT, async () => { })).throws("use once() instead to append init event Handler");
        });
    });

    describe("once()", () => {
        it("Appends an once called Action by this.append()", () => {
            const controller = new MyController("controller");
            const event = "my event";
            const emitter = "my emitter";
            const callback = async () => { };

            controller.once(event, emitter, callback);

            expect(controller.appended.event, "event").equals(event);
            expect(controller.appended.emitter, "emitter").equals(emitter);
            expect(controller.appended.once, "once").equals(true);
            expect(controller.appended.execute, "callback").equals(callback);
        });

        it("Ignores init event handlers when Controller is already initialized", () => {
            const controller = new Parent("controller");

            controller.initialized = true;
            controller.once(EVENT_INIT, async () => { });

            expect(controller.appended).is.undefined;
        });
    });

    describe("off()", () => {
        it("Depends all event Handler with specific event name", () => {
            const controller = new MyController("controller");
            const event = "my event";
            const namedAction = new Action(event, async () => { });
            const unnamedAction = new Action(async () => { });

            controller.append(namedAction);
            controller.append(unnamedAction);
            controller.off(event);

            expect(namedAction.parent, "named action").is.null;
            expect(unnamedAction.parent, "unnamed action").equals(controller);
        });

        it("Depends all event Handler if event argument is not given", () => {
            const controller = new MyController("controller");
            const event = "my event";
            const namedAction = new Action(event, async () => { });
            const unnamedAction = new Action(async () => { });

            controller.append(namedAction);
            controller.append(unnamedAction);
            controller.off();

            expect(namedAction.parent, "named action").is.null;
            expect(unnamedAction.parent, "unnamed action").is.null;
        });

        it("Calls this.depend()", () => {
            const controller = new MyController("controller");
            const action = new Action(async () => { });

            controller.append(action);
            controller.off();

            expect(controller.depended).equals(action);
        });

        it("Ignores appended Controller", () => {
            const parent = new MyController("parent");
            const child = new MyController("child");

            parent.append(child);
            parent.off();

            expect(child.parent).equals(parent);
        });
    });

    describe("emit()", () => {
        it("Calls parent.emit() if parent is set", () => {
            const controller = new MyController("controller");
            const parent = new Parent("parent");
            const event = "hello world";

            parent.append(controller);
            controller.emit(event);

            expect(parent.emitEvent).equals(event);
        });

        it("Handles emitted event by all appended Handler and Controller if parent is not set", done => {
            const parent = new MyController("parent");
            const child = new MyController("child");
            const emitted = "hello world";

            let parentEvent: string;
            let childEvent: string;

            child.append(new Action(async a => childEvent = a.name));

            parent.append(new Action(async a => parentEvent = a.name));
            parent.append(child);
            parent.emit(emitted);

            Promise.resolve()
                .then(() => expect(parentEvent).equals(emitted, "parent"))
                .then(() => expect(childEvent).equals(emitted, "child"))
                .then(() => done())
                .catch(done);
        });

        it("Throws an Error if enabled is false", () => {
            const controller = new MyController("controller");

            controller.enabled = false;

            expect(() => controller.emit("hello world")).throws("controller is disabled");
        });

        it("Handles event by Promise, after returning Event", done => {
            const controller = new MyController("controller");

            let handled = false;

            controller.on(async () => handled = true);
            controller.emit("hello world");

            expect(handled).is.false;

            Promise.resolve()
                .then(() => expect(handled).is.true)
                .then(() => done())
                .catch(done);
        });

        it("Calls event.retain() before handling by appended Handler and Controller", () => {
            const controller = new MyController("controller");

            controller.on(async () => expect(event.finished).is.false);

            const event = controller.emit("hello world");

            expect(event.finished).is.false;
        });

        it("Calls event.release() after handling is done", done => {
            const controller = new MyController("controller");

            let handled = false;

            controller.on(async () => handled = true);

            const event = controller.emit("hello world");

            event
                .then(() => expect(handled).is.true)
                .then(() => expect(event.finished).is.true)
                .then(() => done())
                .catch(done);
        });

        it("Returns handled Event", () => {
            const controller = new MyController("controller");

            expect(controller.emit("hello world")).instanceOf(Event);
        });
    });

    describe("toJSON()", () => {
        it("Returns Object with name", () => {
            const controller = new MyController("my controller");

            expect(controller.toJSON()).contains({ name: controller.name });
        });

        it("Returns Object with enabled state", () => {
            const controller = new MyController("controller");

            expect(controller.toJSON()).contains({ enabled: true });

            controller.enabled = false;

            expect(controller.toJSON()).contains({ enabled: false });
        });

        it("Returns Object with children mapped by toJSON()", () => {
            const controller = new MyController("controller");
            const child = new MyController("child");

            controller.append(child);

            const children = controller.toJSON().children;

            expect(children, "children").is.an("Array");
            expect(children, "children").has.length(1);
            expect(children[0], "children[0]").deep.equals(child.toJSON());
        });

        it("Returns Object with handlers mapped by toJSON()", () => {
            const controller = new MyController("controller");
            const action = new Action(async () => { });

            controller.append(action);

            const handlers = controller.toJSON().handlers;

            expect(handlers, "handlers").is.an("Array");
            expect(handlers, "handlers").has.length(1);
            expect(handlers[0], "handlers[0]").deep.equals(action.toJSON());
        });
    });
});

class MyController extends Controller<any> {
    public getKey: string;
    public setKey: string;
    public hasKey: string;
    public emitEvent: Event | string;
    public onEnabledCalled = false;
    public onDisabledCalled = false;
    public appended: any;
    public depended: any;

    public has(key: string): boolean {
        this.hasKey = key;
        return super.has(key);
    }

    public get<T>(key: string, _default?: T | undefined): T {
        this.getKey = key;
        return super.get(key, _default);
    }

    public set(key: string, value: any): void {
        this.setKey = key;
        super.set(key, value);
    }

    public emit(event: string | Event, args?: NodeJS.ReadOnlyDict<any> | undefined, emitter?: string): Event {
        this.emitEvent = event;
        return super.emit(event, args, emitter);
    }

    public append(child: Module<Module<any>>): void {
        this.appended = child;
        super.append(child);
    }

    public depend(child: Module<Module<any>>): void {
        this.depended = child;
        super.depend(child);
    }

    protected onEnabled(): void {
        this.onEnabledCalled = true;
        super.onEnabled();
    }

    protected onDisabled(): void {
        this.onDisabledCalled = true;
        super.onDisabled();
    }
}

class Parent extends MyController {
    private values = {
        init: false,
        debug: false
    }

    public get initialized() { return super.initialized; }
    public set initialized(value) { this.values.init = value; }

    public get debug() { return super.debug; }
    public set debug(value) { this.values.debug = value; }

    public get<T>(key: string, _default?: T | undefined): T {
        super.get(key, _default);
        return this.values[key];
    }

    public set(key: string, value: any): void {
        super.set(key, value);
        this.values[key] = value;
    }

    public has(key: string): boolean {
        super.has(key);
        return this.values[key] !== undefined;
    }
}