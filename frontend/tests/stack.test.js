import { describe, it, expect } from "vitest";
import { createStackStructure } from "../src/algorithms/structures/stack.js";

describe("stack structure", () => {
  it("pushes and pops in LIFO order", () => {
    const stack = createStackStructure();
    stack.insert(1);
    stack.insert(2);
    stack.insert(3);
    expect(stack.toArray()).toEqual([1, 2, 3]);
    expect(stack.remove()).toBe(3);
    expect(stack.remove()).toBe(2);
    expect(stack.remove()).toBe(1);
    expect(stack.remove()).toBeNull();
  });

  it("peek returns top without removing", () => {
    const stack = createStackStructure([5, 6]);
    expect(stack.peek()).toBe(6);
    expect(stack.toArray()).toEqual([5, 6]);
  });
});
