import { ResponseCode, ResponseType } from "../enums";
import { Response } from "../core/response";

export class JSONResponse extends Response {
    constructor(data: any, replacer?: (this: any, key: string, value: any) => any) {
        super(JSON.stringify(data, replacer), ResponseType.JSON, ResponseCode.OK);
    }
}