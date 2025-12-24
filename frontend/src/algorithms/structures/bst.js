// frontend/src/algorithms/structures/bst.js

class BstNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

const buildValues = (values) => (Array.isArray(values) ? [...values] : []);

const serializeTree = (node) => {
  if (!node) return null;
  return {
    value: node.value,
    left: serializeTree(node.left),
    right: serializeTree(node.right),
  };
};

const deserializeTree = (payloadNode) => {
  if (!payloadNode) return null;
  const node = new BstNode(payloadNode.value);
  node.left = deserializeTree(payloadNode.left);
  node.right = deserializeTree(payloadNode.right);
  return node;
};

export function createBstStructure(initialValues = []) {
  let root = null;

  const insert = (value) => {
    const path = [];
    if (!root) {
      root = new BstNode(value);
      path.push(value);
      return { inserted: true, path };
    }

    let current = root;
    while (current) {
      path.push(current.value);
      if (value === current.value) {
        return { inserted: false, error: "Duplicate values are not allowed.", path };
      }
      if (value < current.value) {
        if (!current.left) {
          current.left = new BstNode(value);
          path.push(value);
          return { inserted: true, path };
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = new BstNode(value);
          path.push(value);
          return { inserted: true, path };
        }
        current = current.right;
      }
    }

    return { inserted: false, error: "Insert failed.", path };
  };

  const search = (value) => {
    const path = [];
    let current = root;
    while (current) {
      path.push(current.value);
      if (value === current.value) {
        return { found: true, path };
      }
      current = value < current.value ? current.left : current.right;
    }
    return { found: false, path };
  };

  const deleteValue = (value) => {
    const path = [];

    const deleteRec = (node, target) => {
      if (!node) return { node: null, deleted: false };
      path.push(node.value);

      if (target < node.value) {
        const res = deleteRec(node.left, target);
        node.left = res.node;
        return { node, deleted: res.deleted };
      }
      if (target > node.value) {
        const res = deleteRec(node.right, target);
        node.right = res.node;
        return { node, deleted: res.deleted };
      }

      // Found node
      if (!node.left && !node.right) {
        return { node: null, deleted: true };
      }
      if (!node.left) {
        return { node: node.right, deleted: true };
      }
      if (!node.right) {
        return { node: node.left, deleted: true };
      }

      // Two children: replace with inorder successor
      let successorParent = node;
      let successor = node.right;
      while (successor.left) {
        successorParent = successor;
        successor = successor.left;
      }
      node.value = successor.value;
      if (successorParent === node) {
        successorParent.right = successor.right;
      } else {
        successorParent.left = successor.right;
      }
      return { node, deleted: true };
    };

    const result = deleteRec(root, value);
    root = result.node;
    return { deleted: result.deleted, path, error: result.deleted ? null : "Value not found." };
  };

  const clear = () => {
    root = null;
  };

  const traverse = (order) => {
    const result = [];
    if (!root) return result;

    const visit = (node) => {
      if (!node) return;
      if (order === "pre") result.push(node.value);
      visit(node.left);
      if (order === "in") result.push(node.value);
      visit(node.right);
      if (order === "post") result.push(node.value);
    };

    if (order === "level") {
      const queue = [root];
      while (queue.length) {
        const n = queue.shift();
        result.push(n.value);
        if (n.left) queue.push(n.left);
        if (n.right) queue.push(n.right);
      }
      return result;
    }

    visit(root);
    return result;
  };

  const toPayload = () => ({ values: traverse("level"), tree: serializeTree(root) });

  const loadFromPayload = (payload) => {
    clear();
    if (payload?.tree) {
      root = deserializeTree(payload.tree);
      return Boolean(root || payload.tree === null);
    }
    const values = buildValues(payload?.values);
    for (const v of values) {
      const res = insert(v);
      if (!res.inserted) return false;
    }
    return true;
  };

  // Init
  if (Array.isArray(initialValues)) {
    initialValues.forEach((v) => insert(v));
  }

  return {
    insert,
    search,
    delete: deleteValue,
    clear,
    traverse,
    getRoot: () => root,
    toPayload,
    loadFromPayload,
  };
}
