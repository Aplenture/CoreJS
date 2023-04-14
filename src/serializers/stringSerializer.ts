import { CoreError } from "../core";
import { CoreErrorCode } from "../enums";
import { Serializer } from "../interfaces";
import { parseToString } from "../utils";

export class StringSerializer implements Serializer<string>{
    public readonly optional: boolean;

    constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly _default?: string
    ) {
        this.optional = undefined === _default;
    }

    public serialize(data: string): string {
        if (undefined == data)
            if (this.optional)
                return this._default;
            else
                throw new CoreError(CoreErrorCode.MissingString, { name: this.name });

        return parseToString(data);
    }

    public deserialie(data: string): string {
        return this.serialize(data);
    }
}