import { describe, it, expect } from "vitest";
import { createLinkedListStructure } from "../src/algorithms/structures/linkedList.js";

describe("linked list structure", () => {
  it("appends and prepends correctly", () => {
    const list = createLinkedListStructure();
    list.append(2);
    list.prepend(1);
    list.append(3);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  it("insertAt handles middle and end positions", () => {
    const list = createLinkedListStructure([1, 3]);
    expect(list.insertAt(1, 2)).toEqual({ index: 1 });
    expect(list.insertAt(10, 9)).toEqual({ error: "Invalid index." });
    expect(list.insertAt(3, 4)).toEqual({ index: 3 });
    expect(list.toArray()).toEqual([1, 2, 3, 4]);
  });

  it("deleteAt removes by index and reports value", () => {
    const list = createLinkedListStructure([1, 2, 3]);
    expect(list.deleteAt(1)).toEqual({ removed: 2, index: 1 });
    expect(list.toArray()).toEqual([1, 3]);
    expect(list.deleteAt(5)).toEqual({ error: "Invalid index." });
  });

  it("deleteByValue reports visited and handles missing value", () => {
    const list = createLinkedListStructure([1, 2, 3]);
    const res = list.deleteByValue(2);
    expect(res.deleted).toBe(true);
    expect(res.visited).toEqual([0, 1]);
    const miss = list.deleteByValue(9);
    expect(miss.deleted).toBe(false);
    expect(miss.error).toBe("Value not found.");
  });

  it("search returns index and visited nodes", () => {
    const list = createLinkedListStructure([5, 6, 7]);
    const hit = list.search(6);
    expect(hit).toMatchObject({ found: true, index: 1 });
    const miss = list.search(9);
    expect(miss).toMatchObject({ found: false, index: -1 });
  });
});
