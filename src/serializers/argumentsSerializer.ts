import { Serializer } from "../core";
import { CoreErrorCode } from "../enums";
import { parseArgs } from "../utils";

export class ArgumentsSerializer<T extends NodeJS.ReadOnlyDict<any> | void> extends Serializer<T>{
    public readonly errorCode = CoreErrorCode.MissingData;

    private readonly parsers: readonly Serializer<any>[];

    constructor(...parsers: Serializer<any>[]) {
        const maxNameLength = Math.max(...parsers.map(property => property.name.length));

        super("", parsers.map(property => '  ' + property.name + ' '.repeat(maxNameLength - property.name.length) + ' - ' + (property.optional ? '(optional) ' : '') + property.description).join("\n"));

        this.parsers = parsers;
    }

    protected serializeData(data: T): string {
        return this.parsers
            .map(parser => `--${parser.name} ${parser.serialize(data[parser.name])}`)
            .join(' ');
    }

    protected deserializeData(data: string): T {
        const result = parseArgs(data);

        this.parsers.forEach(parser => result[parser.name] = Array.isArray(result[parser.name])
            ? (result[parser.name] as string[]).map(str => parser.deserialize(str))
            : parser.deserialize(result[parser.name] as string)
        );

        return result as T;
    }
}