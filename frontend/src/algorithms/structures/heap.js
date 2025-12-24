// frontend/src/algorithms/structures/heap.js

const parentIndex = (i) => Math.floor((i - 1) / 2);
const leftIndex = (i) => i * 2 + 1;
const rightIndex = (i) => i * 2 + 2;

const compareFactory = (mode) => {
  const isMin = mode === "min";
  return (a, b) => (isMin ? a < b : a > b);
};

export function createHeapStructure(initialValues = [], initialMode = "min") {
  let mode = initialMode === "max" ? "max" : "min";
  const values = Array.isArray(initialValues) ? [...initialValues] : [];

  const swap = (i, j) => {
    const tmp = values[i];
    values[i] = values[j];
    values[j] = tmp;
  };

  const bubbleUp = (startIndex) => {
    const swaps = [];
    const compare = compareFactory(mode);
    let i = startIndex;
    while (i > 0) {
      const p = parentIndex(i);
      if (!compare(values[i], values[p])) break;
      swap(i, p);
      swaps.push([i, p]);
      i = p;
    }
    return swaps;
  };

  const bubbleDown = (startIndex) => {
    const swaps = [];
    const compare = compareFactory(mode);
    let i = startIndex;
    while (true) {
      const l = leftIndex(i);
      const r = rightIndex(i);
      let candidate = i;
      if (l < values.length && compare(values[l], values[candidate])) candidate = l;
      if (r < values.length && compare(values[r], values[candidate])) candidate = r;
      if (candidate === i) break;
      swap(i, candidate);
      swaps.push([i, candidate]);
      i = candidate;
    }
    return swaps;
  };

  const heapify = () => {
    for (let i = Math.floor(values.length / 2) - 1; i >= 0; i -= 1) {
      bubbleDown(i);
    }
  };

  const setMode = (nextMode) => {
    const desired = nextMode === "max" ? "max" : "min";
    if (desired === mode) return;
    mode = desired;
    heapify();
  };

  const insert = (value) => {
    values.push(value);
    const swaps = bubbleUp(values.length - 1);
    return { swaps };
  };

  const peek = () => (values.length ? values[0] : null);

  const extract = () => {
    if (!values.length) return { value: null, swaps: [] };
    if (values.length === 1) return { value: values.pop(), swaps: [] };
    const root = values[0];
    values[0] = values.pop();
    const swaps = bubbleDown(0);
    return { value: root, swaps };
  };

  const clear = () => {
    values.length = 0;
  };

  const toArray = () => [...values];

  const toPayload = () => ({ values: [...values], mode });

  const loadFromPayload = (payload) => {
    const nextMode = payload?.mode === "max" ? "max" : "min";
    mode = nextMode;
    values.length = 0;
    if (Array.isArray(payload?.values)) {
      payload.values.forEach((v) => values.push(v));
      heapify();
      return true;
    }
    return false;
  };

  // init
  heapify();

  return {
    insert,
    extract,
    peek,
    clear,
    toArray,
    setMode,
    getMode: () => mode,
    toPayload,
    loadFromPayload,
  };
}

