import { ArgumentsSerializer } from "../serializers";
import { Context } from "./context";
import { Event } from "./event";
import { Response } from "./response";

export abstract class Command<TArgs> {
    public readonly onMessage = new Event<Command<any>, string>('Command.onMessage');

    public readonly description: string;
    public readonly argumentsSerializer?: ArgumentsSerializer<TArgs>;

    constructor(
        public readonly config: Context,
        public readonly context: Context
    ) { }

    public abstract execute(args: TArgs): Promise<Response>;

    protected message(text: string) {
        this.onMessage.emit(this, text);
    }
}