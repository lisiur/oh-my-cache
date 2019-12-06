interface RegisterParams<T = any> {
    name?: T;
    expire?: number;
    dependencies?: Array<T | {
        name: string;
        store: Store;
    }>;
}
declare class Store {
    private store;
    constructor();
    register(name: string, fn: Function, params?: RegisterParams): void;
    registerConfig(name: string, params?: RegisterParams): void;
    registerObj<T extends Record<string, Function>, K extends keyof T>(obj: T, configs?: RegisterParams<K>[]): T;
    call(name: string, ...args: any[]): Promise<any>;
    callFn(name: string): (...args: any[]) => Promise<any>;
    private getConfig;
    private getCache;
    private setCache;
    private setDependencies;
    /**
     * Reset cache item to make it fire next time
     * @param name
     */
    private resetCacheItem;
}
export default Store;
//# sourceMappingURL=store.d.ts.map