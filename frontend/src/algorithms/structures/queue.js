// frontend/src/algorithms/structures/queue.js

export function createQueueStructure(initialValues = []) {
  const items = Array.isArray(initialValues) ? [...initialValues] : [];

  const enqueue = (value) => {
    items.push(value);
    return value;
  };

  const dequeue = () => {
    if (!items.length) return null;
    return items.shift();
  };

  const peekFront = () => (items.length ? items[0] : null);

  const peekRear = () => (items.length ? items[items.length - 1] : null);

  const clear = () => {
    items.length = 0;
  };

  const toArray = () => [...items];

  return {
    enqueue,
    dequeue,
    peekFront,
    peekRear,
    clear,
    toArray,
    insert: enqueue,
    remove: dequeue,
  };
}

