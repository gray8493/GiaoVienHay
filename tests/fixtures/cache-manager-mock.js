// Mock CacheModule + CACHE_MANAGER provider dùng cho cả unit & e2e tests.
// AppModule gọi CacheModule.register(...) nên fixture phải cung cấp đủ
// DynamicModule có provider CACHE_MANAGER (cache in-memory, không bao giờ expire
// trừ khi service chủ động gọi del — khớp với cách các service dùng cache).

const CACHE_MANAGER = 'CACHE_MANAGER';
const cacheStore = new Map();

class MockCache {
  async get(key) {
    return cacheStore.get(key);
  }

  async set(key, value) {
    cacheStore.set(key, value);
    return value;
  }

  async del(key) {
    cacheStore.delete(key);
  }

  async reset() {
    cacheStore.clear();
  }

  async wrap(key, fn) {
    const cached = cacheStore.get(key);
    if (cached !== undefined) return cached;
    const value = await fn();
    cacheStore.set(key, value);
    return value;
  }
}

const CacheModule = {
  register() {
    return {
      module: class MockCacheModule {},
      global: true,
      providers: [{ provide: CACHE_MANAGER, useValue: new MockCache() }],
      exports: [CACHE_MANAGER],
    };
  },
  registerAsync(options) {
    return CacheModule.register(options);
  },
};

module.exports = {
  CACHE_MANAGER,
  CacheModule,
};
