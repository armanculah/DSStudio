// frontend/src/playground.js
import "./style.css";
import { Stack } from "./algorithms/structures/stack.js";
import { LinkedList } from "./algorithms/structures/linkedList.js";
import { createStackVisualizer } from "./visualizers/structures/stackVisualizer.js";
import { createLinkedListVisualizer } from "./visualizers/structures/linkedListVisualizer.js";
import { PROFILE_BASE } from "./config.js";

const SAVED_VIS_STORAGE_KEY = "dss-saved-visualization";

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
  const saveStateBtn = document.getElementById("saveStateBtn");
  const saveModal = document.getElementById("saveModal");
  const closeSaveModal = document.getElementById("closeSaveModal");
  const saveForm = document.getElementById("saveForm");
  const saveNameInput = document.getElementById("saveName");
  const saveMessage = document.getElementById("saveMessage");
  const saveStructureLabel = document.getElementById("saveStructureLabel");

  // ---------- STATE ----------
  const stack = new Stack();
  const list = new LinkedList();

  let currentStructure = "stack"; // "stack" | "linkedlist" | etc.
  let isAutoPlaying = false;
  let animationSpeed = 50;

  const stackViz = createStackVisualizer(svg);
  const listViz = createLinkedListVisualizer(svg);
  const saveableStructures = new Set(["stack", "linkedlist"]);

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

  const setSaveMessage = (message, type = "info") => {
    if (!saveMessage) return;
    saveMessage.textContent = message || "";
    saveMessage.className = `text-sm ${
      !message
        ? "text-gray-500"
        : type === "error"
        ? "text-red-600"
        : "text-green-600"
    }`;
  };

  const toggleSaveModal = (show) => {
    if (!saveModal) return;
    saveModal.classList.toggle("hidden", !show);
    document.body.classList.toggle("overflow-hidden", show);
    if (!show) {
      saveForm?.reset();
      setSaveMessage("");
    }
  };

  const getSnapshotForCurrentStructure = () => {
    if (currentStructure === "stack") {
      return { values: stack.toArray() };
    }
    if (currentStructure === "linkedlist") {
      return { values: list.toArray() };
    }
    return null;
  };

  const applySnapshotToStructure = (structure, payload) => {
    if (!payload || !Array.isArray(payload.values)) {
      return false;
    }

    if (structure === "stack") {
      stack.clear();
      payload.values.forEach((value) => {
        stack.push(value);
      });
      return true;
    }

    if (structure === "linkedlist") {
      list.clear();
      payload.values.forEach((value) => {
        list.append(value);
      });
      return true;
    }

    return false;
  };

  const loadVisualizationFromStorage = () => {
    try {
      const stored = localStorage.getItem(SAVED_VIS_STORAGE_KEY);
      if (!stored) return false;
      localStorage.removeItem(SAVED_VIS_STORAGE_KEY);

      const saved = JSON.parse(stored);
      if (!saved || !saved.kind || !saved.payload) return false;

      if (!saveableStructures.has(saved.kind)) {
        updateStatus(
          `Saved visualization ${saved.name || ""} is not supported in this playground yet.`,
          "error",
        );
        return false;
      }

      const applied = applySnapshotToStructure(saved.kind, saved.payload);
      if (!applied) {
        updateStatus("Could not apply saved visualization payload.", "error");
        return false;
      }

      currentStructure = saved.kind;
      if (algorithmSelect) {
        algorithmSelect.value = saved.kind;
      }
      refreshLabels();
      render();
      updateStatus(
        `Loaded saved ${saved.kind.toUpperCase()} visualization${
          saved.name ? ` "${saved.name}"` : ""
        }.`,
        "success",
      );
      return true;
    } catch (error) {
      console.error(error);
      updateStatus("Failed to load saved visualization.", "error");
      return false;
    }
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

  const handleSaveSubmit = async (event) => {
    event.preventDefault();
    if (!saveNameInput) return;

    if (!saveableStructures.has(currentStructure)) {
      setSaveMessage(
        `Saving is not supported for ${currentStructure} yet.`,
        "error",
      );
      return;
    }

    const snapshot = getSnapshotForCurrentStructure();
    if (!snapshot) {
      setSaveMessage("Nothing to save for this structure.", "error");
      return;
    }

    const name = saveNameInput.value.trim();
    if (!name) {
      setSaveMessage("Please provide a name.", "error");
      return;
    }

    try {
      const res = await fetch(`${PROFILE_BASE}/me/saved-visualizations`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          kind: currentStructure,
          payload: snapshot,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setSaveMessage("Please log in to save visualizations.", "error");
        return;
      }

      if (!res.ok) {
        throw new Error(data.detail || data.error || "Unable to save state.");
      }

      setSaveMessage("Saved! View it on your profile.", "success");
      setTimeout(() => {
        toggleSaveModal(false);
        updateStatus(`Saved "${name}" to your profile.`, "success");
      }, 600);
    } catch (error) {
      console.error(error);
      setSaveMessage(error.message, "error");
    }
  };

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

  // SAVE MODAL EVENTS
  if (saveStateBtn) {
    saveStateBtn.addEventListener("click", () => {
      if (!saveableStructures.has(currentStructure)) {
        updateStatus(
          `Saving is not supported for ${currentStructure} yet.`,
          "error",
        );
        return;
      }
      if (saveStructureLabel) {
        saveStructureLabel.textContent = `Current structure: ${currentStructure.toUpperCase()}`;
      }
      toggleSaveModal(true);
      saveNameInput?.focus();
    });
  }

  closeSaveModal?.addEventListener("click", () => toggleSaveModal(false));

  saveModal?.addEventListener("click", (event) => {
    if (event.target === saveModal) {
      toggleSaveModal(false);
    }
  });

  saveForm?.addEventListener("submit", handleSaveSubmit);

  // ---------- INIT ----------
  refreshLabels();
  const loadedFromStorage = loadVisualizationFromStorage();
  if (!loadedFromStorage) {
    updateStatus(
      "Playground ready. Using STACK visualization. Push or insert values to see them appear.",
    );
    render();
  }
});
