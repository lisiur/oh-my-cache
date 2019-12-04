interface Config {
  fn: Function
  expire: number
  triggers: Set<string>
  cache: Map<
    string,
    {
      expireTime: number
      data: any
    }
  >
}

interface RegisterParams {
  expire?: number
  dependencies?: string[]
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
      cache: new Map()
    } as Config
    this.store.set(name, config)
    this.setDependencies(name, new Set(dependencies))
  }

  async call(name: string, ...args: any[]) {
    const {fn, triggers} = this.store.get(name)
    let data = this.getCache(name, args)
    if (data) {
      return data
    }
    data = fn.call(null, ...args)
    this.setCache(name, args, data)

    triggers.forEach(name => {
      this.resetCacheItem(name)
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

  private setDependencies(name: string, dependencies: Set<string>) {
    dependencies.forEach(dependency => {
      if (!this.store.get(dependency)) {
        throw new Error(`${dependency} hasn't be registed`)
      }
      this.store.get(dependency).triggers.add(name)
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
