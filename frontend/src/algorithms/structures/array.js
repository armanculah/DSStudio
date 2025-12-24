// frontend/src/algorithms/structures/array.js

export function createArrayStructure(initialValues = []) {
  const values = Array.isArray(initialValues) ? [...initialValues] : [];

  const validateIndex = (index, allowEnd = true) => {
    if (!Number.isInteger(index)) return false;
    if (index < 0) return false;
    const max = allowEnd ? values.length : values.length - 1;
    return index <= max;
  };

  const insert = (value, index) => {
    if (index === undefined || index === null || index === "") {
      values.push(value);
      return { index: values.length - 1 };
    }
    const idx = Number(index);
    if (!Number.isInteger(idx) || !validateIndex(idx, true)) {
      return { error: "Invalid index." };
    }
    values.splice(idx, 0, value);
    return { index: idx };
  };

  const deleteAt = (index) => {
    const idx = Number(index);
    if (!values.length) return { error: "Array is empty." };
    if (!Number.isInteger(idx) || !validateIndex(idx, false)) {
      return { error: "Invalid index." };
    }
    const [removed] = values.splice(idx, 1);
    return { removed, index: idx };
  };

  const search = (value) => {
    const visited = [];
    let foundIndex = -1;
    for (let i = 0; i < values.length; i += 1) {
      visited.push(i);
      if (values[i] === value) {
        foundIndex = i;
        break;
      }
    }
    return { foundIndex, visited };
  };

  const clear = () => {
    values.length = 0;
  };

  const toArray = () => [...values];

  return {
    insert,
    deleteAt,
    search,
    clear,
    toArray,
  };
}

