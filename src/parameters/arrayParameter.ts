import { Parameter } from "../core/parameter";
import { parseToString } from "../utils";

export class ArrayParameter extends Parameter<string[]>{
    public readonly type = 'array';

    protected parseData(data: string | readonly string[]): string[] {
        return Array.isArray(data)
            ? data.map(data => parseToString(data))
            : [parseToString(data)];
    }
}