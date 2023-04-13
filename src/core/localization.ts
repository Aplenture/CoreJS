import { Event } from "./event";

export abstract class Localization {
    public static readonly onMissingTranslation = new Event<Localization, string>('Localization.onMissingTranslation');

    private static dictionary: NodeJS.Dict<string> = {};

    public static load(data: NodeJS.ReadOnlyDict<string> = {}) {
        this.dictionary = Object.assign(this.dictionary, data);
    }

    public static translate(key = '', values?: NodeJS.ReadOnlyDict<string>): string {
        if (0 != key.indexOf('#_'))
            return key;

        if (!key)
            return '';

        let result = this.dictionary[key];

        if (!result) {
            this.onMissingTranslation.emit(this, key);
            this.dictionary[key] = key;
            result = key;
        }

        if (values) Object
            .keys(values)
            .forEach(key => result = result.replace(key, values[key]));

        return result;
    }
}