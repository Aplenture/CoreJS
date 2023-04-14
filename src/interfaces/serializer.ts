export interface Serializer<T> {
    readonly name: string;
    readonly description: string;
    readonly optional: boolean;

    serialize(data: T): string;
    deserialie(data: string): T;
}