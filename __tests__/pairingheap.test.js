const PairingHeap = require('../index')
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000

it('acts as a heap with a default comparitor', async () => {
  const p = new PairingHeap()

  expect(p.isEmpty).toBeTruthy()

  p.insert('a')
  expect(p.length).toBe(1)

  p.insert('b')
  expect(p.length).toBe(2)

  expect(await p.peek()).toBe('a')
  expect(await p.peek()).toBe('a')
  expect(await p.pop()).toBe('a')
  expect(p.length).toBe(1)
  expect(await p.peek()).toBe('b')
  expect(await p.pop()).toBe('b')
  expect(p.length).toBe(0)
  expect(p.isEmpty).toBeTruthy()
})

it('acts as a heap with a custom comparitor', async () => {
  const p = new PairingHeap((a, b) => (a.pri > b.pri) - (b.pri > a.pri))

  expect(p.isEmpty).toBeTruthy()

  p.insert({pri: 1, content: 'a'})
  expect(p.length).toBe(1)

  p.insert({pri: 2, content: 'b'})
  expect(p.length).toBe(2)

  expect(await p.peek()).toEqual({pri: 1, content: 'a'})
  expect(await p.pop()).toEqual({pri: 1, content: 'a'})
  expect(p.length).toBe(1)
  expect(await p.peek()).toEqual({pri: 2, content: 'b'})
  expect(await p.pop()).toEqual({pri: 2, content: 'b'})
  expect(p.length).toBe(0)
  expect(p.isEmpty).toBeTruthy()
})

it('throws an error if you try to pop from an empty heap', () => {
  const p = new PairingHeap()

  return Promise.all([
    p.pop().catch(x => expect(x).toEqual(Error('heap empty'))),
    p.peek().catch(x => expect(x).toEqual(Error('heap empty')))
  ])
})

it('throws an error if you try to insert an empty element', () => {
  const p = new PairingHeap()

  expect(() => p.insert()).toThrow(Error('empty insert'))
})

const size = 10000
it('sorts when inserts are in order', async () => {
  const p = new PairingHeap()

  for (let i = 0; i < size - 1; i += 1) {
    p.insert(i)
  }
  await p.insert(size - 1)

  expect(p.length).toBe(size)

  for (let i = 0; i < size; i += 1) {
    expect(await p.pop()).toBe(i)
  }
})

it('sorts when inserts are reversed', async () => {
  const p = new PairingHeap()

  for (let i = 0; i < size; i += 1) {
    p.insert(size - 1 - i)
  }

  expect(p.length).toBe(size)

  for (let i = 0; i < size; i += 1) {
    expect(await p.pop()).toBe(i)
  }
})

it('behaves reasonably with a million inserts', () => {
  const p = new PairingHeap()

  for (let i = 0; i < 1000000; i += 1) {
    p.insert(i)
  }

  expect(p.length).toBe(1000000)

  p.pop().then(x => {
    expect(x).toBe(0)
  })
  p.insert(-1)
  p.insert(2000000)
  expect(p.busy).toBeTruthy()
  const r2 = p.pop().then(y => {
    expect(y).toBe(-1)
    p.pop().then(z => {
      expect(z).toBe(1)
    })
  })
  return r2
})
