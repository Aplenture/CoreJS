import { BoolResponse } from "./boolResponse";

export class OKResponse extends BoolResponse {
    constructor() {
        super(true);
    }
}