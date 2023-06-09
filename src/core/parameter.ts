import { CoreError } from "./coreError";
import { CoreErrorCode } from "../enums";

export abstract class Parameter<T> {
    public abstract readonly type: string;

    public readonly optional: boolean;

    constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly _default?: T
    ) {
        this.optional = undefined !== _default;
    }

    public parse(data: string): T {
        const result = this.parseData(data);

        if (undefined == result)
            if (this.optional)
                return this._default;
            else
                throw new CoreError(CoreErrorCode.MissingParameter, { name: this.name, type: this.type });

        return result;
    }

    protected abstract parseData(data: string | readonly string[]): T;
}