/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

var Store = /** @class */ (function () {
    function Store() {
        this.store = new Map();
    }
    Store.prototype.register = function (name, fn, params) {
        if (params === void 0) { params = {}; }
        var _a = params.expire, expire = _a === void 0 ? 0 : _a, _b = params.dependencies, dependencies = _b === void 0 ? [] : _b;
        var config = {
            fn: fn,
            expire: expire,
            triggers: new Set(),
            cache: new Map()
        };
        this.store.set(name, config);
        this.setDependencies(name, new Set(dependencies));
    };
    Store.prototype.call = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _a, fn, triggers, data;
            var _this = this;
            return __generator(this, function (_b) {
                _a = this.store.get(name), fn = _a.fn, triggers = _a.triggers;
                data = this.getCache(name, args);
                if (data) {
                    return [2 /*return*/, data];
                }
                data = fn.call.apply(fn, __spreadArrays([null], args));
                this.setCache(name, args, data);
                triggers.forEach(function (name) {
                    _this.resetCacheItem(name);
                });
                return [2 /*return*/, data];
            });
        });
    };
    Store.prototype.callFn = function (name) {
        var _this = this;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return _this.call.apply(_this, __spreadArrays([name], args));
        };
    };
    Store.prototype.getCache = function (name, args) {
        var item = this.store.get(name);
        var cache = item.cache.get(JSON.stringify(args));
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
    };
    Store.prototype.setCache = function (name, args, data) {
        var item = this.store.get(name);
        if (item.expire <= 0) {
            return;
        }
        item.cache.set(JSON.stringify(args), {
            expireTime: item.expire + new Date().getTime(),
            data: data,
        });
    };
    Store.prototype.setDependencies = function (name, dependencies) {
        var _this = this;
        dependencies.forEach(function (dependency) {
            if (!_this.store.get(dependency)) {
                throw new Error(dependency + " hasn't be registed");
            }
            _this.store.get(dependency).triggers.add(name);
        });
    };
    /**
     * Reset cache item to make it fire next time
     * @param name
     */
    Store.prototype.resetCacheItem = function (name) {
        var item = this.store.get(name);
        item.cache = new Map();
    };
    return Store;
}());

export { Store };
