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
    clear() {
      list.clear();
    },
    toArray() {
      return list.toArray();
    },
  };
}
