import { CoreErrorCode } from "../enums";

interface Data<T> {
    readonly code: number;
    readonly data?: T;
}

export class CoreError<T> extends Error {
    constructor(
        public readonly code: number,
        public readonly data?: T
    ) {
        super(JSON.stringify({ code, data }));
    }

    public static parseFromError<T>(error: Error): Data<T> {
        if (error instanceof CoreError) return {
            code: error.code,
            data: error.data
        };

        try {
            const data = JSON.parse(error.message);

            return {
                code: data.code || CoreErrorCode.Unknown,
                data: data.data
            };
        } catch (e) {
            return {
                code: CoreErrorCode.Unknown
            };
        }
    }
}