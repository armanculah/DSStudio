import { describe, it, expect } from "vitest";
import { createArrayStructure } from "../src/algorithms/structures/array.js";

describe("array structure", () => {
  it("inserts at end and returns index", () => {
    const arr = createArrayStructure([1, 2]);
    const res = arr.insert(3);
    expect(res).toEqual({ index: 2 });
    expect(arr.toArray()).toEqual([1, 2, 3]);
  });

  it("inserts at a given index", () => {
    const arr = createArrayStructure([1, 3]);
    const res = arr.insert(2, 1);
    expect(res).toEqual({ index: 1 });
    expect(arr.toArray()).toEqual([1, 2, 3]);
  });

  it("returns error on invalid index", () => {
    const arr = createArrayStructure([1, 2]);
    expect(arr.insert(3, 5)).toEqual({ error: "Invalid index." });
  });

  it("deletes at index and reports removed value", () => {
    const arr = createArrayStructure([1, 2, 3]);
    const res = arr.deleteAt(1);
    expect(res).toEqual({ removed: 2, index: 1 });
    expect(arr.toArray()).toEqual([1, 3]);
  });

  it("handles delete on empty array", () => {
    const arr = createArrayStructure();
    expect(arr.deleteAt(0)).toEqual({ error: "Array is empty." });
  });

  it("search returns visited indices and found index", () => {
    const arr = createArrayStructure([4, 5, 6]);
    const res = arr.search(5);
    expect(res.foundIndex).toBe(1);
    expect(res.visited).toEqual([0, 1]);
    const miss = arr.search(9);
    expect(miss.foundIndex).toBe(-1);
  });
});
