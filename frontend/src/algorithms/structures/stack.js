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

  const clear = () => {
    items.length = 0;
  };

  const toArray = () => [...items];

  return {
    insert,
    remove,
    clear,
    toArray,
    push: insert,
    pop: remove,
  };
}
