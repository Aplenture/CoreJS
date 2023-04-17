import { ResponseCode, ResponseType } from "../enums";
import { Response } from "../core/response";

export class TextResponse extends Response {
    constructor(text: string, code = ResponseCode.OK) {
        super(text, ResponseType.Text, code);
    }
}