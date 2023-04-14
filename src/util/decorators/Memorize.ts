export default function Memorize() {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = memoizeAsync(originalMethod);
        return descriptor;
    }
}

function memoizeAsync(fn: (...args: any[]) => Promise<any>): (...args: any[]) => Promise<any> {
    const cache = new WeakMap();
    return async function (...args) {
        const key = JSON.stringify(args);
        let instanceCache = cache.get(this);
        if (!instanceCache) {
            instanceCache = new Map();
            cache.set(this, instanceCache);
        }
        if (instanceCache.has(key)) {
            return instanceCache.get(key);
        }
        const result = await fn.apply(this, args);
        instanceCache.set(key, result);
        return result;
    };
}
export function ResetCache() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        const cache = new Map();
        descriptor.value = async function (...args) {
            const result = await originalMethod.apply(this, args);
            cache.clear();
            return result;
        };
        return descriptor;
    };
}

export function UpdateCacheOnUpdate() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const result = await originalMethod.apply(this, args);
            // Update the cache for the fetchOne method
            await this.fetchOne.updateCache(args[0]);
            return result;
        };
        return descriptor;
    };
}
export function UpdateCache() {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        const cache = new Map();
        descriptor.value = async function (...args) {
            const cacheKey = `${propertyKey}_${JSON.stringify(args)}`;
            if (cache.has(cacheKey)) {
                return cache.get(cacheKey);
            }
            const result = await originalMethod.apply(this, args);
            cache.set(cacheKey, result);
            return result;
        };
        descriptor.value.updateCache = async function (...args) {
            const cacheKey = `${propertyKey}_${JSON.stringify(args)}`;
            const result = await originalMethod.apply(this, args);
            cache.set(cacheKey, result);
            return result;
        };
        return descriptor;
    };
}
