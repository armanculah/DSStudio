export const STRUCTURE_INFO = {
  array: {
    key: "array",
    label: "Array",
    description:
      "An ordered block of memory where every element has an index. Great for quick lookups.",
    operations: [
      "read(index)",
      "update(index, value)",
      "insert at end",
      "remove at end",
    ],
    complexities: [
      "Access: O(1)",
      "Insert/remove end: O(1)",
      "Insert/remove middle: O(n)",
      "Search: O(n)",
    ],
    useCases: [
      "Leaderboards or scoreboards",
      "Tabular sensor readings",
      "Storing sprites on screen",
    ],
    notes: [
      "Indices shift when inserting/removing in the middle.",
      "Size is fixed unless you resize or allocate a new block.",
    ],
  },
  stack: {
    key: "stack",
    label: "Stack",
    description:
      "A Last-In, First-Out tube. Imagine stacking plates: the most recent plate is the first you grab.",
    operations: ["push(value)", "pop()", "peek()", "clear()"],
    complexities: [
      "Push/Pop: O(1)",
      "Peek: O(1)",
      "Search: O(n)",
    ],
    useCases: ["Undo history", "Call stack while running code", "Backtracking problems"],
    notes: ["Only the top is accessible.", "Perfect for matching brackets or reversing data."],
  },
  queue: {
    key: "queue",
    label: "Queue",
    description:
      "First-In, First-Out line. Like students waiting in line for lunch, the first arrival leaves first.",
    operations: ["enqueue(value)", "dequeue()", "peek()", "isEmpty()"],
    complexities: [
      "Enqueue/Dequeue: O(1)",
      "Search: O(n)",
    ],
    useCases: ["Printer spooling", "Customer support tickets", "Breadth-first search"],
    notes: ["FIFO order guarantees fairness.", "Great for scheduling tasks."],
  },
  linkedlist: {
    key: "linkedlist",
    label: "Linked List",
    description:
      "A chain of nodes where each node points to the next one. Insertions/removals don’t require shifting elements.",
    operations: ["insert at tail", "remove head", "search(value)", "clear()"],
    complexities: [
      "Insert/remove head: O(1)",
      "Insert at tail: O(1) with tail pointer",
      "Search: O(n)",
    ],
    useCases: ["Music playlists", "Undo/redo navigation", "Implementation of stacks/queues"],
    notes: ["No random access, must walk node by node.", "Great when you add/remove frequently."],
  },
  bst: {
    key: "bst",
    label: "Binary Search Tree",
    description:
      "A binary tree that keeps left values smaller and right values larger, enabling fast searches when balanced.",
    operations: ["insert(value)", "delete(value)", "search(value)", "traverse()"],
    complexities: [
      "Search/Insert/Delete: O(log n) average",
      "Worst case (unbalanced): O(n)",
    ],
    useCases: ["Auto-complete dictionaries", "Ordered data indexes", "Range queries"],
    notes: [
      "Performance depends on keeping the tree balanced.",
      "Variants like AVL or Red-Black Trees enforce balance automatically.",
    ],
  },
  binaryheap: {
    key: "binaryheap",
    label: "Binary Heap",
    description:
      "A complete binary tree where each node obeys the heap property (min-heap or max-heap). Perfect for priority queues.",
    operations: ["insert(value)", "extract min/max", "peek()", "heapify()"],
    complexities: [
      "Insert: O(log n)",
      "Extract top: O(log n)",
      "Peek: O(1)",
      "Build heap: O(n)",
    ],
    useCases: ["Priority queues", "Dijkstra’s algorithm", "Scheduling tasks by priority"],
    notes: [
      "Stored efficiently in arrays.",
      "Always a complete tree, so it stays compact.",
    ],
  },
};

export const STRUCTURE_ORDER = [
  "array",
  "stack",
  "queue",
  "linkedlist",
  "bst",
  "binaryheap",
];
