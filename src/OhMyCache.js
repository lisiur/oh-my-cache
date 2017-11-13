const R = require('ramda')

const gOpt = require('./config/global-options')

const OhMyCache = function(options) {
    this.cache = {}
    this.options = options || R.clone(gOpt)
    this.clientList = {}
}

OhMyCache.prototype.has = function(key) {
    return key in this.cache
}

OhMyCache.prototype.set = function(key, value, options) {
    if (this.has(key)) { // update
        this.cache[key] = {
            value,
            options: options || this.cache.options
        }
    } else {
        this.cache[key] = {
            value,
            options: options || R.clone(this.options)
        }
    }
}

OhMyCache.prototype.get = function(key) {
    if (this.has(key)) {
        return this.cache[key].value
    } else {
        return
    }
}

OhMyCache.prototype.listen = function(key, fn) {
    if (!this.clientList[key]) {
        this.clientList[key] = []
    }
    this.clientList[key].push(fn)
}

OhMyCache.prototype.trigger = function(key, ...fnArgs) {
    const fns = this.clientList[key]
    if(!fns || fns.length <= 0) {
        console.warn('[warn] no client ' + key)
        return false
    }
    for (let i = 0, fn; fn = fns[i++];) {
        fn.apply(this, fnArgs)
    }
}

OhMyCache.prototype.remove = function(key, fn) {
    const fns = this.clientList[key]
    if (!fns) {
        return false
    }
    if (!fn) {
        fns.length = 0
    } else {
        for (let i = fns.length - 1; i >= 0; i--) {
            let _fn = fns[i]
            if (_fn === fn) {
                fns.splice(i, 1)
            }
        }
    }
}

OhMyCache.prototype.clear = function() {
    this.cache = {}
}

module.exports = OhMyCache


// let cache = new OhMyCache()
// cache.listen('change-cache', function(key) {
//     console.log(cache.get(key))
// })
// cache.listen('change-cache', function(key) {
//     console.log(cache.get(key))
// })
// cache.set('item', 'hah')
// cache.remove('change-cache')
// cache.trigger('change-cache', 'item')