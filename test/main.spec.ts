import {Store} from "../src/main"

let idata: any
let count = 0
async function post(data: any) {
  idata = data
}
async function get() {
  count += 1
  const data = await new Promise(r => {
    setTimeout(() => r(idata), 200)
  })
  return data
}

test("Test", () => {
  const cache = new Store()
  cache.register('get', get, {
    expire: 1000,
  })
  count = 0
  const res1 = cache.call('get', 1)
  const res2 = cache.call('get', 1)
  expect(count).toBe(1)
})

test("Without dependencies", async () => {
  const cache = new Store()
  cache.register('post', post)
  cache.register('get', get, {
    expire: 1000,
  })
  await cache.call('post', 1)
  let res1 = await cache.call('get', 1)
  let res2 = await cache.call('get', 2)
  expect([res1, res2]).toEqual([1, 1])
})

test("With dependencies", async () => {
  const cache = new Store()
  cache.register('post', post)
  cache.register('get', get, {
    expire: 1000,
    dependencies: ['post'],
  })
  await cache.call('post', 1)
  let res1 = await cache.call('get')
  await cache.call('post', 2)
  await new Promise(r => setTimeout(r, 300))
  let res2 = await cache.call('get')
  expect([res1, res2]).toEqual([1, 2])
})