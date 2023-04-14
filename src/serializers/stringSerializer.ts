import { Serializer } from "../core";
import { CoreErrorCode } from "../enums";
import { parseToString } from "../utils";

export class StringSerializer extends Serializer<string>{
    public readonly errorCode = CoreErrorCode.MissingString;

    protected serializeData(data: string): string {
        return parseToString(data);
    }

    protected deserializeData(data: string): string {
        return parseToString(data);
    }
}