(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.ohmycache = {}));
}(this, (function (exports) { 'use strict';

  class Store {
      constructor() {
          this.store = new Map();
      }
      register(name, fn, params = {}) {
          const { expire = 0, dependencies = [] } = params;
          const config = {
              fn,
              expire,
              triggers: new Set(),
              cache: new Map(),
          };
          this.store.set(name, config);
          this.setDependencies(name, new Set(dependencies));
      }
      registerConfig(name, params = {}) {
          const { expire = 0, dependencies = [] } = params;
          const config = this.store.get(name);
          if (!config) {
              throw new Error(`${name} hasn't be registed`);
          }
          this.store.set(name, {
              ...config,
              expire,
              triggers: new Set(),
              cache: new Map(),
          });
          this.setDependencies(name, new Set(dependencies));
      }
      registerObj(obj, params = [], config = {
          bind: false
      }) {
          const res = {};
          Object.entries(obj).forEach(([name, fn]) => {
              if (config.bind) {
                  this.register(name, fn.bind(obj));
              }
              else {
                  this.register(name, fn.bind(res));
              }
              res[name] = this.callFn(name);
          });
          params.forEach((param, i) => {
              const { name, ...cfg } = param;
              if (!name) {
                  throw new Error(`config[${i}] doesn't has name`);
              }
              this.registerConfig(name, cfg);
          });
          return res;
      }
      async call(name, ...args) {
          const { fn, triggers } = this.getConfig(name);
          let data = this.getCache(name, args);
          if (data) {
              return data;
          }
          const res = fn.call(null, ...args);
          this.setCache(name, args, res);
          return Promise.resolve(res)
              .then(data => {
              this.setCache(name, args, data);
              triggers.forEach(trigger => {
                  if (typeof trigger === 'string') {
                      this.resetCacheItem(trigger);
                  }
                  else {
                      trigger.store.resetCacheItem(trigger.name);
                  }
              });
              return data;
          })
              .catch(err => {
              this.resetCacheItem(name);
              throw err;
          });
      }
      callFn(name) {
          return (...args) => this.call(name, ...args);
      }
      getConfig(name) {
          const config = this.store.get(name);
          if (!config) {
              throw new Error(`${name} hasn't be registered`);
          }
          return config;
      }
      getCache(name, args) {
          const item = this.getConfig(name);
          const cache = item.cache.get(JSON.stringify(args));
          if (!cache) {
              return null;
          }
          if (item.expire <= 0) {
              return null;
          }
          if (+new Date() > cache.expireTime) {
              return null;
          }
          return cache.data;
      }
      setCache(name, args, data) {
          const item = this.getConfig(name);
          if (item.expire <= 0) {
              return;
          }
          item.cache.set(JSON.stringify(args), {
              expireTime: item.expire + new Date().getTime(),
              data,
          });
      }
      setDependencies(name, dependencies) {
          dependencies.forEach(dependency => {
              if (typeof dependency === 'string') {
                  this.getConfig(dependency).triggers.add(name);
              }
              else {
                  const store = dependency.store;
                  store.getConfig(dependency.name).triggers.add({ name, store: this });
              }
          });
      }
      /**
       * Reset cache item to make it fire next time
       * @param name
       */
      resetCacheItem(name) {
          this.getConfig(name).cache.clear();
      }
  }

  exports.Store = Store;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
