// frontend/src/algorithms/structures/stack.js

// Factory returning a stack with a consistent playground interface
export function createStackStructure(initialValues = []) {
  const items = Array.isArray(initialValues) ? [...initialValues] : [];

  const insert = (value) => {
    items.push(value);
    return value;
  };

  const remove = () => {
    if (!items.length) return null;
    return items.pop();
  };

  const peek = () => (items.length ? items[items.length - 1] : null);

  const clear = () => {
    items.length = 0;
  };

  const toArray = () => [...items];

  return {
    insert,
    remove,
    peek,
    clear,
    toArray,
    push: insert,
    pop: remove,
    toPayload: () => ({ values: [...items] }),
    loadFromPayload: (payload) => {
      items.length = 0;
      if (!payload || !Array.isArray(payload.values)) return false;
      payload.values.forEach((v) => items.push(v));
      return true;
    },
  };
}
