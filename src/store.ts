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
    configs: RegisterParams<K>[] = []
  ): T {
    const res = {}
    Object.entries(obj).forEach(([name, fn]) => {
      this.register(name, fn.bind(obj))
      res[name] = this.callFn(name)
    })
    configs.forEach((config, i) => {
      const { name, ...cfg } = config
      if (!name) {
        throw new Error(`config[${i}] doesn't has name`)
      }
      this.registerConfig(name as string, cfg)
    })
    return res as T
  }

  async call(name: string, ...args: any[]) {
    const { fn, triggers } = this.store.get(name)
    let data = this.getCache(name, args)
    if (data) {
      return data
    }
    data = fn.call(null, ...args)
    this.setCache(name, args, data)

    triggers.forEach(trigger => {
      if (typeof trigger === 'string') {
        this.resetCacheItem(trigger)
      } else {
        trigger.store.resetCacheItem(trigger.name)
      }
    })
    return data
  }

  callFn(name: string) {
    return (...args: any[]) => this.call(name, ...args)
  }

  private getCache(name: string, args: any[]) {
    const item = this.store.get(name)
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
    const item = this.store.get(name)
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
        const store = this.store
        if (!store.get(dependency)) {
          throw new Error(`${dependency} hasn't be registed`)
        }
        store.get(dependency).triggers.add(name)
      } else {
        const store = dependency.store.store
        if (!store.get(dependency.name)) {
          throw new Error(`${dependency} hasn't be registed`)
        }
        store.get(dependency.name).triggers.add({ name, store: this })
      }
    })
  }

  /**
   * Reset cache item to make it fire next time
   * @param name
   */
  private resetCacheItem(name: string) {
    const item = this.store.get(name)
    item.cache = new Map()
  }
}

export default Store
