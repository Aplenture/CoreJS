import { Serializer } from "../core";
import { CoreErrorCode } from "../enums";

export class ObjectSerializer<T extends NodeJS.ReadOnlyDict<any> | void> extends Serializer<T>{
    public readonly errorCode = CoreErrorCode.MissingData;

    private readonly parsers: readonly Serializer<any>[];

    constructor(name: string, description: string, ...parsers: Serializer<any>[]) {
        super(name, description);

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