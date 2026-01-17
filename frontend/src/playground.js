// frontend/src/playground.js
import "./style.css";

import { STRUCTURE_INFO } from "./data/structureInfo.js";
import { parseInputValues } from "./utils/inputParser.js";
import {
  fetchCurrentUser,
  fetchSavedVisualizations,
  createSavedVisualization,
  deleteSavedVisualization,
} from "./services/api.js";

import { createArrayStructure } from "./algorithms/structures/array.js";
import { createStackStructure } from "./algorithms/structures/stack.js";
import { createQueueStructure } from "./algorithms/structures/queue.js";
import { createLinkedListStructure } from "./algorithms/structures/linkedList.js";
import { createBstStructure } from "./algorithms/structures/bst.js";
import { createHeapStructure } from "./algorithms/structures/heap.js";

import { createArrayVisualizer } from "./visualizers/structures/arrayVisualizer.js";
import { createStackVisualizer } from "./visualizers/structures/stackVisualizer.js";
import { createQueueVisualizer } from "./visualizers/structures/queueVisualizer.js";
import { createLinkedListVisualizer } from "./visualizers/structures/linkedListVisualizer.js";
import { createBstVisualizer } from "./visualizers/structures/bstVisualizer.js";
import { createHeapVisualizer } from "./visualizers/structures/heapVisualizer.js";

const SAVED_VIS_STORAGE_KEY = "dss-saved-visualization";
const numberPattern = /^[+-]?\d+(\.\d+)?$/;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const parseNumericTokens = (rawInput) => {
  const tokens = parseInputValues(rawInput);
  if (!tokens.length) {
    return { values: [], error: "Only numbers are supported. Example: 7 or [7,3,2]." };
  }
  const values = [];
  for (const token of tokens) {
    const trimmed = String(token).trim();
    if (!trimmed || !numberPattern.test(trimmed)) {
      return {
        values: [],
        error: `Only numbers are supported. Problematic input: "${trimmed}".`,
      };
    }
    values.push(parseFloat(trimmed));
  }
  return { values, error: null };
};

const parseOptionalIndex = (rawValue) => {
  if (rawValue === null || rawValue === undefined) return { index: null, error: null };
  const raw = String(rawValue).trim();
  if (!raw) return { index: null, error: null };
  const num = Number(raw);
  if (!Number.isInteger(num)) {
    return { index: null, error: "Index must be an integer." };
  }
  return { index: num, error: null };
};

const getDelayFromSpeed = (speedPct) => {
  const speed = clamp(Number(speedPct) || 50, 10, 100);
  const minDelay = 160;
  const maxDelay = 1400;
  const ratio = (100 - speed) / 90;
  return Math.round(minDelay + ratio * (maxDelay - minDelay));
};

const normalizePayloadArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.values)) return payload.values;
    if (Array.isArray(payload.payload)) return payload.payload;
    if (payload.tree && payload.values && Array.isArray(payload.values)) return payload.values;
    if (payload.tree && typeof payload.tree === "object") {
      const collected = [];
      const walk = (node) => {
        if (!node) return;
        collected.push(node.value);
        walk(node.left);
        walk(node.right);
      };
      walk(payload.tree);
      if (collected.length) return collected;
    }
  }
  return null;
};

const getCurrentValuesForSave = (structureKey, structures) => {
  const def = getDefinition(structureKey);
  const structure = structures.get(structureKey);
  if (!def || !structure) return [];
  const raw = def.serialize(structure);
  const values = normalizePayloadArray(raw);
  if (Array.isArray(values)) return values;
  if (Array.isArray(raw)) return raw;
  return [];
};

const visualizers = {
  array: createArrayVisualizer(),
  stack: createStackVisualizer(),
  queue: createQueueVisualizer(),
  linkedlist: createLinkedListVisualizer(),
  bst: createBstVisualizer(),
  binaryheap: createHeapVisualizer(),
};

const structureDefinitions = {
  array: {
    key: "array",
    label: "Array",
    create: () => createArrayStructure(),
    visualizer: visualizers.array,
    getRenderData: (structure) => structure.toArray(),
    serialize: (structure) => structure.toArray(),
    load: (structure, payload) => {
      structure.clear();
      const values = Array.isArray(payload) ? payload : Array.isArray(payload?.values) ? payload.values : null;
      if (!values) return false;
      for (const v of values) {
        const res = structure.insert(v);
        if (res?.error) return false;
      }
      return true;
    },
  },
  stack: {
    key: "stack",
    label: "Stack",
    create: () => createStackStructure(),
    visualizer: visualizers.stack,
    getRenderData: (structure) => structure.toArray(),
    serialize: (structure) => structure.toArray(),
    load: (structure, payload) =>
      structure.loadFromPayload
        ? structure.loadFromPayload(Array.isArray(payload) ? { values: payload } : payload)
        : false,
  },
  queue: {
    key: "queue",
    label: "Queue",
    create: () => createQueueStructure(),
    visualizer: visualizers.queue,
    getRenderData: (structure) => structure.toArray(),
    serialize: (structure) => structure.toArray(),
    load: (structure, payload) => {
      structure.clear();
      const values = Array.isArray(payload) ? payload : Array.isArray(payload?.values) ? payload.values : null;
      if (!values) return false;
      values.forEach((v) => structure.enqueue(v));
      return true;
    },
  },
  linkedlist: {
    key: "linkedlist",
    label: "Linked List",
    create: () => createLinkedListStructure(),
    visualizer: visualizers.linkedlist,
    getRenderData: (structure) => structure.toArray(),
    serialize: (structure) => structure.toArray(),
    load: (structure, payload) =>
      structure.loadFromPayload
        ? structure.loadFromPayload(Array.isArray(payload) ? { values: payload } : payload)
        : false,
  },
  bst: {
    key: "bst",
    label: "Binary Search Tree",
    create: () => createBstStructure(),
    visualizer: visualizers.bst,
    getRenderData: (structure) => structure.getRoot(),
    serialize: (structure) => (structure.toPayload ? structure.toPayload().values : []),
    load: (structure, payload) =>
      structure.loadFromPayload
        ? structure.loadFromPayload(Array.isArray(payload) ? { values: payload } : payload)
        : false,
  },
  binaryheap: {
    key: "binaryheap",
    label: "Binary Heap",
    create: () => createHeapStructure([], "min"),
    visualizer: visualizers.binaryheap,
    getRenderData: (structure) => structure.toArray(),
    serialize: (structure) => structure.toArray(),
    load: (structure, payload) =>
      structure.loadFromPayload
        ? structure.loadFromPayload(
            Array.isArray(payload)
              ? { values: payload }
              : payload && typeof payload === "object"
              ? payload
              : { values: [] },
          )
        : false,
  },
};

const getDefinition = (key) => structureDefinitions[key] || structureDefinitions.stack;

document.addEventListener("DOMContentLoaded", () => {
  const algorithmSelect = document.getElementById("algorithmSelect");
  const dataInput = document.getElementById("dataInput");
  const indexInput = document.getElementById("indexInput");
  const indexFieldWrapper = document.getElementById("indexFieldWrapper");
  const controlsExtra = document.getElementById("controlsExtra");

  const insertBtn = document.getElementById("insertBtn");
  const removeBtn = document.getElementById("removeBtn");
  const clearBtn = document.getElementById("clearBtn");
  const autoplayBtn = document.getElementById("autoplayBtn");
  const speedSlider = document.getElementById("speedSlider");
  const speedValue = document.getElementById("speedValue");
  const saveStateBtn = document.getElementById("saveStateBtn");

  const statusDiv = document.getElementById("status");
  const resultDiv = document.getElementById("resultStatus");
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

  const saveModal = document.getElementById("saveModal");
  const saveForm = document.getElementById("saveForm");
  const saveNameInput = document.getElementById("saveName");
  const saveMessage = document.getElementById("saveMessage");
  const saveStructureLabel = document.getElementById("saveStructureLabel");
  const closeSaveModal = document.getElementById("closeSaveModal");

  const structures = new Map();
  let currentStructureKey = "stack";
  let loggedInUser = null;
  let savedVisualizations = [];

  // Sequence runner (used for batch inserts and step-by-step highlights)
  let sequenceSteps = [];
  let sequenceIndex = 0;
  let sequenceTimeout = null;
  let isAutoPlaying = false;

  let renderOptions = {};

  const colorClassPattern = /^text-(red|green|gray)-600$/;
  const statusBaseClasses = (statusDiv?.className || "")
    .split(/\s+/)
    .filter((cls) => cls && !colorClassPattern.test(cls));

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

  const getStructureInstance = (key) => {
    if (!structures.has(key)) {
      const def = getDefinition(key);
      structures.set(key, def.create());
    }
    return structures.get(key);
  };

  const renderStructure = () => {
    if (!svg) return;
    const def = getDefinition(currentStructureKey);
    const structure = getStructureInstance(currentStructureKey);
    const data = def.getRenderData(structure);
    def.visualizer?.render?.(svg, data, renderOptions);
  };

  const updateInfoPanel = () => {
    const meta = STRUCTURE_INFO[currentStructureKey] || {};
    if (infoTitle) infoTitle.textContent = meta.label || getDefinition(currentStructureKey).label;
    if (infoDescription) {
      infoDescription.textContent = meta.description || "A description will appear here.";
    }
    populateList(infoOperations, meta.operations, "Operations will appear here.");
    populateList(infoComplexities, meta.complexities, "Complexity analysis will appear here.");
    populateList(infoUseCases, meta.useCases, "Use case examples will appear here.");
    populateList(infoNotes, meta.notes, "Notes will appear here.");
  };

  const resetSequence = (keepProgress = false) => {
    if (sequenceTimeout) {
      clearTimeout(sequenceTimeout);
      sequenceTimeout = null;
    }
    isAutoPlaying = false;
    if (!keepProgress) {
      sequenceSteps = [];
      sequenceIndex = 0;
    }
    updateAutoplayBtn();
  };

  const updateAutoplayBtn = () => {
    if (!autoplayBtn) return;
    if (!sequenceSteps.length || sequenceIndex >= sequenceSteps.length) {
      autoplayBtn.textContent = "Auto-play";
      autoplayBtn.className = "w-full ds-btn ds-btn-outline";
      return;
    }
    autoplayBtn.textContent = isAutoPlaying ? "Pause auto-play" : "Resume auto-play";
    autoplayBtn.className = isAutoPlaying ? "w-full ds-btn ds-btn-primary" : "w-full ds-btn ds-btn-outline";
  };

  const runSequence = () => {
    if (!isAutoPlaying) return;
    if (sequenceIndex >= sequenceSteps.length) {
      resetSequence(false);
      const keepStatusMessage = renderOptions?.keepStatusMessage || null;
      renderOptions = {};
      renderStructure();
      if (keepStatusMessage) {
        updateStatus(keepStatusMessage, "success");
      }
      return;
    }
    const delay = getDelayFromSpeed(speedSlider?.value);
    const step = sequenceSteps[sequenceIndex];
    sequenceIndex += 1;
    try {
      step();
    } catch (error) {
      console.error(error);
      resetSequence(false);
      updateStatus("Sequence stopped due to an error.", "error");
      return;
    }
    sequenceTimeout = setTimeout(runSequence, delay);
    updateAutoplayBtn();
  };

  const startSequence = (steps, { preserveScroll = false } = {}) => {
    resetSequence(false);
    sequenceSteps = Array.isArray(steps) ? steps : [];
    sequenceIndex = 0;
    isAutoPlaying = true;
    renderOptions = { ...renderOptions, preserveScroll };
    updateAutoplayBtn();
    runSequence();
  };

  const setControlsExtra = (html) => {
    if (!controlsExtra) return;
    controlsExtra.innerHTML = html || "";
    controlsExtra.classList.toggle("hidden", !html);
  };

  const setIndexFieldVisible = (visible, labelText = "Index (optional)") => {
    if (indexFieldWrapper) {
      indexFieldWrapper.classList.toggle("hidden", !visible);
      const label = indexFieldWrapper.querySelector("label");
      if (label) label.textContent = labelText;
      if (!visible && indexInput) indexInput.value = "";
    }
  };

  const updateControlLabels = () => {
    const inputLabel = document.querySelector("label[for='dataInput']");
    if (!inputLabel || !dataInput || !insertBtn || !removeBtn) return;

    if (currentStructureKey === "stack") {
      inputLabel.textContent = "Push value or list";
      dataInput.placeholder = "Examples: 7 or [7,3,6]";
      insertBtn.textContent = "Push";
      removeBtn.textContent = "Pop";
      setIndexFieldVisible(false);
      setControlsExtra(
        `<div class="grid grid-cols-2 gap-2">
          <button class="ds-btn ds-btn-secondary" type="button" data-action="peek">Peek</button>
        </div>`,
      );
      return;
    }

    if (currentStructureKey === "queue") {
      inputLabel.textContent = "Enqueue value or list";
      dataInput.placeholder = "Examples: 7 or [7,3,6]";
      insertBtn.textContent = "Enqueue";
      removeBtn.textContent = "Dequeue";
      setIndexFieldVisible(false);
      setControlsExtra(
        `<div class="grid grid-cols-2 gap-2">
          <button class="ds-btn ds-btn-secondary" type="button" data-action="peekFront">Peek front</button>
          <button class="ds-btn ds-btn-secondary" type="button" data-action="peekRear">Peek rear</button>
        </div>`,
      );
      return;
    }

    if (currentStructureKey === "array") {
      inputLabel.textContent = "Insert value or list";
      dataInput.placeholder = "Examples: 7 or [7,3,6]";
      insertBtn.textContent = "Insert";
      removeBtn.textContent = "Delete";
      setIndexFieldVisible(true, "Index (optional, default append)");
      setControlsExtra(
        `<div class="grid grid-cols-2 gap-2">
          <button class="ds-btn ds-btn-secondary" type="button" data-action="search">Search</button>
        </div>`,
      );
      return;
    }

    if (currentStructureKey === "linkedlist") {
      inputLabel.textContent = "Append value or list";
      dataInput.placeholder = "Examples: 7 or [7,3,6]";
      insertBtn.textContent = "Append";
      removeBtn.textContent = "Remove head";
      setIndexFieldVisible(true, "Index (required for index operations)");
      setControlsExtra(
        `<div class="grid grid-cols-2 gap-2">
          <button class="ds-btn ds-btn-secondary" type="button" data-action="prepend">Prepend</button>
          <button class="ds-btn ds-btn-secondary" type="button" data-action="insertAt">Insert at index</button>
          <button class="ds-btn ds-btn-secondary" type="button" data-action="deleteByValue">Delete by value</button>
          <button class="ds-btn ds-btn-secondary" type="button" data-action="deleteAt">Delete at index</button>
          <button class="ds-btn ds-btn-secondary col-span-2" type="button" data-action="search">Search</button>
        </div>`,
      );
      return;
    }

    if (currentStructureKey === "bst") {
      inputLabel.textContent = "Insert value or list";
      dataInput.placeholder = "Examples: 7 or [7,3,6]";
      insertBtn.textContent = "Insert";
      removeBtn.textContent = "Delete";
      setIndexFieldVisible(false);
      setControlsExtra(
        `<div class="grid grid-cols-2 gap-2">
          <button class="ds-btn ds-btn-secondary" type="button" data-action="search">Search</button>
          <button class="ds-btn ds-btn-secondary" type="button" data-action="traverse" data-order="in">In-order</button>
          <button class="ds-btn ds-btn-secondary" type="button" data-action="traverse" data-order="pre">Pre-order</button>
          <button class="ds-btn ds-btn-secondary" type="button" data-action="traverse" data-order="post">Post-order</button>
          <button class="ds-btn ds-btn-secondary col-span-2" type="button" data-action="traverse" data-order="level">Level-order</button>
        </div>`,
      );
      return;
    }

    if (currentStructureKey === "binaryheap") {
      inputLabel.textContent = "Insert value or list";
      dataInput.placeholder = "Examples: 7 or [7,3,6]";
      insertBtn.textContent = "Insert";
      removeBtn.textContent = "Extract root";
      setIndexFieldVisible(false);
      const heap = getStructureInstance("binaryheap");
      const mode = heap.getMode?.() || "min";
      setControlsExtra(
        `<div class="space-y-3">
          <div>
            <p class="text-sm font-medium text-gray-700 mb-2">Heap mode</p>
            <div class="flex gap-4 items-center">
              <label class="text-sm text-gray-700 flex items-center gap-2">
                <input type="radio" name="heapMode" value="min" ${mode === "min" ? "checked" : ""} data-action="heapMode">
                Min-Heap
              </label>
              <label class="text-sm text-gray-700 flex items-center gap-2">
                <input type="radio" name="heapMode" value="max" ${mode === "max" ? "checked" : ""} data-action="heapMode">
                Max-Heap
              </label>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button class="ds-btn ds-btn-secondary" type="button" data-action="peek">Peek root</button>
          </div>
        </div>`,
      );
      return;
    }
  };

  const applyStructureContext = (emitStatus = true) => {
    resetSequence(false);
    renderOptions = {};
    updateInfoPanel();
    updateControlLabels();
    if (visContainer) {
      visContainer.scrollLeft = 0;
      visContainer.scrollTop = 0;
    }
    renderStructure();
    if (emitStatus) {
      updateStatus(`${getDefinition(currentStructureKey).label} ready.`, "success");
    }
  };

  const highlightLinearSequence = (visitedIndices, { foundIndex = null } = {}) => {
    const steps = [];
    visitedIndices.forEach((idx) => {
      steps.push(() => {
        renderOptions = { preserveScroll: true, highlightIndices: [idx] };
        renderStructure();
      });
    });
    steps.push(() => {
      renderOptions =
        foundIndex === null || foundIndex < 0
          ? { preserveScroll: true }
          : { preserveScroll: true, foundIndex };
      renderStructure();
    });
    startSequence(steps, { preserveScroll: true });
  };

  const highlightValueSequence = (values, { foundValue = null } = {}) => {
    const steps = [];
    values.forEach((val) => {
      steps.push(() => {
        renderOptions = { preserveScroll: true, highlightValues: [val] };
        renderStructure();
      });
    });
    steps.push(() => {
      renderOptions =
        foundValue === null
          ? { preserveScroll: true }
          : { preserveScroll: true, foundValue };
      renderStructure();
    });
    startSequence(steps, { preserveScroll: true });
  };

  const insertSingle = (value, { index = null, mode = "default" } = {}) => {
    const structure = getStructureInstance(currentStructureKey);
    if (currentStructureKey === "array") {
      const res = structure.insert(value, index);
      if (res?.error) {
        updateStatus(res.error, "error");
        return false;
      }
      renderOptions = { highlightIndices: [res.index] };
      renderStructure();
      updateStatus(`Inserted "${value}".`, "success");
      return true;
    }

    if (currentStructureKey === "stack") {
      structure.insert(value);
      renderOptions = {};
      renderStructure();
      updateStatus(`Pushed "${value}".`, "success");
      return true;
    }

    if (currentStructureKey === "queue") {
      structure.enqueue(value);
      renderOptions = { highlightIndices: [structure.toArray().length - 1] };
      renderStructure();
      updateStatus(`Enqueued "${value}".`, "success");
      return true;
    }

    if (currentStructureKey === "linkedlist") {
      if (mode === "prepend") {
        structure.prepend(value);
        renderOptions = { highlightIndices: [0] };
        renderStructure();
        updateStatus(`Prepended "${value}".`, "success");
        return true;
      }
      if (mode === "insertAt") {
        const res = structure.insertAt(index, value);
        if (res?.error) {
          updateStatus(res.error, "error");
          return false;
        }
        renderOptions = { highlightIndices: [res.index] };
        renderStructure();
        updateStatus(`Inserted "${value}" at index ${res.index}.`, "success");
        return true;
      }
      structure.append(value);
      renderOptions = { highlightIndices: [structure.toArray().length - 1] };
      renderStructure();
      updateStatus(`Appended "${value}".`, "success");
      return true;
    }

    if (currentStructureKey === "bst") {
      const res = structure.insert(value);
      if (!res.inserted) {
        updateStatus(res.error || "Insert failed.", "error");
        return false;
      }
      renderOptions = { highlightValues: [value] };
      renderStructure();
      updateStatus(`Inserted "${value}".`, "success");
      return true;
    }

    if (currentStructureKey === "binaryheap") {
      const heap = structure;
      heap.insert(value);
      renderOptions = { highlightIndices: [0] };
      renderStructure();
      updateStatus(`Inserted "${value}".`, "success");
      return true;
    }

    return false;
  };

  const removeSingle = () => {
    const structure = getStructureInstance(currentStructureKey);

    if (currentStructureKey === "stack") {
      const removed = structure.remove();
      if (removed === null || removed === undefined) {
        updateStatus("Stack is empty.", "error");
        return;
      }
      renderOptions = {};
      renderStructure();
      updateStatus(`Popped "${removed}".`, "success");
      return;
    }

    if (currentStructureKey === "queue") {
      const removed = structure.dequeue();
      if (removed === null || removed === undefined) {
        updateStatus("Queue is empty.", "error");
        return;
      }
      renderOptions = { highlightIndices: [0] };
      renderStructure();
      updateStatus(`Dequeued "${removed}".`, "success");
      return;
    }

    if (currentStructureKey === "array") {
      const { index, error } = parseOptionalIndex(indexInput?.value);
      if (error) {
        updateStatus(error, "error");
        return;
      }
      const arr = structure.toArray();
      const idx = index === null ? arr.length - 1 : index;
      const res = structure.deleteAt(idx);
      if (res?.error) {
        updateStatus(res.error, "error");
        return;
      }
      renderOptions = { highlightIndices: [res.index] };
      renderStructure();
      updateStatus(`Deleted "${res.removed}" at index ${res.index}.`, "success");
      return;
    }

    if (currentStructureKey === "linkedlist") {
      const removed = structure.remove();
      if (removed === null || removed === undefined) {
        updateStatus("List is empty.", "error");
        return;
      }
      renderOptions = { highlightIndices: [0] };
      renderStructure();
      updateStatus(`Removed head "${removed}".`, "success");
      return;
    }

    if (currentStructureKey === "bst") {
      const rawInput = dataInput?.value || "";
      if (!rawInput.trim()) {
        updateStatus("Please enter a value to delete.", "error");
        return;
      }
      const parsed = parseNumericTokens(rawInput);
      if (parsed.error) {
        updateStatus(parsed.error, "error");
        return;
      }
      const value = parsed.values[0];
      const res = structure.delete(value);
      if (!res.deleted) {
        updateStatus(res.error || "Value not found.", "error");
        return;
      }
      dataInput.value = "";
      renderOptions = {};
      renderStructure();
      updateStatus(`Deleted "${value}".`, "success");
      return;
    }

    if (currentStructureKey === "binaryheap") {
      const res = structure.extract();
      if (res.value === null || res.value === undefined) {
        updateStatus("Heap is empty.", "error");
        return;
      }
      renderOptions = { highlightIndices: [0] };
      renderStructure();
      updateStatus(`Extracted "${res.value}".`, "success");
      return;
    }
  };

  const clearCurrentStructure = () => {
    const structure = getStructureInstance(currentStructureKey);
    structure.clear();
    renderOptions = {};
    renderStructure();
    updateStatus("Structure cleared.", "success");
  };

  const applyPayloadToStructure = (kind, payload) => {
    const def = getDefinition(kind);
    const structure = getStructureInstance(kind);
    if (!payload) return false;

    const values = normalizePayloadArray(payload);
    if (!values || !Array.isArray(values)) return false;
    const numeric = [];
    for (const v of values) {
      const str = String(v).trim();
      if (!numberPattern.test(str)) return false;
      numeric.push(parseFloat(str));
    }
    if (kind === "binaryheap" && payload && typeof payload === "object" && payload.mode) {
      structure.setMode?.(payload.mode);
    }
    return def.load(structure, { values: numeric, mode: payload?.mode });
  };

  const loadVisualizationFromStorage = () => {
    const stored = localStorage.getItem(SAVED_VIS_STORAGE_KEY);
    if (!stored) return false;
    localStorage.removeItem(SAVED_VIS_STORAGE_KEY);
    try {
      const saved = JSON.parse(stored);
      if (!saved?.kind || !saved.payload) return false;
      if (!applyPayloadToStructure(saved.kind, saved.payload)) return false;
      currentStructureKey = saved.kind;
      if (algorithmSelect) algorithmSelect.value = currentStructureKey;
      applyStructureContext(false);
      updateStatus(
        saved.name ? `Loaded "${saved.name}".` : "Loaded saved visualization.",
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
      savedStatus.textContent = "Log in to keep your visualizations saved.";
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
      const normalizedPayload = normalizePayloadArray(viz.payload) ?? viz.payload;
      payloadPreview.textContent = JSON.stringify(normalizedPayload);
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
    savedStatus.textContent = "Loading saved visualizations...";
    savedList.innerHTML = '<p class="text-sm text-gray-500">Loading visualizations...</p>';
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
      const applied = applyPayloadToStructure(entry.kind, entry.payload);
      if (!applied) {
        updateStatus("Could not load the saved visualization.", "error");
        return;
      }
      currentStructureKey = entry.kind;
      if (algorithmSelect) algorithmSelect.value = entry.kind;
      applyStructureContext(false);
      updateStatus(`Loaded "${entry.name}".`, "success");
    }

    if (action === "delete") {
      const confirmed = window.confirm("Delete this saved visualization?");
      if (!confirmed) return;
      try {
        await deleteSavedVisualization(entry.id);
        savedVisualizations = savedVisualizations.filter((item) => item.id !== entry.id);
        renderSavedVisualizations();
        updateStatus(`Deleted "${entry.name}".`, "success");
      } catch (error) {
        updateStatus(error.message, "error");
      }
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
        const heap = currentStructureKey === "binaryheap" ? getStructureInstance("binaryheap") : null;
        const modeText = heap ? ` (${heap.getMode?.() || "min"}-heap)` : "";
        saveStructureLabel.textContent = `Current structure: ${currentStructureKey.toUpperCase()}${modeText}`;
      }
    }
  };

  const handleSaveSubmit = async (event) => {
    event.preventDefault();
    if (!loggedInUser) {
      setSaveMessage("Please log in to save visualizations.", "error");
      return;
    }
    const valuesForSave = getCurrentValuesForSave(currentStructureKey, structures);
    if (!valuesForSave.length) {
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
        payload: valuesForSave,
      });
      setSaveMessage("Saved! View it below or in your profile.", "success");
      await refreshSavedVisualizations();
      setTimeout(() => {
        toggleSaveModal(false);
      }, 600);
    } catch (error) {
      setSaveMessage(error.message, "error");
    }
  };

  // Main button handlers
  insertBtn?.addEventListener("click", () => {
    const parsed = parseNumericTokens(dataInput?.value || "");
    if (parsed.error) {
      updateStatus(parsed.error, "error");
      return;
    }
    const { values } = parsed;

    const { index, error: indexError } = parseOptionalIndex(indexInput?.value);
    if (indexError) {
      updateStatus(indexError, "error");
      return;
    }

    if (values.length === 1) {
      dataInput.value = "";
      resetSequence(false);
      insertSingle(values[0], { index });
      return;
    }

    // Batch insert sequence
    const steps = [];
    if (currentStructureKey === "array") {
      steps.push(() => {
        getStructureInstance("array").clear();
        renderOptions = {};
        renderStructure();
        updateStatus("Array reset for batch insert.", "info");
      });
    }
    if (currentStructureKey === "bst") {
      steps.push(() => updateStatus("Inserting values into the tree...", "info"));
    }

    values.forEach((v, idx) => {
      steps.push(() => {
        const targetIndex = index !== null ? index + idx : null;
        const ok = insertSingle(v, { index: targetIndex });
        if (!ok) {
          resetSequence(false);
        }
      });
    });
    dataInput.value = "";
    startSequence(steps, { preserveScroll: false });
  });

  dataInput?.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      insertBtn?.click();
    }
  });

  removeBtn?.addEventListener("click", () => {
    resetSequence(false);
    renderOptions = {};
    removeSingle();
  });

  clearBtn?.addEventListener("click", () => {
    resetSequence(false);
    clearCurrentStructure();
  });

  autoplayBtn?.addEventListener("click", () => {
    if (!sequenceSteps.length || sequenceIndex >= sequenceSteps.length) {
      updateStatus("No sequence is queued yet.", "info");
      return;
    }
    if (isAutoPlaying) {
      isAutoPlaying = false;
      if (sequenceTimeout) {
        clearTimeout(sequenceTimeout);
        sequenceTimeout = null;
      }
      updateAutoplayBtn();
      updateStatus("Auto-play paused.", "info");
      return;
    }
    isAutoPlaying = true;
    updateAutoplayBtn();
    updateStatus("Auto-play resumed.", "success");
    runSequence();
  });

  if (speedSlider && speedValue) {
    speedSlider.addEventListener("input", (event) => {
      speedValue.textContent = event.target.value;
      if (isAutoPlaying) {
        updateStatus(`Animation speed set to ${event.target.value}%.`, "info");
      }
    });
  }

  saveStateBtn?.addEventListener("click", () => {
    if (!loggedInUser) {
      updateStatus("Please log in to save visualizations.", "error");
      return;
    }
    const valuesForSave = getCurrentValuesForSave(currentStructureKey, structures);
    if (!valuesForSave.length) {
      updateStatus("Nothing to save yet.", "error");
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

  // Extra controls delegation
  controlsExtra?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const action = button.getAttribute("data-action");
    const structure = getStructureInstance(currentStructureKey);

    if (action === "peek") {
      if (currentStructureKey === "stack") {
        const value = structure.peek();
        if (value === null) {
          updateStatus("Stack is empty.", "error");
          return;
        }
        renderOptions = {};
        renderStructure();
        updateStatus(`Top value is "${value}".`, "success");
        return;
      }
      if (currentStructureKey === "binaryheap") {
        const value = structure.peek();
        if (value === null) {
          updateStatus("Heap is empty.", "error");
          return;
        }
        renderOptions = { highlightIndices: [0] };
        renderStructure();
        updateStatus(`Root value is "${value}".`, "success");
        return;
      }
    }

    if (action === "peekFront" && currentStructureKey === "queue") {
      const value = structure.peekFront();
      if (value === null) {
        updateStatus("Queue is empty.", "error");
        return;
      }
      renderOptions = { highlightIndices: [0] };
      renderStructure();
      updateStatus(`Front value is "${value}".`, "success");
      return;
    }

    if (action === "peekRear" && currentStructureKey === "queue") {
      const value = structure.peekRear();
      if (value === null) {
        updateStatus("Queue is empty.", "error");
        return;
      }
      const idx = Math.max(0, structure.toArray().length - 1);
      renderOptions = { highlightIndices: [idx] };
      renderStructure();
      updateStatus(`Rear value is "${value}".`, "success");
      return;
    }

    if (action === "search") {
      const parsed = parseNumericTokens(dataInput?.value || "");
      if (parsed.error) {
        updateStatus(parsed.error, "error");
        return;
      }
      const needle = parsed.values[0];

      if (currentStructureKey === "array") {
        const res = structure.search(needle);
        highlightLinearSequence(res.visited, { foundIndex: res.foundIndex });
        updateStatus(
          res.foundIndex >= 0 ? `Found "${needle}" at index ${res.foundIndex}.` : `Value "${needle}" not found.`,
          res.foundIndex >= 0 ? "success" : "info",
        );
        return;
      }

      if (currentStructureKey === "linkedlist") {
        const res = structure.search(needle);
        highlightLinearSequence(res.visited, { foundIndex: res.index });
        updateStatus(
          res.found ? `Found "${needle}" at index ${res.index}.` : `Value "${needle}" not found.`,
          res.found ? "success" : "info",
        );
        return;
      }

      if (currentStructureKey === "bst") {
        const res = structure.search(needle);
        highlightValueSequence(res.path, { foundValue: res.found ? needle : null });
        updateStatus(
          res.found ? `Found "${needle}".` : `Value "${needle}" not found.`,
          res.found ? "success" : "info",
        );
        return;
      }
    }

    if (currentStructureKey === "linkedlist") {
      if (action === "prepend") {
        const parsed = parseNumericTokens(dataInput?.value || "");
        if (parsed.error) {
          updateStatus(parsed.error, "error");
          return;
        }
        const steps = parsed.values.map((v) => () => insertSingle(v, { mode: "prepend" }));
        dataInput.value = "";
        startSequence(steps, { preserveScroll: false });
        return;
      }

      if (action === "insertAt") {
        const parsed = parseNumericTokens(dataInput?.value || "");
        if (parsed.error) {
          updateStatus(parsed.error, "error");
          return;
        }
        const { index, error: idxError } = parseOptionalIndex(indexInput?.value);
        if (idxError || index === null) {
          updateStatus(idxError || "Index is required for insert at index.", "error");
          return;
        }
        const steps = parsed.values.map((v, offset) => () =>
          insertSingle(v, { index: index + offset, mode: "insertAt" }),
        );
        dataInput.value = "";
        startSequence(steps, { preserveScroll: false });
        return;
      }

      if (action === "deleteByValue") {
        const parsed = parseNumericTokens(dataInput?.value || "");
        if (parsed.error) {
          updateStatus(parsed.error, "error");
          return;
        }
        const value = parsed.values[0];
        const res = structure.deleteByValue(value);
        if (!res.deleted) {
          highlightLinearSequence(res.visited, { foundIndex: -1 });
          updateStatus(res.error || "Value not found.", "error");
          return;
        }
        const steps = res.visited.map((idx) => () => {
          renderOptions = { highlightIndices: [idx], preserveScroll: true };
          renderStructure();
        });
        steps.push(() => {
          renderOptions = {};
          renderStructure();
          updateStatus(`Deleted "${value}".`, "success");
        });
        startSequence(steps, { preserveScroll: true });
        return;
      }

      if (action === "deleteAt") {
        const { index, error } = parseOptionalIndex(indexInput?.value);
        if (error || index === null) {
          updateStatus(error || "Index is required for delete at index.", "error");
          return;
        }
        const res = structure.deleteAt(index);
        if (res?.error) {
          updateStatus(res.error, "error");
          return;
        }
        renderOptions = { highlightIndices: [res.index] };
        renderStructure();
        updateStatus(`Deleted "${res.removed}" at index ${res.index}.`, "success");
        return;
      }
    }

    if (currentStructureKey === "bst" && action === "traverse") {
      const order = button.getAttribute("data-order") || "in";
      const traversal = structure.traverse(order);
      if (!traversal.length) {
        updateStatus("Tree is empty.", "error");
        return;
      }
      const steps = traversal.map((v) => () => {
        renderOptions = { highlightValues: [v] };
        renderStructure();
      });
      const finalMessage = `${order}-order traversal result: [${traversal.join(", ")}].`;
      renderOptions = { ...renderOptions, keepStatusMessage: finalMessage };
      steps.push(() => {
        renderOptions = { preserveScroll: true };
        renderStructure();
        updateStatus(finalMessage, "success");
      });
      startSequence(steps, { preserveScroll: true });
      updateStatus(`Traversal started (${order}).`, "success");
      return;
    }
  });

  controlsExtra?.addEventListener("change", (event) => {
    const target = event.target;
    if (!target?.dataset?.action) return;
    const action = target.dataset.action;
    if (action === "heapMode" && currentStructureKey === "binaryheap") {
      const heap = getStructureInstance("binaryheap");
      heap.setMode(target.value);
      renderOptions = {};
      renderStructure();
      updateStatus(`Heap mode set to ${target.value}.`, "success");
    }
  });

  algorithmSelect?.addEventListener("change", (event) => {
    currentStructureKey = event.target.value;
    applyStructureContext(true);
  });

  const initAuthState = async () => {
    try {
      loggedInUser = await fetchCurrentUser();
    } catch (error) {
      console.warn("Unable to fetch current user.", error);
      loggedInUser = null;
    }
    await refreshSavedVisualizations();
  };

  // Init
  initAuthState();
  if (algorithmSelect) algorithmSelect.value = currentStructureKey;
  applyStructureContext(false);
  updateAutoplayBtn();

  const loadedFromStorage = loadVisualizationFromStorage();
  if (!loadedFromStorage) {
    updateStatus("Playground ready. Select a structure and start inserting values.", "info");
  }
});
