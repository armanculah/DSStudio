import { describe, it, expect } from "vitest";
import { createBstStructure } from "../src/algorithms/structures/bst.js";

const buildTree = () => {
  const bst = createBstStructure();
  [5, 3, 7, 2, 4, 6, 8].forEach((v) => bst.insert(v));
  return bst;
};

describe("bst structure", () => {
  it("inorder traversal returns sorted values", () => {
    const bst = buildTree();
    expect(bst.traverse("in")).toEqual([2, 3, 4, 5, 6, 7, 8]);
  });

  it("search reports path and found flag", () => {
    const bst = buildTree();
    const hit = bst.search(6);
    expect(hit.found).toBe(true);
    expect(hit.path).toContain(6);
    const miss = bst.search(10);
    expect(miss.found).toBe(false);
  });

  it("delete handles leaf and one-child removal", () => {
    const bst = buildTree();
    expect(bst.delete(2).deleted).toBe(true); // leaf
    expect(bst.traverse("in")).toEqual([3, 4, 5, 6, 7, 8]);
    expect(bst.delete(7).deleted).toBe(true); // one child after previous delete
    expect(bst.traverse("in")).toEqual([3, 4, 5, 6, 8]);
    const missing = bst.delete(100);
    expect(missing.deleted).toBe(false);
  });
});
