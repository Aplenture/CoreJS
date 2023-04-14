import { CoreError } from ".";

export abstract class Serializer<T> {
    public abstract readonly errorCode: number;

    public readonly optional: boolean;

    private readonly deserializedDefault: T;
    private readonly serializedDefault: string;

    constructor(
        public readonly name: string,
        public readonly description: string,
        _default?: T
    ) {
        this.optional = undefined === _default;
        this.deserializedDefault = _default;
        this.serializedDefault = this.serializeData(_default);
    }

    public serialize(data: T): string {
        const result = this.serializeData(data);

        if (undefined == result)
            if (this.optional)
                return this.serializedDefault;
            else
                throw new CoreError(this.errorCode, { name: this.name });

        return result;
    }

    public deserialize(data: string): T {
        const result = this.deserializeData(data);

        if (undefined == result)
            if (this.optional)
                return this.deserializedDefault;
            else
                throw new CoreError(this.errorCode, { name: this.name });

        return result;
    }

    protected abstract serializeData(data: T): string;
    protected abstract deserializeData(data: string): T;
}