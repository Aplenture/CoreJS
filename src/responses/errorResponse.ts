import { ResponseCode } from "../enums";
import { TextResponse } from "./textResponse";

export class ErrorResponse extends TextResponse {
    constructor(message: string, code: ResponseCode) {
        super(message, code);
    }
}