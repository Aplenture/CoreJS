import { Serializer } from "../core";
import { CoreErrorCode } from "../enums";
import { parseToNumber, parseToString } from "../utils";

export class NumberSerializer extends Serializer<number>{
    public readonly errorCode = CoreErrorCode.MissingNumber;

    protected serializeData(data: number): string {
        return parseToString(data);
    }

    protected deserializeData(data: string): number {
        return parseToNumber(data);
    }
} 