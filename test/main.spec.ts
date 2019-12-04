import {Store} from "../src/main"

let idata: any
async function post(data: any) {
  idata = data
}
async function get() {
  return idata
}

test("Without dependencies", () => {
  const cache = new Store()
  cache.register('post', post)
  cache.register('get', get, {
    expire: 1000,
  })
  ;(async function() {
    await cache.call('post', 1)
    let res1 = await cache.call('get', 1)
    await cache.call('post', 2)
    await new Promise(r => setTimeout(r, 300))
    let res2 = await cache.call('get', 2)
    expect([res1, res2]).toEqual([1, 2])
  })()
})

test("With dependencies", () => {
  const cache = new Store()
  cache.register('post', post)
  cache.register('get', get, {
    expire: 1000,
    dependencies: ['post'],
  })
  ;(async function() {
    await cache.call('post', 1)
    let res1 = await cache.call('get')
    await cache.call('post', 2)
    await new Promise(r => setTimeout(r, 300))
    let res2 = await cache.call('get')
    expect([res1, res2]).toEqual([1, 2])
  })()
})