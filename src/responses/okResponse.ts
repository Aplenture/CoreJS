import { BoolResponse } from "./boolResponse";

export class OKResponse extends BoolResponse {
    constructor() {
        super(true);
    }
}

export const RESPONSE_OK = new OKResponse();