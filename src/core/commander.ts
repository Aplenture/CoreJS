import { StringParameter } from "../parameters/stringParameter";
import { formatDuration, parseArgsFromString, parseArgsToString } from "../utils";
import { Command, CommandAction } from "./command";
import { Event } from "./event";
import { Parameter } from "./parameter";
import { Stopwatch } from "./stopwatch";

const COMMAND_NAME_HELP = 'help';

interface Options {
    readonly description?: string;
    readonly parameters?: readonly Parameter<any>[];
    readonly globalArgs?: NodeJS.ReadOnlyDict<any>;
    readonly fallback?: CommandAction<any>;
}

export class Commander {
    public readonly onMessage = new Event<Commander, string>('Commander.onMessage');

    public readonly description: string;
    public readonly parameters: readonly Parameter<any>[];
    public readonly globalArgs: NodeJS.Dict<any>;

    private readonly _commands: NodeJS.Dict<Command<any>> = {};
    private readonly _fallbackCommand: Command<any>;

    constructor(options: Options = {}) {
        this.description = options.description || "";
        this.parameters = options.parameters || [];
        this.globalArgs = options.globalArgs || {};

        this._fallbackCommand = {
            name: '',
            action: options.fallback || (async () => `Unknown command. Type '${COMMAND_NAME_HELP}' to list all known commands.\n`)
        };

        if (!options.fallback) {
            this.set({
                name: COMMAND_NAME_HELP,
                action: async args => this.help(args.command && args.command.toString()),
                description: 'Lists all commands or returns details of specific <command>.',
                parameters: [
                    new StringParameter('command', 'Lists all commands with this prefix or returns details of specific command.', '')
                ]
            });
        }
    }

    public has(command: string): boolean {
        return !!this._commands[command.toLowerCase()];
    }

    public set(command: Command<any>) {
        this._commands[command.name.toLowerCase()] = command;
    }

    public remove(command: string) {
        delete this._commands[command.toLowerCase()];
    }

    public clear() {
        for (const key in this._commands)
            delete this._commands[key];
    }

    public execute(command?: string, args?: any) {
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

        let result = "";

        if (1 < commands.length && this.description)
            result += this.description + '\n\n';

        if (this.parameters.length)
            result += 'Global parameters:\n' + this.parameters
                .map(param => `${param.name} - ${param.description || ''}`)
                .join('\n') + '\n\n';

        if (0 < commands.length)
            result += 'Command(s):\n' + commands
                .map(command => `${command.name} - ${command.description || ''}`)
                .join('\n') + '\n';

        if (1 == commands.length && commands[0].parameters && commands[0].parameters.length)
            result += '\nCommand parameters:\n' + commands[0].parameters
                .map(param => `${param.name} - ${param.description || ''}`)
                .join('\n') + '\n';

        if (0 == commands.length)
            result += 'No commands found!\n';

        return result;
    }

    private async executeCommand(commandLine: string, command: string, args?: any): Promise<any> {
        command = command.toLowerCase();
        args = Object.assign({}, this.globalArgs, args);

        const stopwatch = new Stopwatch();
        const instance = this._commands[command] || this._fallbackCommand;

        if (instance.parameters)
            instance.parameters.forEach(param => args[param.name] = param.parse(args[param.name]));

        stopwatch.start();

        const result = await instance.action(args);

        stopwatch.stop();

        this.onMessage.emit(this, `executed '${commandLine}' in ${formatDuration(stopwatch.duration, { seconds: true, milliseconds: true })}`);

        return result;
    }
}