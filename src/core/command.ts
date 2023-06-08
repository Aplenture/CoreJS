import { Parameter } from "./parameter";

export type CommandAction<T> = (args) => Promise<T | void>;

export interface Command<T> {
    readonly name: string;
    readonly action: CommandAction<T>;
    readonly description?: string;
    readonly parameters?: readonly Parameter<any>[];
}