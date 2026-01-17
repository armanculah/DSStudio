import { describe, it, expect } from "vitest";
import { createQueueStructure } from "../src/algorithms/structures/queue.js";

describe("queue structure", () => {
  it("enqueues and dequeues in FIFO order", () => {
    const queue = createQueueStructure();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(queue.toArray()).toEqual([1, 2, 3]);
    expect(queue.dequeue()).toBe(1);
    expect(queue.dequeue()).toBe(2);
    expect(queue.dequeue()).toBe(3);
    expect(queue.dequeue()).toBeNull();
  });

  it("peekFront/peekRear return correct ends", () => {
    const queue = createQueueStructure([4, 5]);
    expect(queue.peekFront()).toBe(4);
    expect(queue.peekRear()).toBe(5);
  });
});
