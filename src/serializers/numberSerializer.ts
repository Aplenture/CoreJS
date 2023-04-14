import { CoreError } from "../core";
import { CoreErrorCode } from "../enums";
import { Serializer } from "../interfaces";
import { parseToNumber, parseToString } from "../utils";

export class NumberSerializer implements Serializer<number>{
    public readonly optional: boolean;

    private readonly deserializedDefault: number;
    private readonly serializedDefault: string;

    constructor(
        public readonly name: string,
        public readonly description: string,
        _default?: number
    ) {
        this.optional = undefined === _default;
        this.deserializedDefault = _default;
        this.serializedDefault = parseToString(_default);
    }

    public serialize(data: number): string {
        const result = parseToString(data);

        if (undefined == result)
            if (this.optional)
                return this.serializedDefault;
            else
                throw new CoreError(CoreErrorCode.MissingNumber, { name: this.name });

        return result;
    }

    public deserialie(data: string): number {
        const result = parseToNumber(data);

        if (undefined == result)
            if (this.optional)
                return this.deserializedDefault;
            else
                throw new CoreError(CoreErrorCode.MissingNumber, { name: this.name });

        return result;
    }
}