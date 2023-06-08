import { Parameter } from "../core";
import { parseToString } from "../utils";

export class StringParameter extends Parameter<string>{
    public readonly type = 'string';

    protected parseData(data: string): string {
        return parseToString(data);
    }
}