export const STRUCTURE_INFO = {
  array: {
    key: "array",
    label: "Array",
    description:
      "An array is a fixed-length linear data structure that stores homogeneous elements in contiguous memory locations, enabling random access.",
    operations: [
      "Read/update by index",
      "Insert/remove at end",
      "Insert/remove in middle",
    ],
    complexities: [
      "Access by index: O(1)",
      "Insert/remove end: O(1)",
      "Insert/remove middle: O(n)",
      "Search: O(n)",
    ],
    useCases: ["Scoreboards", "Tables of sensor readings", "Low-level memory storage"],
    notes: [
      "Advantages: fast access, memory-efficient, cache-friendly.",
      "Drawbacks: fixed size, middle insertions require shifting, less flexible than linked lists.",
    ],
  },
  stack: {
    key: "stack",
    label: "Stack",
    description:
      "A stack is a fundamental linear data structure that follows the LIFO (Last In, First Out) principle. Insertion and deletion are allowed only at the top.",
    operations: ["push(value): insert at top", "pop(): remove top", "peek(): view top", "isEmpty(), size()"],
    complexities: ["Push/Pop/Peek: O(1)", "Search: O(n)"],
    useCases: [
      "Towers of Hanoi",
      "Undo/Redo functionality",
      "Browser back button",
      "Function call stack (recursion)",
      "Depth-First Search (DFS)",
      "Expression evaluation (infix to postfix)",
    ],
    notes: [
      "Linked list implementation is dynamic; array-based needs capacity or resizing.",
      "Only the top element is accessible, and the last added is removed first.",
    ],
  },
  queue: {
    key: "queue",
    label: "Queue",
    description:
      "A queue is a fundamental linear data structure that follows the FIFO (First In, First Out) principle. Elements are inserted at the tail and removed from the head.",
    operations: ["enqueue(value): insert at tail", "dequeue(): remove at head", "peek(): view front", "isEmpty()"],
    complexities: ["Enqueue/Dequeue: O(1)", "Search: O(n)"],
    useCases: ["Printer spooling", "Customer support ticket systems", "Breadth-First Search (BFS)", "Scheduling tasks"],
    notes: [
      "Removes the least recently added element.",
      "FIFO order is fair and predictable.",
    ],
  },
  linkedlist: {
    key: "linkedlist",
    label: "Linked List",
    description:
      "A linked list is a linear data structure whose elements are not stored in contiguous memory. Each node holds data and a reference to the next node.",
    operations: ["Insert at head or tail", "Remove from head", "Search for a value", "Clear list"],
    complexities: [
      "Insert/remove at head: O(1)",
      "Insert at tail: O(1) with tail pointer",
      "Search: O(n)",
    ],
    useCases: ["Implementing stacks and queues", "Dynamic memory allocation", "Graph representations", "Sparse matrices"],
    notes: [
      "Advantages: dynamic size, efficient insertion/deletion without shifting.",
      "Trade-offs: no random access, extra memory for pointers, less cache-friendly.",
    ],
  },
  bst: {
    key: "bst",
    label: "Binary Search Tree",
    description:
      "A Binary Search Tree (BST) is a binary tree where the left subtree holds smaller values and the right subtree holds larger values, enabling efficient searching when balanced.",
    operations: ["insert(value)", "delete(value)", "search(value)", "Traversals: in-order, pre-order, post-order"],
    complexities: ["Average: O(log n)", "Worst case (unbalanced): O(n)"],
    useCases: ["Ordered data storage", "Range queries", "Auto-complete systems"],
    notes: [
      "BST shape depends on insertion order; sorted input can create a degenerate tree.",
      "Performance degrades if unbalanced; balanced trees avoid this issue.",
    ],
  },
  binaryheap: {
    key: "binaryheap",
    label: "Binary Heap",
    description:
      "A binary heap is a complete binary tree that satisfies the heap property. In a min-heap, parent <= children; in a max-heap, parent >= children. Used for priority queues.",
    operations: ["insert(value)", "extractMin()/extractMax()", "peek()", "heapify()"],
    complexities: ["Insert: O(log n)", "Extract top: O(log n)", "Peek: O(1)", "Build heap: O(n)"],
    useCases: ["Priority queues", "Dijkstra’s algorithm", "Task scheduling"],
    notes: [
      "Stored efficiently in arrays and always complete, so it stays compact.",
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
