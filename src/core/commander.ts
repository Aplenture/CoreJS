import { Help, KEY_COMMANDS } from "../commands";
import { formatDuration } from "../utils";
import { Command } from "./command";
import { Context } from "./context";
import { Event } from "./event";
import { Response } from "./response";
import { Singleton } from "./singleton";
import { Stopwatch } from "./stopwatch";

export const COMMAND_HELP = Help.name.toLocaleLowerCase();

export class Commander {
    public readonly onMessage = new Event<Commander, string>('Commander.onMessage');
    public readonly onCommand = new Event<string, string>('Commander.onCommand');

    private readonly commands: NodeJS.Dict<Singleton<Command<any>>> = {};

    constructor(
        public readonly name: string,
        public readonly config: Context,
        public readonly context: Context,
        addHelpCommand = true
    ) {
        if (addHelpCommand)
            this.addCommand(COMMAND_HELP, Help);
    }

    public addCommand(command: string, constructor: new (config: Context, context: Context) => Command<any>) {
        const singleton = new Singleton(constructor, this.config, this.context);

        this.commands[command] = singleton;
        this.context.set(`${KEY_COMMANDS}${command}`, singleton);

        singleton.onInstantiated.once(instance => instance.onMessage.on(message => this.onCommand.emit(command, message)));
    }

    public execute(command: string, args = {}) {
        command = command.toLowerCase();

        if (!this.commands[command])
            throw new Error(`Unknown command '${command}'. Type '${COMMAND_HELP}' for help.`);

        const instance = this.commands[command].instance;

        if (!instance.argumentsSerializer)
            return this.executeCommand(command, instance);

        return this.executeCommand(`${command} ${instance.argumentsSerializer.serialize(args)}`, instance, args);
    }

    public executeLine(commandLine: string) {
        const split = commandLine.split(' ');
        const command = split.length
            ? split[0].toLowerCase()
            : COMMAND_HELP;

        if (!this.commands[command])
            throw new Error(`Unknown command '${command}'. Type '${COMMAND_HELP}' for help.`);

        const instance = this.commands[command].instance;

        if (!instance.argumentsSerializer)
            return this.executeCommand(command, instance);

        const args = commandLine.substring(command.length + 1);

        return this.executeCommand(commandLine, instance, instance.argumentsSerializer.deserialize(args));
    }

    public hasCommand(name: string): boolean {
        return !!this.commands[name.toLowerCase()];
    }

    public getCommand<T extends Command<any>>(name: string): T {
        if (!this.commands[name.toLowerCase()])
            throw new Error(`unknown command '${name}'`);

        return this.commands[name.toLowerCase()].instance as T;
    }

    protected async executeCommand(commandLine: string, command: Command<any>, args?: any): Promise<Response> {
        const stopwatch = new Stopwatch();

        try {
            stopwatch.start();
            const result = await command.execute(args);
            stopwatch.stop();

            this.onMessage.emit(this, `executed ${commandLine} in (${formatDuration(stopwatch.duration, { seconds: true, milliseconds: true })})`);

            return result;
        } catch (error) {
            this.onMessage.emit(this, `executed ${commandLine} >> ${error.stack}`);

            throw error;
        }
    }
}