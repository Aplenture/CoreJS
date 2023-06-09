import { Parameter } from "./parameter";

export type CommandAction = (args) => Promise<any>;

export interface Command {
    readonly name: string;
    readonly action: CommandAction;
    readonly description?: string;
    readonly parameters?: readonly Parameter<any>[];
}