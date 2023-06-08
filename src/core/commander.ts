import { StringParameter } from "../parameters";
import { formatDuration, parseArgsFromString, parseArgsToString } from "../utils";
import { Command, CommandAction } from "./command";
import { Event } from "./event";
import { Stopwatch } from "./stopwatch";

const COMMAND_NAME_HELP = 'help';

interface Options<T> {
    readonly fallback?: CommandAction<T>;
}

export class Commander<T> {
    public readonly onCommand = new Event<string, any>('Commander.onCommand');
    public readonly onMessage = new Event<Commander<T>, string>('Commander.onMessage');

    private readonly _commands: NodeJS.Dict<Command<T>> = {};
    private readonly _fallbackCommand: Command<T>;

    constructor(options: Options<T> = {}) {
        this._fallbackCommand = {
            name: '',
            action: options.fallback || (async () => this.onMessage.emit(this, `Unknown command. Type '${COMMAND_NAME_HELP}' to list all known commands.`))
        };

        if (!options.fallback) {
            this.add({
                name: COMMAND_NAME_HELP,
                action: async args => this.onMessage.emit(this, this.help(args.command)),
                description: 'Lists all known commands or returns details of specific <command>.',
                parameters: [
                    new StringParameter('command', 'Lists all commands with this prefix or returns details of specific command.', '')
                ]
            });
        }
    }

    public add(...commands: Command<T>[]) {
        commands.forEach(command => this._commands[command.name.toLowerCase()] = command);
    }

    public remove(command: string) {
        delete this._commands[command.toLowerCase()];
    }

    public execute(command = COMMAND_NAME_HELP, args?: {}) {
        const params = parseArgsToString(args);

        return this.executeCommand(`${command} ${params}`, command, args);
    }

    public executeLine(commandLine: string) {
        const split = commandLine.split(' ');
        const command = split[0] || COMMAND_NAME_HELP;
        const args = parseArgsFromString(commandLine.substring(command.length));

        return this.executeCommand(commandLine, command, args);
    }

    public help(prefix = ''): string {
        prefix = prefix.toLowerCase();

        const commands = Object.values(this._commands).filter(command => !prefix || 0 == command.name.indexOf(prefix));

        if (1 == commands.length) {
            let result = commands[0].name + '\n';

            if (commands[0].description)
                result += commands[0].description + '\n';

            result += '\n';

            if (commands[0].parameters)
                result += commands[0].parameters
                    .map(param => `${param.name} - ${param.description || ''}`)
                    .join('\n');

            return result;
        }

        return commands
            .map(command => `${command.name} - ${command.description || ''}`)
            .join('\n');
    }

    private async executeCommand(commandLine: string, command: string, args = {}): Promise<T | void> {
        command = command.toLowerCase();

        const stopwatch = new Stopwatch();
        const instance = this._commands[command] || this._fallbackCommand;

        let result: T | void;
        let error: Error;

        if (instance.parameters)
            instance.parameters.forEach(param => args[param.name] = param.parse(args[param.name]));

        stopwatch.start();

        try {
            this.onCommand.emit(command, args);

            result = await instance.action(args);
        } catch (e) {
            error = e;

            this.onMessage.emit(this, `${commandLine} >> ${e.stack}`);
        }

        stopwatch.stop();

        this.onMessage.emit(this, `executed ${commandLine} in ${formatDuration(stopwatch.duration, { seconds: true, milliseconds: true })}`);

        if (error)
            throw error;

        return result;
    }
}