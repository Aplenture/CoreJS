import { StringParameter } from "../parameters/stringParameter";
import { formatDuration, parseArgsFromString, parseArgsToString } from "../utils";
import { Command, CommandAction } from "./command";
import { Event } from "./event";
import { Stopwatch } from "./stopwatch";

const COMMAND_NAME_HELP = 'help';

interface Options {
    readonly fallback?: CommandAction;
}

export class Commander {
    public readonly onCommand = new Event<string, any>('Commander.onCommand');
    public readonly onMessage = new Event<Commander, string>('Commander.onMessage');

    private readonly _commands: NodeJS.Dict<Command> = {};
    private readonly _fallbackCommand: Command;

    constructor(options: Options = {}) {
        this._fallbackCommand = {
            name: '',
            action: options.fallback || (async () => `Unknown command. Type '${COMMAND_NAME_HELP}' to list all known commands.\n`)
        };

        if (!options.fallback) {
            this.add({
                name: COMMAND_NAME_HELP,
                action: async args => this.help(args.command),
                description: 'Lists all commands or returns details of specific <command>.',
                parameters: [
                    new StringParameter('command', 'Lists all commands with this prefix or returns details of specific command.', '')
                ]
            });
        }
    }

    public get count(): number { return Object.keys(this._commands).length; }

    public has(command: string): boolean {
        return !!this._commands[command.toLowerCase()];
    }

    public add(...commands: Command[]) {
        commands.forEach(command => this._commands[command.name.toLowerCase()] = command);
    }

    public remove(command: string) {
        delete this._commands[command.toLowerCase()];
    }

    public execute(command?: string, args?: {}) {
        if (!command)
            command = COMMAND_NAME_HELP;

        const params = parseArgsToString(args);
        const commandLine = params
            ? `${command} ${params}`
            : command;

        return this.executeCommand(commandLine, command, args);
    }

    public executeLine(commandLine?: string) {
        if (!commandLine)
            commandLine = COMMAND_NAME_HELP;

        const split = commandLine.split(' ');
        const command = split[0];
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

            result += '\n';

            return result;
        }

        return commands
            .map(command => `${command.name} - ${command.description || ''}`)
            .join('\n') + '\n';
    }

    private async executeCommand(commandLine: string, command: string, args = {}): Promise<any> {
        command = command.toLowerCase();

        const stopwatch = new Stopwatch();
        const instance = this._commands[command] || this._fallbackCommand;

        let result: any;
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

        this.onMessage.emit(this, `executed '${commandLine}' in ${formatDuration(stopwatch.duration, { seconds: true, milliseconds: true })}`);

        if (error)
            throw error;

        return result;
    }
}