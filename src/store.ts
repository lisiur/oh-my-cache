interface Config {
  fn: Function
  expire: number
  triggers: Set<string | { name: string; store: Store }>
  cache: Map<
    string,
    {
      expireTime: number
      data: any
    }
  >
}

interface RegisterParams<T = any> {
  name?: T
  expire?: number
  dependencies?: Array<T | { name: string; store: Store }>
}

class Store {
  private store: Map<string, Config>

  constructor() {
    this.store = new Map()
  }

  register(name: string, fn: Function, params: RegisterParams = {}) {
    const { expire = 0, dependencies = [] } = params
    const config = {
      fn,
      expire,
      triggers: new Set() as Set<string>,
      cache: new Map(),
    } as Config
    this.store.set(name, config)
    this.setDependencies(name, new Set(dependencies))
  }

  registerConfig(name: string, params: RegisterParams = {}) {
    const { expire = 0, dependencies = [] } = params
    const config = this.store.get(name)
    if (!config) {
      throw new Error(`${name} hasn't be registed`)
    }
    this.store.set(name, {
      ...config,
      expire,
      triggers: new Set() as Set<string>,
      cache: new Map(),
    })
    this.setDependencies(name, new Set(dependencies))
  }

  registerObj<T extends Record<string, Function>, K extends keyof T>(
    obj: T,
    params: RegisterParams<K>[] = [],
    config = {
      bind: false
    }
  ): T {
    const res = {} as Record<string, Function>
    Object.entries(obj).forEach(([name, fn]) => {
      if (config.bind) {
        this.register(name, fn.bind(obj))
      } else {
        this.register(name, fn.bind(res))
      }
      res[name] = this.callFn(name)
    })
    params.forEach((param, i) => {
      const { name, ...cfg } = param
      if (!name) {
        throw new Error(`config[${i}] doesn't has name`)
      }
      this.registerConfig(name as string, cfg)
    })
    return res as T
  }

  async call(name: string, ...args: any[]) {
    const { fn, triggers } = this.getConfig(name)
    let data = this.getCache(name, args)
    if (data) {
      return data
    }
    const res = fn.call(null, ...args)

    this.setCache(name, args, res)

    return Promise.resolve(res)
      .then(data => {
        this.setCache(name, args, data)

        triggers.forEach(trigger => {
          if (typeof trigger === 'string') {
            this.resetCacheItem(trigger)
          } else {
            trigger.store.resetCacheItem(trigger.name)
          }
        })
        return data
      })
      .catch(err => {
        this.resetCacheItem(name)
        throw err
      })
  }

  callFn(name: string) {
    return (...args: any[]) => this.call(name, ...args)
  }

  private getConfig(name: string) {
    const config = this.store.get(name)
    if (!config) {
      throw new Error(`${name} hasn't be registered`)
    }
    return config
  }

  private getCache(name: string, args: any[]) {
    const item = this.getConfig(name)
    const cache = item.cache.get(JSON.stringify(args))
    if (!cache) {
      return null
    }
    if (item.expire <= 0) {
      return null
    }
    if (+new Date() > cache.expireTime) {
      return null
    }
    return cache.data
  }

  private setCache(name: string, args: any[], data: any) {
    const item = this.getConfig(name)
    if (item.expire <= 0) {
      return
    }
    item.cache.set(JSON.stringify(args), {
      expireTime: item.expire + new Date().getTime(),
      data,
    })
  }

  private setDependencies(
    name: string,
    dependencies: Set<string | { name: string; store: Store }>
  ) {
    dependencies.forEach(dependency => {
      if (typeof dependency === 'string') {
        this.getConfig(dependency).triggers.add(name)
      } else {
        const store = dependency.store
        store.getConfig(dependency.name).triggers.add({ name, store: this })
      }
    })
  }

  /**
   * Reset cache item to make it fire next time
   * @param name
   */
  private resetCacheItem(name: string) {
    this.getConfig(name).cache.clear()
  }
}

export default Store
