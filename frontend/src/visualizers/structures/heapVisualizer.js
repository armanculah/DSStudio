// frontend/src/visualizers/structures/heapVisualizer.js

const SVG_NS = "http://www.w3.org/2000/svg";
const PRIMARY = "#15396a";
const ACCENT_LIGHT = "#f5efe1";
const ACCENT = "#8f7a4e";
const MUTED = "#6b7280";

const NODE_R = 18;
const LEVEL_Y = 75;
const MARGIN_X = 60;
const MARGIN_Y = 50;

const clearSvg = (svg) => {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
};

const applyDimensions = (svg, width, height) => {
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
};

const drawBackground = (svg, width, height, id = "heap-grid") => {
  const defs = document.createElementNS(SVG_NS, "defs");
  const pattern = document.createElementNS(SVG_NS, "pattern");
  pattern.setAttribute("id", id);
  pattern.setAttribute("width", "60");
  pattern.setAttribute("height", "60");
  pattern.setAttribute("patternUnits", "userSpaceOnUse");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", "M 60 0 L 0 0 0 60");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#eceff3");
  path.setAttribute("stroke-width", "1");
  pattern.appendChild(path);
  defs.appendChild(pattern);
  svg.appendChild(defs);

  const rect = document.createElementNS(SVG_NS, "rect");
  rect.setAttribute("width", String(width));
  rect.setAttribute("height", String(height));
  rect.setAttribute("fill", `url(#${id})`);
  rect.setAttribute("stroke", "#e5e7eb");
  svg.appendChild(rect);
};

const drawPlaceholder = (svg, message) => {
  clearSvg(svg);
  applyDimensions(svg, 1000, 600);
  drawBackground(svg, 1000, 600);
  const label = document.createElementNS(SVG_NS, "text");
  label.setAttribute("x", "500");
  label.setAttribute("y", "300");
  label.setAttribute("text-anchor", "middle");
  label.setAttribute("fill", "#9ca3af");
  label.setAttribute("font-size", "18");
  label.setAttribute(
    "font-family",
    "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  );
  label.textContent = message;
  svg.appendChild(label);
};

const positionForIndex = (index, maxDepth) => {
  const depth = Math.floor(Math.log2(index + 1));
  const levelStart = 2 ** depth - 1;
  const pos = index - levelStart;
  const nodesInLevel = 2 ** depth;
  const width = 2 ** maxDepth * 70;
  const gap = width / nodesInLevel;
  const x = MARGIN_X + gap / 2 + pos * gap;
  const y = MARGIN_Y + depth * LEVEL_Y;
  return { x, y, depth };
};

export function createHeapVisualizer() {
  const getPreferredCanvasSize = (values = []) => {
    const n = Array.isArray(values) ? values.length : 0;
    if (n <= 0) return { width: 1000, height: 600 };
    const maxDepth = Math.floor(Math.log2(n));
    const width = Math.max(1000, MARGIN_X * 2 + 2 ** maxDepth * 70 + 260);
    const height = Math.max(600, MARGIN_Y * 2 + (maxDepth + 1) * LEVEL_Y + 180);
    return { width, height };
  };

  const render = (svg, values = [], options = {}) => {
    if (!svg) return;
    const data = Array.isArray(values) ? values : [];
    if (!data.length) {
      drawPlaceholder(svg, "Heap is empty. Insert values to begin.");
      return;
    }

    const highlight = new Set(options.highlightIndices || []);
    const { width, height } = getPreferredCanvasSize(data);
    const maxDepth = Math.floor(Math.log2(data.length));
    clearSvg(svg);
    applyDimensions(svg, width, height);
    drawBackground(svg, width, height);

    const positions = data.map((_, idx) => positionForIndex(idx, maxDepth));

    // Edges
    data.forEach((_, idx) => {
      const left = idx * 2 + 1;
      const right = idx * 2 + 2;
      [left, right].forEach((child) => {
        if (child >= data.length) return;
        const line = document.createElementNS(SVG_NS, "line");
        line.setAttribute("x1", String(positions[idx].x));
        line.setAttribute("y1", String(positions[idx].y));
        line.setAttribute("x2", String(positions[child].x));
        line.setAttribute("y2", String(positions[child].y));
        line.setAttribute("stroke", MUTED);
        line.setAttribute("stroke-width", "2");
        svg.appendChild(line);
      });
    });

    // Nodes
    data.forEach((value, idx) => {
      const { x, y } = positions[idx];
      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("cx", String(x));
      circle.setAttribute("cy", String(y));
      circle.setAttribute("r", String(NODE_R));
      circle.setAttribute("fill", highlight.has(idx) ? ACCENT_LIGHT : "#ffffff");
      circle.setAttribute("stroke", idx === 0 ? ACCENT : PRIMARY);
      circle.setAttribute("stroke-width", idx === 0 ? "3" : "2");
      svg.appendChild(circle);

      const text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("x", String(x));
      text.setAttribute("y", String(y + 5));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", PRIMARY);
      text.setAttribute("font-size", "13");
      text.setAttribute(
        "font-family",
        "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      );
      text.textContent = String(value);
      svg.appendChild(text);
    });
  };

  return { render, getPreferredCanvasSize };
}

