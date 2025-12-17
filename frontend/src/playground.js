// frontend/src/playground.js
import "./style.css";
import { createStackStructure } from "./algorithms/structures/stack.js";
import { createLinkedListStructure } from "./algorithms/structures/linkedList.js";
import { createStackVisualizer } from "./visualizers/structures/stackVisualizer.js";
import { createLinkedListVisualizer } from "./visualizers/structures/linkedListVisualizer.js";
import { createViewportController } from "./visualizers/viewportController.js";
import { STRUCTURE_INFO } from "./data/structureInfo.js";
import { parseInputValues } from "./utils/inputParser.js";
import {
  fetchCurrentUser,
  fetchSavedVisualizations,
  createSavedVisualization,
  deleteSavedVisualization,
} from "./services/api.js";

const SAVED_VIS_STORAGE_KEY = "dss-saved-visualization";
const numberPattern = /^[+-]?\d+(\.\d+)?$/;

const createPassiveStructure = () => ({
  insert: () => false,
  remove: () => null,
  clear: () => {},
  toArray: () => [],
});

const stackVisualizer = createStackVisualizer();
const linkedListVisualizer = createLinkedListVisualizer();

const structureDefinitions = {
  array: {
    label: STRUCTURE_INFO.array.label,
    createStructure: createPassiveStructure,
    visualizer: null,
    viewport: { horizontal: true, vertical: false },
    interactive: false,
    canSave: false,
    supportsBatch: false,
    controlLabels: {
      input: "Insert value(s)",
      insert: "Insert",
      remove: "Remove",
    },
    placeholder: "Array visualization canvas.",
  },
  stack: {
    label: STRUCTURE_INFO.stack.label,
    createStructure: createStackStructure,
    visualizer: stackVisualizer,
    viewport: { horizontal: true, vertical: false },
    interactive: true,
    canSave: true,
    supportsBatch: true,
    controlLabels: {
      input: "Push value or list",
      insert: "Push",
      remove: "Pop",
    },
    placeholder: "Stack is empty. Push values to begin.",
  },
  queue: {
    label: STRUCTURE_INFO.queue.label,
    createStructure: createPassiveStructure,
    visualizer: null,
    viewport: { horizontal: true, vertical: false },
    interactive: false,
    canSave: false,
    supportsBatch: false,
    controlLabels: {
      input: "Enqueue value or list",
      insert: "Enqueue",
      remove: "Dequeue",
    },
    placeholder: "Queue visualization canvas.",
  },
  linkedlist: {
    label: STRUCTURE_INFO.linkedlist.label,
    createStructure: createLinkedListStructure,
    visualizer: linkedListVisualizer,
    viewport: { horizontal: true, vertical: false },
    interactive: true,
    canSave: true,
    supportsBatch: true,
    controlLabels: {
      input: "Insert value or list",
      insert: "Insert",
      remove: "Remove head",
    },
    placeholder: "List is empty. Insert values to begin.",
  },
  bst: {
    label: STRUCTURE_INFO.bst.label,
    createStructure: createPassiveStructure,
    visualizer: null,
    viewport: { horizontal: true, vertical: true },
    interactive: false,
    canSave: false,
    supportsBatch: false,
    controlLabels: {
      input: "Insert value(s)",
      insert: "Insert",
      remove: "Remove",
    },
    placeholder: "Binary Search Tree visualization canvas.",
  },
  binaryheap: {
    label: STRUCTURE_INFO.binaryheap.label,
    createStructure: createPassiveStructure,
    visualizer: null,
    viewport: { horizontal: true, vertical: true },
    interactive: false,
    canSave: false,
    supportsBatch: false,
    controlLabels: {
      input: "Insert value(s)",
      insert: "Insert",
      remove: "Remove",
    },
    placeholder: "Binary Heap visualization canvas.",
  },
};

const drawStaticPlaceholder = (svg, message) => {
  if (!svg) return;
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }
  svg.setAttribute("width", "1000");
  svg.setAttribute("height", "400");
  svg.setAttribute("viewBox", "0 0 1000 400");

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("width", "1000");
  rect.setAttribute("height", "400");
  rect.setAttribute("fill", "#f9fafb");
  rect.setAttribute("stroke", "#e5e7eb");
  svg.appendChild(rect);

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", "500");
  text.setAttribute("y", "200");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("fill", "#9ca3af");
  text.setAttribute("font-size", "18");
  text.setAttribute(
    "font-family",
    "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  );
  text.textContent = message || "Visualization will appear here.";
  svg.appendChild(text);
};

document.addEventListener("DOMContentLoaded", () => {
  const dataInput = document.getElementById("dataInput");
  const insertBtn = document.getElementById("insertBtn");
  const removeBtn = document.getElementById("removeBtn");
  const clearBtn = document.getElementById("clearBtn");
  const autoplayBtn = document.getElementById("autoplayBtn");
  const speedSlider = document.getElementById("speedSlider");
  const speedValue = document.getElementById("speedValue");
  const statusDiv = document.getElementById("status");
  const saveStateBtn = document.getElementById("saveStateBtn");
  const saveModal = document.getElementById("saveModal");
  const saveForm = document.getElementById("saveForm");
  const saveNameInput = document.getElementById("saveName");
  const saveMessage = document.getElementById("saveMessage");
  const saveStructureLabel = document.getElementById("saveStructureLabel");
  const closeSaveModal = document.getElementById("closeSaveModal");
  const algorithmSelect = document.getElementById("algorithmSelect");
  const svg = document.getElementById("vis");
  const visContainer = document.getElementById("visScrollContainer");
  const infoTitle = document.getElementById("infoTitle");
  const infoDescription = document.getElementById("infoDescription");
  const infoOperations = document.getElementById("infoOperations");
  const infoComplexities = document.getElementById("infoComplexities");
  const infoUseCases = document.getElementById("infoUseCases");
  const infoNotes = document.getElementById("infoNotes");
  const savedStatus = document.getElementById("savedVisualizationsStatus");
  const savedList = document.getElementById("savedVisualizationsList");

  const viewportController = createViewportController({
    container: visContainer,
  });

  const structures = new Map();
  let currentStructureKey = "stack";
  let isAutoPlaying = false;
  let sequenceQueue = [];
  let sequenceTimeout = null;
  let loggedInUser = null;
  let savedVisualizations = [];

  const colorClassPattern = /^text-(red|green|gray)-600$/;
  const statusBaseClasses = (statusDiv?.className || "")
    .split(/\s+/)
    .filter((cls) => cls && !colorClassPattern.test(cls));

  const getStructureDefinition = (key) =>
    structureDefinitions[key] || {
      label: key.toUpperCase(),
      createStructure: createPassiveStructure,
      visualizer: null,
      viewport: { horizontal: true, vertical: false },
      interactive: false,
      canSave: false,
      supportsBatch: false,
      controlLabels: {
        input: "Insert value(s)",
        insert: "Insert",
        remove: "Remove",
      },
      placeholder: "Visualization will appear here.",
    };

  const getStructureInstance = (key) => {
    if (!structures.has(key)) {
      const definition = getStructureDefinition(key);
      const factory = definition.createStructure || createPassiveStructure;
      structures.set(key, factory());
    }
    return structures.get(key);
  };

  const updateStatus = (message, type = "info") => {
    if (!statusDiv) return;
    statusDiv.textContent = message || "";
    const colorClass =
      type === "error"
        ? "text-red-600"
        : type === "success"
        ? "text-green-600"
        : "text-gray-600";
    statusDiv.className = [...statusBaseClasses, colorClass].join(" ").trim();
  };

  const setSaveMessage = (message, type = "info") => {
    if (!saveMessage) return;
    saveMessage.textContent = message || "";
    saveMessage.className = `text-sm ${
      type === "error"
        ? "text-red-600"
        : type === "success"
        ? "text-green-600"
        : "text-gray-500"
    }`;
  };

  const sanitizeNumericValues = (rawValues) => {
    const normalized = [];
    for (const token of rawValues) {
      const trimmed = token.trim();
      if (!numberPattern.test(trimmed)) {
        return { normalized: [], invalidToken: trimmed };
      }
      normalized.push(parseFloat(trimmed));
    }
    return { normalized, invalidToken: null };
  };

  const populateList = (element, items, fallbackMessage) => {
    if (!element) return;
    element.innerHTML = "";
    if (!items?.length) {
      const li = document.createElement("li");
      li.textContent = fallbackMessage || "Details coming soon.";
      li.className = "text-sm text-gray-500";
      element.appendChild(li);
      return;
    }
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      li.className = "text-sm text-gray-600";
      element.appendChild(li);
    });
  };

  const updateInfoPanel = () => {
    const meta = STRUCTURE_INFO[currentStructureKey] || {};
    if (infoTitle) infoTitle.textContent = meta.label || currentStructureKey.toUpperCase();
    if (infoDescription) {
      infoDescription.textContent =
        meta.description || "A description will appear here.";
    }
    populateList(infoOperations, meta.operations, "Operations will appear here.");
    populateList(
      infoComplexities,
      meta.complexities,
      "Complexity analysis is on the way.",
    );
    populateList(
      infoUseCases,
      meta.useCases,
      "Use case examples will appear here.",
    );
    populateList(infoNotes, meta.notes, "Notes will appear here.");
  };

  const renderStructure = () => {
    if (!svg) return;
    const definition = getStructureDefinition(currentStructureKey);
    const structure = getStructureInstance(currentStructureKey);
    const values = structure.toArray();
    if (definition.visualizer) {
      definition.visualizer.render(svg, values);
    } else {
      drawStaticPlaceholder(svg, definition.placeholder);
    }
    viewportController.setMode(definition.viewport || { horizontal: true, vertical: false });
    viewportController.update();
  };

  const refreshControlLabels = () => {
    if (!dataInput || !insertBtn || !removeBtn) return;
    const definition = getStructureDefinition(currentStructureKey);
    const { controlLabels } = definition;
    const inputLabel = document.querySelector("label[for='dataInput']");
    if (inputLabel) {
      inputLabel.textContent = controlLabels?.input || "Insert value(s)";
    }
    insertBtn.textContent = controlLabels?.insert || "Insert";
    removeBtn.textContent = controlLabels?.remove || "Remove";
  };

  const getSequenceDelay = (speed = 50) => {
    const minDelay = 200;
    const maxDelay = 1400;
    const ratio = (100 - speed) / 90;
    return Math.round(minDelay + ratio * (maxDelay - minDelay));
  };

  const updateAutoplayBtn = () => {
    if (!autoplayBtn) return;
    const label = sequenceQueue.length
      ? isAutoPlaying
        ? "Pause auto-play"
        : "Resume auto-play"
      : "Auto-play";
    autoplayBtn.textContent = label;
    autoplayBtn.className = isAutoPlaying
      ? "w-full ds-btn ds-btn-primary"
      : "w-full ds-btn ds-btn-outline";
  };

  const resetSequence = (clearQueue = true) => {
    if (sequenceTimeout) {
      clearTimeout(sequenceTimeout);
      sequenceTimeout = null;
    }
    if (clearQueue) {
      sequenceQueue = [];
    }
    isAutoPlaying = false;
    updateAutoplayBtn();
  };

  const processNextSequenceValue = () => {
    if (!isAutoPlaying) return;
    if (!sequenceQueue.length) {
      resetSequence(true);
      updateStatus("Sequence complete.", "success");
      return;
    }
    const nextValue = sequenceQueue.shift();
    handleInsert(nextValue, true);
    if (sequenceQueue.length) {
      sequenceTimeout = setTimeout(
        processNextSequenceValue,
        getSequenceDelay(Number(speedSlider?.value) || 50),
      );
    } else {
      resetSequence(true);
      updateStatus("All values inserted.", "success");
    }
  };

  const applySnapshotToStructure = (structureKey, payload) => {
    const definition = getStructureDefinition(structureKey);
    if (!definition.canSave) {
      return false;
    }
    const structure = getStructureInstance(structureKey);
    if (!payload || !Array.isArray(payload.values)) {
      return false;
    }
    structure.clear();
    payload.values.forEach((value) => {
      structure.insert(value);
    });
    return true;
  };

  const loadVisualizationFromStorage = () => {
    const stored = localStorage.getItem(SAVED_VIS_STORAGE_KEY);
    if (!stored) return false;
    localStorage.removeItem(SAVED_VIS_STORAGE_KEY);
    try {
      const saved = JSON.parse(stored);
      if (!saved?.kind || !saved.payload) return false;
      if (!applySnapshotToStructure(saved.kind, saved.payload)) {
        return false;
      }
      currentStructureKey = saved.kind;
      if (algorithmSelect) algorithmSelect.value = currentStructureKey;
      applyStructureContext(false);
      updateStatus(
        saved.name
          ? `Loaded saved visualization "${saved.name}".`
          : "Loaded saved visualization.",
        "success",
      );
      return true;
    } catch (error) {
      console.error(error);
      updateStatus("Failed to load saved visualization.", "error");
      return false;
    }
  };

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderSavedVisualizations = (errorMessage) => {
    if (!savedStatus || !savedList) return;
    if (errorMessage) {
      savedStatus.textContent = errorMessage;
      savedList.innerHTML =
        '<p class="text-sm text-red-600">Unable to load saved visualizations.</p>';
      return;
    }
    if (!loggedInUser) {
      savedStatus.textContent = "Log in to keep your sessions saved.";
      savedList.innerHTML =
        '<p class="text-sm text-gray-500">Log in to save and load visualizations from here.</p>';
      return;
    }
    if (!savedVisualizations.length) {
      savedStatus.textContent = "No saved visualizations yet.";
      savedList.innerHTML =
        '<p class="text-sm text-gray-500">Save a structure state to see it listed here.</p>';
      return;
    }
    savedStatus.textContent = "";
    savedList.innerHTML = "";
    savedVisualizations.forEach((viz) => {
      const card = document.createElement("div");
      card.className =
        "border border-gray-200 rounded-xl p-4 bg-white flex flex-col gap-3 shadow-sm";
      const header = document.createElement("div");
      header.className = "flex items-center justify-between gap-3";

      const info = document.createElement("div");
      const title = document.createElement("p");
      title.className = "font-semibold text-gray-900";
      title.textContent = viz.name || "Untitled visualization";
      info.appendChild(title);

      const meta = document.createElement("p");
      meta.className = "text-xs text-gray-500";
      meta.textContent = `${viz.kind?.toUpperCase() || "STRUCTURE"} • ${formatDate(
        viz.created_at,
      )}`;
      info.appendChild(meta);
      header.appendChild(info);

      const actions = document.createElement("div");
      actions.className = "flex gap-2";

      const loadBtn = document.createElement("button");
      loadBtn.className = "ds-btn ds-btn-secondary text-xs px-3 py-1";
      loadBtn.textContent = "Load";
      loadBtn.dataset.action = "load";
      loadBtn.dataset.id = String(viz.id);
      actions.appendChild(loadBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "ds-btn ds-btn-outline text-xs px-3 py-1";
      deleteBtn.textContent = "Delete";
      deleteBtn.dataset.action = "delete";
      deleteBtn.dataset.id = String(viz.id);
      actions.appendChild(deleteBtn);

      header.appendChild(actions);
      card.appendChild(header);

      const payloadPreview = document.createElement("code");
      payloadPreview.className =
        "text-xs text-gray-600 bg-gray-100 rounded px-3 py-2 block";
      payloadPreview.textContent = JSON.stringify(viz.payload);
      card.appendChild(payloadPreview);
      savedList.appendChild(card);
    });
  };

  const refreshSavedVisualizations = async () => {
    if (!savedStatus || !savedList) return;
    if (!loggedInUser) {
      renderSavedVisualizations();
      return;
    }
    savedStatus.textContent = "Loading saved visualizations…";
    savedList.innerHTML =
      '<p class="text-sm text-gray-500">Loading visualizations…</p>';
    try {
      savedVisualizations = await fetchSavedVisualizations();
      renderSavedVisualizations();
    } catch (error) {
      const message =
        error?.status === 401
          ? "Session expired. Log in again to manage visualizations."
          : error.message;
      renderSavedVisualizations(message);
    }
  };

  const handleSavedVisualizationsClick = async (event) => {
    const target = event.target;
    if (!target?.dataset?.action) return;
    const { action, id } = target.dataset;
    const vizId = Number(id);
    if (!Number.isFinite(vizId)) return;
    const entry = savedVisualizations.find((item) => item.id === vizId);
    if (!entry) return;

    if (action === "load") {
      const definition = getStructureDefinition(entry.kind);
      if (!definition.canSave) {
        updateStatus(
          `${definition.label} visualization cannot be loaded yet.`,
          "info",
        );
        return;
      }
      const applied = applySnapshotToStructure(entry.kind, entry.payload);
      if (!applied) {
        updateStatus("Could not load the saved visualization.", "error");
        return;
      }
      currentStructureKey = entry.kind;
      if (algorithmSelect) algorithmSelect.value = entry.kind;
      applyStructureContext(false);
      updateStatus(`Loaded "${entry.name}" from Saved Visualizations.`, "success");
    }

    if (action === "delete") {
      const confirmed = window.confirm("Delete this saved visualization?");
      if (!confirmed) return;
      try {
        await deleteSavedVisualization(entry.id);
        savedVisualizations = savedVisualizations.filter(
          (item) => item.id !== entry.id,
        );
        renderSavedVisualizations();
        updateStatus(`Deleted "${entry.name}".`, "success");
      } catch (error) {
        updateStatus(error.message, "error");
      }
    }
  };

  const handleInsert = (value, fromSequence = false) => {
    const definition = getStructureDefinition(currentStructureKey);
    if (!definition.interactive) {
      updateStatus(
        `${definition.label} controls are disabled in this build.`,
        "info",
      );
      return false;
    }
    const structure = getStructureInstance(currentStructureKey);
    structure.insert(value);
    renderStructure();
    const actionLabel = definition.controlLabels?.insert || "Insert";
    const suffix = fromSequence ? " from list" : "";
    updateStatus(`${actionLabel} "${value}"${suffix}.`, "success");
    return true;
  };

  const handleRemove = () => {
    const definition = getStructureDefinition(currentStructureKey);
    if (!definition.interactive) {
      updateStatus(
        `${definition.label} controls are disabled in this build.`,
        "info",
      );
      return;
    }
    const structure = getStructureInstance(currentStructureKey);
    const removed = structure.remove();
    if (removed === null || removed === undefined) {
      updateStatus("Structure is already empty.", "error");
      return;
    }
    renderStructure();
    const label = definition.controlLabels?.remove || "Remove";
    updateStatus(`${label} "${removed}".`, "success");
  };

  const applyStructureContext = (emitStatus = true) => {
    resetSequence(true);
    refreshControlLabels();
    updateInfoPanel();
    renderStructure();
    if (emitStatus) {
      const definition = getStructureDefinition(currentStructureKey);
      updateStatus(`${definition.label} ready.`, "success");
    }
  };

  const initAuthState = async () => {
    try {
      loggedInUser = await fetchCurrentUser();
    } catch (error) {
      console.warn("Unable to fetch current user.", error);
      loggedInUser = null;
    }
    await refreshSavedVisualizations();
  };

  const handleSaveSubmit = async (event) => {
    event.preventDefault();
    if (!loggedInUser) {
      setSaveMessage("Please log in to save visualizations.", "error");
      return;
    }
    const definition = getStructureDefinition(currentStructureKey);
    if (!definition.canSave) {
      setSaveMessage("Saving is not enabled for this structure.", "error");
      return;
    }
    const structure = getStructureInstance(currentStructureKey);
    const snapshot = structure.toArray();
    if (!snapshot.length) {
      setSaveMessage("There is nothing to save for this structure.", "error");
      return;
    }
    const name = saveNameInput?.value.trim();
    if (!name) {
      setSaveMessage("Please provide a name.", "error");
      return;
    }
    try {
      await createSavedVisualization({
        name,
        kind: currentStructureKey,
        payload: { values: snapshot },
      });
      setSaveMessage("Saved! View it below or in your profile.", "success");
      await refreshSavedVisualizations();
      setTimeout(() => {
        saveModal?.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
      }, 600);
    } catch (error) {
      setSaveMessage(error.message, "error");
    }
  };

  const toggleSaveModal = (show) => {
    if (!saveModal) return;
    saveModal.classList.toggle("hidden", !show);
    document.body.classList.toggle("overflow-hidden", show);
    if (show) {
      saveForm?.reset();
      setSaveMessage("");
      saveNameInput?.focus();
      if (saveStructureLabel) {
        saveStructureLabel.textContent = `Current structure: ${currentStructureKey.toUpperCase()}`;
      }
    }
  };

  if (speedSlider && speedValue) {
    speedSlider.addEventListener("input", (event) => {
      speedValue.textContent = event.target.value;
      if (isAutoPlaying) {
        updateStatus(
          `Animation speed set to ${event.target.value}%.`,
          "info",
        );
      }
    });
  }

  insertBtn?.addEventListener("click", () => {
    if (!dataInput) return;
    const rawValues = parseInputValues(dataInput.value);
    if (!rawValues.length) {
      updateStatus("Please enter at least one numeric value.", "error");
      return;
    }
    const { normalized, invalidToken } = sanitizeNumericValues(rawValues);
    if (invalidToken !== null) {
      updateStatus(
        `Only numeric values are allowed. Problematic input: "${invalidToken}".`,
        "error",
      );
      return;
    }
    dataInput.value = "";
    if (normalized.length === 1) {
      resetSequence(true);
      handleInsert(normalized[0]);
    } else {
      const definition = getStructureDefinition(currentStructureKey);
      if (!definition.supportsBatch) {
        updateStatus(
          `${definition.label} batch insertion is not available yet.`,
          "info",
        );
        return;
      }
      sequenceQueue = [...normalized];
      isAutoPlaying = true;
      updateAutoplayBtn();
      updateStatus(
        `Starting sequence of ${normalized.length} values.`,
        "success",
      );
      processNextSequenceValue();
    }
  });

  dataInput?.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      insertBtn?.click();
    }
  });

  removeBtn?.addEventListener("click", () => {
    resetSequence(true);
    handleRemove();
  });

  clearBtn?.addEventListener("click", () => {
    resetSequence(true);
    const definition = getStructureDefinition(currentStructureKey);
    if (!definition.interactive) {
      updateStatus(
        `${definition.label} controls are disabled in this build.`,
        "info",
      );
      return;
    }
    const structure = getStructureInstance(currentStructureKey);
    structure.clear();
    renderStructure();
    updateStatus("Structure cleared.", "success");
  });

  autoplayBtn?.addEventListener("click", () => {
    if (!sequenceQueue.length) {
      updateStatus(
        "No queued list yet. Enter multiple values like [1,2,3] first.",
        "info",
      );
      return;
    }
    if (isAutoPlaying) {
      resetSequence(false);
      updateStatus("Auto-play paused. Resume to continue.", "info");
    } else {
      isAutoPlaying = true;
      updateAutoplayBtn();
      updateStatus("Auto-play resumed.", "success");
      processNextSequenceValue();
    }
  });

  saveStateBtn?.addEventListener("click", () => {
    const definition = getStructureDefinition(currentStructureKey);
    if (!definition.canSave) {
      updateStatus("Saving is not enabled for this structure.", "info");
      return;
    }
    if (!loggedInUser) {
      updateStatus("Please log in to save visualizations.", "error");
      return;
    }
    toggleSaveModal(true);
  });

  closeSaveModal?.addEventListener("click", () => toggleSaveModal(false));
  saveModal?.addEventListener("click", (event) => {
    if (event.target === saveModal) toggleSaveModal(false);
  });
  saveForm?.addEventListener("submit", handleSaveSubmit);

  savedList?.addEventListener("click", handleSavedVisualizationsClick);

  algorithmSelect?.addEventListener("change", (event) => {
    currentStructureKey = event.target.value;
    applyStructureContext(true);
  });

  initAuthState();
  if (algorithmSelect) {
    algorithmSelect.value = currentStructureKey;
  }
  applyStructureContext(false);
  updateAutoplayBtn();
  const loadedFromStorage = loadVisualizationFromStorage();
  if (!loadedFromStorage) {
    updateStatus(
      "Playground ready. Push values into the stack to begin visualizing.",
    );
  }
});
