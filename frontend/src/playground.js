// frontend/src/playground.js
import "./style.css";
import { Stack } from "./algorithms/structures/stack.js";
import { LinkedList } from "./algorithms/structures/linkedList.js";
import { createStackVisualizer } from "./visualizers/structures/stackVisualizer.js";
import { createLinkedListVisualizer } from "./visualizers/structures/linkedListVisualizer.js";

console.log("Playground page loaded");

document.addEventListener("DOMContentLoaded", () => {
  const dataInput = document.getElementById("dataInput");
  const insertBtn = document.getElementById("insertBtn");
  const removeBtn = document.getElementById("removeBtn");
  const clearBtn = document.getElementById("clearBtn");
  const autoplayBtn = document.getElementById("autoplayBtn");
  const speedSlider = document.getElementById("speedSlider");
  const speedValue = document.getElementById("speedValue");
  const algorithmSelect = document.getElementById("algorithmSelect");
  const statusDiv = document.getElementById("status");
  const svg = document.getElementById("vis");

  // ---------- STATE ----------
  const stack = new Stack();
  const list = new LinkedList();

  let currentStructure = "stack"; // "stack" | "linkedlist" | etc.
  let isAutoPlaying = false;
  let animationSpeed = 50;

  const stackViz = createStackVisualizer(svg);
  const listViz = createLinkedListVisualizer(svg);

  // ---------- STATUS ----------
  const updateStatus = (message, type = "info") => {
    if (!statusDiv) return;
    const statusContent = statusDiv.querySelector("div");
    if (!statusContent) return;

    statusContent.textContent = message;
    statusContent.className = `text-sm ${
      type === "error"
        ? "text-red-600"
        : type === "success"
        ? "text-green-600"
        : "text-gray-600"
    }`;
  };

  // ---------- RENDER DISPATCH ----------
  const render = () => {
    if (currentStructure === "stack") {
      stackViz.render(stack.toArray());
    } else if (currentStructure === "linkedlist") {
      listViz.render(list.toArray());
    } else {
      // fallback – you can create separate visualizers for others later
      stackViz.reset();
      updateStatus(
        `Visualization for "${currentStructure.toUpperCase()}" is not implemented yet.`,
        "error",
      );
    }
  };

  // ---------- UI LABELS ----------
  const refreshLabels = () => {
    const label = document.querySelector("label[for='dataInput']");
    if (!label || !insertBtn || !removeBtn) return;

    if (currentStructure === "stack") {
      label.textContent = "Push value";
      insertBtn.textContent = "Push";
      removeBtn.textContent = "Pop";
    } else if (currentStructure === "linkedlist") {
      label.textContent = "Insert value (at tail)";
      insertBtn.textContent = "Insert";
      removeBtn.textContent = "Remove head";
    } else {
      label.textContent = "Add value";
      insertBtn.textContent = "Insert";
      removeBtn.textContent = "Remove";
    }
  };

  // ---------- CONTROLS ----------

  // Speed slider
  if (speedSlider && speedValue) {
    speedSlider.addEventListener("input", (e) => {
      animationSpeed = parseInt(e.target.value, 10);
      speedValue.textContent = animationSpeed;
      updateStatus(`Animation speed set to ${animationSpeed}%`);
    });
  }

  // INSERT
  if (insertBtn && dataInput) {
    insertBtn.addEventListener("click", () => {
      const value = dataInput.value.trim();
      if (!value) {
        updateStatus("Please enter a value first.", "error");
        return;
      }

      if (currentStructure === "stack") {
        stack.push(value);
        updateStatus(`PUSH "${value}" onto stack`, "success");
      } else if (currentStructure === "linkedlist") {
        list.append(value);
        updateStatus(
          `Inserted "${value}" at tail of linked list`,
          "success",
        );
      } else {
        updateStatus(
          `Insert operation not implemented for ${currentStructure}.`,
          "error",
        );
      }

      dataInput.value = "";
      render();
    });

    dataInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        insertBtn.click();
      }
    });
  }

  // REMOVE
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      if (currentStructure === "stack") {
        if (stack.isEmpty) {
          updateStatus("Stack is already empty", "error");
          return;
        }
        const removed = stack.pop();
        updateStatus(`POP "${removed}" from stack`, "success");
        render();
      } else if (currentStructure === "linkedlist") {
        if (list.isEmpty) {
          updateStatus("List is already empty", "error");
          return;
        }
        const removed = list.removeHead();
        updateStatus(
          `Removed head "${removed}" from linked list`,
          "success",
        );
        render();
      } else {
        updateStatus(
          `Remove operation not implemented for ${currentStructure}.`,
          "error",
        );
      }
    });
  }

  // CLEAR
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (currentStructure === "stack") {
        stack.clear();
        stackViz.reset();
        updateStatus("Stack cleared", "success");
      } else if (currentStructure === "linkedlist") {
        list.clear();
        listViz.reset();
        updateStatus("Linked list cleared", "success");
      } else {
        updateStatus(
          `Clear operation not implemented for ${currentStructure}.`,
          "error",
        );
      }
    });
  }

  // Auto-play (still just UI)
  if (autoplayBtn) {
    autoplayBtn.addEventListener("click", () => {
      isAutoPlaying = !isAutoPlaying;
      autoplayBtn.textContent = isAutoPlaying ? "Stop Auto-play" : "Auto-play";
      autoplayBtn.className = isAutoPlaying
        ? "w-full ds-btn ds-btn-primary"
        : "w-full ds-btn ds-btn-outline";

      updateStatus(
        isAutoPlaying
          ? "Auto-play started (not wired yet)"
          : "Auto-play stopped",
      );
    });
  }

  // Data structure selector
  if (algorithmSelect) {
    algorithmSelect.addEventListener("change", (e) => {
      currentStructure = e.target.value; // "array", "stack", "queue", "linkedlist", "bst"
      refreshLabels();
      updateStatus(
        `Switched to ${currentStructure.toUpperCase()} visualization`,
      );
      render();
    });

    // default to stack
    algorithmSelect.value = "stack";
  }

  // ---------- INIT ----------
  refreshLabels();
  updateStatus(
    "Playground ready. Using STACK visualization. Push or insert values to see them appear.",
  );
  render();
});
