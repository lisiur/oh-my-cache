class OhMyCache {
    constructor() {
        this.cache = {}
    }

    hasItem(key) {
        return Object.keys(this.cache).includes(key)
    }

    getItem(key) {
        return this.cache[key]
    }

    setItem(key, value) {
        this.cache[key] = value
        return this
    }

    removeItem(key) {
        this.cache[key] = undefined
        return this
    }

    keys() {
        return Object.keys(this.cache)
    }

    values() {
        return Object.values(this.cache)
    }

    entries() {
        return Object.entries(this.cache)
    }

    clear() {
        this.cache = {}
        return this
    }
}

export default OhMyCache