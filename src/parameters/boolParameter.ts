import { Parameter } from "../core/parameter";
import { parseToBool } from "../utils";

export class BoolParameter extends Parameter<boolean>{
    public readonly type = 'boolean';

    protected parseData(data: string): boolean {
        return parseToBool(data);
    }
}