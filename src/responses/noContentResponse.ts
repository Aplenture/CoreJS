import { ResponseCode } from "../enums";
import { TextResponse } from "./textResponse";

export class NoContentResponse extends TextResponse {
    constructor() {
        super("", ResponseCode.NoContent);
    }
}

export const RESPONSE_NO_CONTENT = new NoContentResponse();