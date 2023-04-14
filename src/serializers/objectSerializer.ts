import { Serializer } from "../core";
import { CoreErrorCode } from "../enums";

export class ObjectSerializer<T extends NodeJS.ReadOnlyDict<any> | void> extends Serializer<T>{
    public readonly errorCode = CoreErrorCode.MissingData;

    private readonly parsers: readonly Serializer<any>[];

    constructor(name: string, ...parsers: Serializer<any>[]) {
        const maxNameLength = Math.max(...parsers.map(property => property.name.length));

        super(name, parsers.map(property => '  ' + property.name + ' '.repeat(maxNameLength - property.name.length) + ' - ' + (property.optional ? '(optional) ' : '') + property.description).join("\n"));

        this.parsers = parsers;
    }

    protected serializeData(data: T): string {
        const tmp = {};

        this.parsers.forEach(parser => tmp[parser.name] = parser.serialize(data[parser.name]));

        return JSON.stringify(tmp);
    }

    protected deserializeData(data: string): T {
        const result = JSON.parse(data);

        this.parsers.forEach(parser => result[parser.name] = parser.deserialize(result[parser.name]));

        return result;
    }
}