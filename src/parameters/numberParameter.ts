import { Parameter } from "../core/parameter";
import { parseToNumber } from "../utils";

export class NumberParameter extends Parameter<number>{
    public readonly type = 'number';

    protected parseData(data: string): number {
        return parseToNumber(data);
    }
} 