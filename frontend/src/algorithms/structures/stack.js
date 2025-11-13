// frontend/src/algorithms/structures/stack.js

// Pure stack data structure – no DOM, no SVG
export class Stack {
  constructor() {
    this._items = [];
  }

  push(value) {
    this._items.push(value);
  }

  pop() {
    // return null instead of undefined when empty
    return this._items.length ? this._items.pop() : null;
  }

  clear() {
    this._items = [];
  }

  toArray() {
    // Return a copy so callers can't mutate internal state accidentally
    return [...this._items];
  }

  get size() {
    return this._items.length;
  }

  get isEmpty() {
    return this._items.length === 0;
  }
}
