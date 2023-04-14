import { Serializer } from "../interfaces";

export class ObjectSerializer<T extends NodeJS.ReadOnlyDict<any> | void> implements Serializer<T>{
    public readonly description: string;

    private readonly parsers: readonly Serializer<any>[];

    constructor(
        public readonly name: string,
        public readonly optional: boolean,
        ...parsers: Serializer<any>[]
    ) {
        const maxNameLength = Math.max(...parsers.map(property => property.name.length));

        this.parsers = parsers;
        this.description = parsers.map(property => '  ' + property.name + ' '.repeat(maxNameLength - property.name.length) + ' - ' + (property.optional ? '(optional) ' : '') + property.description).join("\n");
    }

    public serialize(data: T): string {
        const tmp = {};

        this.parsers.forEach(parser => tmp[parser.name] = parser.serialize(data[parser.name]));

        return JSON.stringify(tmp);
    }

    public deserialie(data: string): T {
        const result = JSON.parse(data);

        this.parsers.forEach(parser => result[parser.name] = parser.deserialie(result[parser.name]));

        return result;
    }
}