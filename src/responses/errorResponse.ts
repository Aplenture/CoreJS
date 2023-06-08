import { ResponseCode } from "../enums";
import { TextResponse } from "./textResponse";

export class ErrorResponse extends TextResponse {
    constructor(code: ResponseCode, message = '') {
        super(message, code);
    }
}