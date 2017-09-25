
class List {
  constructor (head, tail) {
    this.head = head
    this.tail = tail
  }

  get isEmpty () {
    return (!this.head && !this.tail) || (typeof this.head === 'undefined')
  }

  prepend (head) {
    return new List(head, this)
  }
}

class Heap {
  constructor (item, children) {
    if (item || typeof item !== 'undefined') {
      this.item = item
      this.children = children || new List()
    }
  }

  get isEmpty () {
    return !('item' in this)
  }

  merge (heap, comparitor) {
    if (this.isEmpty) {
      return heap
    }
    /* istanbul ignore next because the containing object never merges an empty */
    if (heap.isEmpty) {
      return this
    }

    if (comparitor(this.item, heap.item) <= 0) {
      return new Heap(this.item, this.children.prepend(heap))
    } else {
      return new Heap(heap.item, heap.children.prepend(this))
    }
  }

  getMin () {
    return this.item
  }

  pop (comparitor) {
    return mergePairs(this.children, comparitor)
  }
}

const EmptyHeap = new Heap()

// mergePairs returns a promise to the heap resulting from
// doing mergePairs on the list. The merged result is gathered
// recursively, but each recursive step goes through setImmediate
// to keep the overall process from smashing the stack or stealing
// large amounts of time from the event loop.
function mergePairs (list, comparitor) {
  return new Promise((resolve, reject) => setImmediate(() => {
    let a = EmptyHeap

    let l = list
    if (!l.isEmpty) {
      a = l.head
      l = l.tail
      if (!l.isEmpty) {
        a = a.merge(l.head, comparitor)
        l = l.tail
      }
    }

    if (l.isEmpty) {
      resolve(a)
    } else {
      resolve(mergePairs(l, comparitor).then(b => a.merge(b, comparitor)))
    }
  }))
}

class PairingHeap {
  constructor (comparitor) {
    this.comparitor = comparitor || ((a, b) => (a > b) - (b > a))
    this.size = 0
    this.heap = EmptyHeap
    this.busy = false
    this.notifier = null
  }

  get length () {
    return this.size
  }

  get isEmpty () {
    return this.size === 0
  }

  waitForNotBusy () {
    if (this.busy) {
      if (!this.notifier) {
        this.notifier = new Promise((resolve, reject) => {
          const checkBusy = () => {
            if (this.busy) {
              setImmediate(checkBusy)
            } else {
              this.notifier = null
              resolve()
            }
          }

          checkBusy()
        })
      }
      return this.notifier
    } else {
      return Promise.resolve(this)
    }
  }

  insert (item) {
    if (typeof item === 'undefined') {
      throw Error('empty insert')
    }

    const insertItem = (item) => {
      this.size += 1
      this.heap = this.heap.merge(new Heap(item), this.comparitor)
      return this
    }

    if (this.busy) {
      return this.waitForNotBusy().then(() => insertItem(item))
    } else {
      return Promise.resolve(insertItem(item))
    }
  }

  peek () {
    return this.waitForNotBusy().then(() => {
      if (this.isEmpty) {
        throw Error('heap empty')
      }

      return this.heap.getMin()
    })
  }

  pop () {
    const popFunc = async () => {
      if (this.isEmpty) {
        throw Error('heap empty')
      }
      this.busy = true
      const result = this.heap.getMin()
      this.heap = await this.heap.pop(this.comparitor)
      this.size -= 1
      this.busy = false
      return result      
    }

    if (!this.busy) {
      return popFunc()
    } else {
      return this.waitForNotBusy().then(popFunc)
    }
  }
}

module.exports = PairingHeap
