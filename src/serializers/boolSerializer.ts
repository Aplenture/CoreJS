import { CoreError } from "../core";
import { CoreErrorCode } from "../enums";
import { Serializer } from "../interfaces";
import { parseToBool, parseToString } from "../utils";

export class BoolSerializer implements Serializer<boolean>{
    public readonly optional: boolean;

    private readonly deserializedDefault: boolean;
    private readonly serializedDefault: string;

    constructor(
        public readonly name: string,
        public readonly description: string,
        _default?: boolean
    ) {
        this.optional = undefined === _default;
        this.deserializedDefault = _default;
        this.serializedDefault = parseToString(_default);
    }

    public serialize(data: boolean): string {
        const result = parseToString(data);

        if (undefined == result)
            if (this.optional)
                return this.serializedDefault;
            else
                throw new CoreError(CoreErrorCode.MissingBool, { name: this.name });

        return result;
    }

    public deserialie(data: string): boolean {
        const result = parseToBool(data);

        if (undefined == result)
            if (this.optional)
                return this.deserializedDefault;
            else
                throw new CoreError(CoreErrorCode.MissingBool, { name: this.name });

        return result;
    }
}