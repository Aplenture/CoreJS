const cwd: string = (function () {
    try {
        return eval('process.cwd()');
    } catch (error) {
        return null;
    }
})();

const _require: (path: string) => any = (function () {
    try {
        return eval('require');
    } catch (error) {
        return null;
    }
})();

export interface LoadModuleConfig {
    readonly class: string;
    readonly path: string;
}

export const loadModule = (function () {
    if (!_require)
        return function () { throw new Error('method not supported'); }

    return function <T>(config: LoadModuleConfig, ...args: any[]): T {
        const path = `${cwd}/${config.path}.js`;

        let constructor: new (...args: any[]) => T;

        try {
            constructor = _require(path)[config.class];
        } catch (error) {
            throw new Error(`module '${config.class}' not found at '${path}'`);
        }

        return new constructor(...args);
    }
})();

export const loadConfig = (function () {
    if (!_require)
        return function () { throw new Error('method not supported'); }

    return function loadConfig<T>(name = 'config.json'): T {
        const path = `${cwd}/${name}`;

        try {
            return _require(path);
        } catch (error) {
            throw new Error(`Cannot find config '${path}'`);
        }
    }
})();