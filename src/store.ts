interface Config {
  fn: Function
  expire: number
  expireTime: number
  dependencies: Set<string>
  triggers: Set<string>
  cached: Boolean
  data: any
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
      expireTime: +new Date(),
      dependencies: new Set(dependencies),
      triggers: new Set() as Set<string>,
      cached: false,
      data: null,
    }
    this.store.set(name, config)
    this.setDependencies(name, config.dependencies)
  }

  async call(name: string, ...args: any[]) {
    const item = this.store.get(name)
    if (item.cached) {
      if (+new Date() < item.expireTime) {
        return item.data
      }
    }
    item.data = await item.fn.call(null, ...args)
    item.expireTime = item.expire + new Date().getTime()
    item.cached = true
    item.triggers.forEach(name => {
      this.resetCacheItem(name)
    })
    return item.data
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
    item.cached = false
    item.data = null
  }
}

export default Store
