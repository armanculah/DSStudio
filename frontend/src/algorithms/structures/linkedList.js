// frontend/src/algorithms/structures/linkedList.js

class LinkedListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

// Singly linked list, pure data structure (no DOM)
class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this._length = 0;
  }

  // Insert at tail
  append(value) {
    const node = new LinkedListNode(value);

    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }

    this._length += 1;
  }

  // Insert at head
  prepend(value) {
    const node = new LinkedListNode(value);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head = node;
    }
    this._length += 1;
  }

  insertAt(index, value) {
    if (!Number.isInteger(index) || index < 0 || index > this._length) {
      return { error: "Invalid index." };
    }
    if (index === 0) {
      this.prepend(value);
      return { index: 0 };
    }
    if (index === this._length) {
      this.append(value);
      return { index };
    }
    let prev = this.head;
    for (let i = 0; i < index - 1; i += 1) {
      prev = prev.next;
    }
    const node = new LinkedListNode(value);
    node.next = prev.next;
    prev.next = node;
    this._length += 1;
    return { index };
  }

  // Remove from head, return removed value (or null if empty)
  removeHead() {
    if (!this.head) return null;

    const value = this.head.value;
    this.head = this.head.next;

    if (!this.head) {
      this.tail = null;
    }

    this._length -= 1;
    return value;
  }

  removeAt(index) {
    if (!this.head) return { error: "List is empty." };
    if (!Number.isInteger(index) || index < 0 || index >= this._length) {
      return { error: "Invalid index." };
    }
    if (index === 0) {
      return { removed: this.removeHead(), index: 0 };
    }
    let prev = this.head;
    for (let i = 0; i < index - 1; i += 1) {
      prev = prev.next;
    }
    const target = prev.next;
    prev.next = target?.next || null;
    if (target === this.tail) {
      this.tail = prev;
    }
    this._length -= 1;
    return { removed: target.value, index };
  }

  deleteByValue(value) {
    const visited = [];
    if (!this.head) return { deleted: false, visited, error: "List is empty." };
    if (this.head.value === value) {
      visited.push(0);
      const removed = this.removeHead();
      return { deleted: true, removed, visited };
    }
    let prev = this.head;
    let curr = this.head.next;
    let index = 1;
    visited.push(0);
    while (curr) {
      visited.push(index);
      if (curr.value === value) {
        prev.next = curr.next;
        if (curr === this.tail) this.tail = prev;
        this._length -= 1;
        return { deleted: true, removed: curr.value, visited };
      }
      prev = curr;
      curr = curr.next;
      index += 1;
    }
    return { deleted: false, visited, error: "Value not found." };
  }

  search(value) {
    const visited = [];
    let curr = this.head;
    let index = 0;
    while (curr) {
      visited.push(index);
      if (curr.value === value) {
        return { found: true, index, visited };
      }
      curr = curr.next;
      index += 1;
    }
    return { found: false, index: -1, visited };
  }

  clear() {
    this.head = null;
    this.tail = null;
    this._length = 0;
  }

  // For visualization – just the values in order
  toArray() {
    const result = [];
    let curr = this.head;
    while (curr) {
      result.push(curr.value);
      curr = curr.next;
    }
    return result;
  }

  get size() {
    return this._length;
  }

  get isEmpty() {
    return this._length === 0;
  }
}

export function createLinkedListStructure(initialValues = []) {
  const list = new LinkedList();
  if (Array.isArray(initialValues)) {
    initialValues.forEach((value) => list.append(value));
  }

  return {
    insert(value) {
      list.append(value);
      return value;
    },
    remove() {
      return list.removeHead();
    },
    append(value) {
      list.append(value);
      return value;
    },
    prepend(value) {
      list.prepend(value);
      return value;
    },
    insertAt(index, value) {
      return list.insertAt(index, value);
    },
    deleteAt(index) {
      return list.removeAt(index);
    },
    deleteByValue(value) {
      return list.deleteByValue(value);
    },
    search(value) {
      return list.search(value);
    },
    clear() {
      list.clear();
    },
    toArray() {
      return list.toArray();
    },
    toPayload() {
      return { values: list.toArray() };
    },
    loadFromPayload(payload) {
      list.clear();
      if (!payload || !Array.isArray(payload.values)) return false;
      payload.values.forEach((v) => list.append(v));
      return true;
    },
  };
}
