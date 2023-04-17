import { Command, Response } from "../core";
import { Singleton } from "../core/singleton";
import { TextResponse } from "../responses";
import { ArgumentsSerializer, StringSerializer } from "../serializers";

export const KEY_COMMANDS = 'commands.';

interface Args {
    readonly command: string;
}

export class Help extends Command<Args> {
    public readonly description = "Lists all commands.";
    public readonly argumentsSerializer = new ArgumentsSerializer<Args>(
        new StringSerializer("command", "Name of part of name of command to get detailed help.", '')
    );

    public async execute(args: Args): Promise<Response> {
        const commands = this.context.getAll<Singleton<Command<any>>>(KEY_COMMANDS);
        const commandNames = Object.keys(commands)
            .filter(command => command.substring(KEY_COMMANDS.length).includes(args.command))
            .sort((a, b) => a.localeCompare(b));

        const maxCommandNameLength = Math.max(...commandNames.map(command => command.substring(KEY_COMMANDS.length).length));

        let result = "";

        if (1 == commandNames.length) {
            const command = commands[commandNames[0]].instance;

            result += commandNames[0].substring(KEY_COMMANDS.length) + "\n";
            result += command.description + "\n";
            result += command.argumentsSerializer.description;
        } else {
            result += commandNames
                .map(command => `${command.substring(KEY_COMMANDS.length)}${' '.repeat(maxCommandNameLength - command.substring(KEY_COMMANDS.length).length)} - ${commands[command].instance.description}`)
                .join('\n');
            result += '\n';
        }

        return new TextResponse(result);
    }
}