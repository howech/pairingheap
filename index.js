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

function mergePairs (list, comparitor) {
  let result = EmptyHeap

  let l = list
  while (!l.isEmpty) {
    let a = l.head
    l = l.tail
    if (!l.isEmpty) {
      const b = l.head
      l = l.tail
      a = a.merge(b, comparitor)
    }
    result = result.merge(a, comparitor)
  }

  return result
}

class PairingHeap {
  constructor (comparitor) {
    this.comparitor = comparitor || ((a, b) => (a > b) - (b > a))
    this.size = 0
    this.heap = EmptyHeap
  }

  get length () {
    return this.size
  }

  get isEmpty () {
    return this.size === 0
  }

  insert (item) {
    if (typeof item === 'undefined') {
      throw Error('empty insert')
    }

    this.size += 1
    this.heap = this.heap.merge(new Heap(item), this.comparitor)
  }

  peek () {
    if (this.isEmpty) {
      throw Error('heap empty')
    }

    return this.heap.getMin()
  }

  pop () {
    if (this.isEmpty) {
      throw Error('heap empty')
    }

    const result = this.heap.getMin()
    this.heap = this.heap.pop(this.comparitor)
    this.size -= 1
    return result
  }
}

module.exports = PairingHeap
