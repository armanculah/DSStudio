import { describe, it, expect } from "vitest";
import { createHeapStructure } from "../src/algorithms/structures/heap.js";

describe("heap structure", () => {
  it("maintains min-heap property on insert/extract", () => {
    const heap = createHeapStructure([], "min");
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.insert(1);
    expect(heap.toArray()[0]).toBe(1);
    expect(heap.extract().value).toBe(1);
    expect(heap.extract().value).toBe(3);
  });

  it("maintains max-heap property on insert/extract", () => {
    const heap = createHeapStructure([], "max");
    [4, 7, 2, 9].forEach((v) => heap.insert(v));
    expect(heap.peek()).toBe(9);
    expect(heap.extract().value).toBe(9);
    expect(heap.extract().value).toBe(7);
    expect(heap.getMode()).toBe("max");
  });

  it("extract on empty heap returns null value", () => {
    const heap = createHeapStructure();
    const res = heap.extract();
    expect(res).toEqual({ value: null, swaps: [] });
  });
});
