import {Store} from "../src/main"

let idata: any
let count = 0
async function post(data: any) {
  idata = data
}
async function get(arg?: any) {
  count += 1
  const data = await new Promise(r => {
    setTimeout(() => r(idata), 200)
  })
  return data
}

const service = {
  post,
  get,
}

test("Test registerObj", () => {
  const cache = new Store()
  const newService = cache.registerObj(service, [
    {
      name: 'get',
      expire: 1000,
    }
  ])
  count = 0
  const res1 = newService.get(1)
  const res2 = newService.get(1)
  expect(count).toBe(1)
})

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

test("Test registerObj with dependencies", async () => {
  const cache = new Store()
  const newService = cache.registerObj(service, [
    {
      name: 'get',
      expire: 1000,
      // dependencies: [{
      //   store: cache,
      //   name: 'post'
      // }],
      dependencies: ['post']
    }
  ])
  await newService.post(1)
  let res1 = await newService.get()
  await newService.post(2)
  await new Promise(r => setTimeout(r, 300))
  let res2 = await newService.get()
  expect([res1, res2]).toEqual([1, 2])
})

test("With dependencies", async () => {
  const cache = new Store()
  cache.register('post', post)
  cache.register('get', get)
  cache.registerConfig('get', {
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