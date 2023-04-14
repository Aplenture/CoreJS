import { Serializer } from "../core";
import { CoreErrorCode } from "../enums";
import { parseToBool, parseToString } from "../utils";

export class BoolSerializer extends Serializer<boolean>{
    public readonly errorCode = CoreErrorCode.MissingBool;

    protected serializeData(data: boolean): string {
        return parseToString(data);
    }

    protected deserializeData(data: string): boolean {
        return parseToBool(data);
    }
}