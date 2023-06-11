import { StringParameter } from "../parameters/stringParameter";
import { formatDuration, parseArgsFromString, parseArgsToString } from "../utils";
import { Command, CommandAction } from "./command";
import { Event } from "./event";
import { Stopwatch } from "./stopwatch";

const COMMAND_NAME_HELP = 'help';

interface Options {
    readonly fallback?: CommandAction<any>;
}

export class Commander {
    public readonly onMessage = new Event<Commander, string>('Commander.onMessage');

    private readonly _commands: NodeJS.Dict<Command<any>> = {};
    private readonly _fallbackCommand: Command<any>;

    constructor(options: Options = {}) {
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

    public get count(): number { return Object.keys(this._commands).length; }

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

        if (instance.parameters)
            instance.parameters.forEach(param => args[param.name] = param.parse(args[param.name]));

        stopwatch.start();

        const result = await instance.action(args);

        stopwatch.stop();

        this.onMessage.emit(this, `executed '${commandLine}' in ${formatDuration(stopwatch.duration, { seconds: true, milliseconds: true })}`);

        return result;
    }
}