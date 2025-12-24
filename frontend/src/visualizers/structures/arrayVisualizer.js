// frontend/src/visualizers/structures/arrayVisualizer.js

const SVG_NS = "http://www.w3.org/2000/svg";
const PRIMARY = "#15396a";
const ACCENT_LIGHT = "#f5efe1";
const MUTED = "#6b7280";
const GRID_STROKE = "#eceff3";

const BASE_HEIGHT = 420;
const CELL_W = 86;
const CELL_H = 56;
const GAP = 10;

const clearSvg = (svg) => {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
};

const applyDimensions = (svg, width, height) => {
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
};

const drawGridBackground = (svg, width, height, id = "array-grid") => {
  const defs = document.createElementNS(SVG_NS, "defs");
  const pattern = document.createElementNS(SVG_NS, "pattern");
  pattern.setAttribute("id", id);
  pattern.setAttribute("width", "50");
  pattern.setAttribute("height", "50");
  pattern.setAttribute("patternUnits", "userSpaceOnUse");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", "M 50 0 L 0 0 0 50");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", GRID_STROKE);
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
  applyDimensions(svg, 1000, BASE_HEIGHT);
  drawGridBackground(svg, 1000, BASE_HEIGHT);
  const text = document.createElementNS(SVG_NS, "text");
  text.setAttribute("x", "500");
  text.setAttribute("y", String(BASE_HEIGHT / 2));
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("fill", "#9ca3af");
  text.setAttribute("font-size", "18");
  text.setAttribute(
    "font-family",
    "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  );
  text.textContent = message;
  svg.appendChild(text);
};

const computeWidth = (count) => {
  if (count <= 0) return 1000;
  const total = count * CELL_W + (count - 1) * GAP;
  return Math.max(1000, total + 220);
};

export function createArrayVisualizer() {
  const getPreferredCanvasSize = (values = []) => ({
    width: computeWidth(values.length),
    height: BASE_HEIGHT,
  });

  const render = (svg, values = [], options = {}) => {
    if (!svg) return;
    const data = Array.isArray(values) ? values : [];
    if (!data.length) {
      drawPlaceholder(svg, "Array is empty. Insert values to begin.");
      return;
    }

    const highlight = new Set(options.highlightIndices || []);
    const foundIndex =
      typeof options.foundIndex === "number" ? options.foundIndex : null;

    const size = getPreferredCanvasSize(data);
    clearSvg(svg);
    applyDimensions(svg, size.width, size.height);
    drawGridBackground(svg, size.width, size.height);

    const total = data.length * CELL_W + (data.length - 1) * GAP;
    const startX = size.width / 2 - total / 2;
    const centerY = size.height / 2 - 10;

    data.forEach((value, index) => {
      const x = startX + index * (CELL_W + GAP);
      const y = centerY - CELL_H / 2;

      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("x", String(x));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", String(CELL_W));
      rect.setAttribute("height", String(CELL_H));
      rect.setAttribute("rx", "10");
      rect.setAttribute("ry", "10");
      const isFound = foundIndex === index;
      rect.setAttribute(
        "fill",
        isFound ? "rgba(143, 122, 78, 0.18)" : highlight.has(index) ? ACCENT_LIGHT : "#ffffff",
      );
      rect.setAttribute("stroke", PRIMARY);
      rect.setAttribute("stroke-width", isFound ? "3" : "2");
      svg.appendChild(rect);

      const text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("x", String(x + CELL_W / 2));
      text.setAttribute("y", String(y + CELL_H / 2 + 6));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", PRIMARY);
      text.setAttribute("font-size", "18");
      text.setAttribute(
        "font-family",
        "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      );
      text.textContent = String(value);
      svg.appendChild(text);

      const indexLabel = document.createElementNS(SVG_NS, "text");
      indexLabel.setAttribute("x", String(x + CELL_W / 2));
      indexLabel.setAttribute("y", String(y + CELL_H + 24));
      indexLabel.setAttribute("text-anchor", "middle");
      indexLabel.setAttribute("fill", MUTED);
      indexLabel.setAttribute("font-size", "12");
      indexLabel.setAttribute(
        "font-family",
        "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      );
      indexLabel.textContent = String(index);
      svg.appendChild(indexLabel);
    });
  };

  return { render, getPreferredCanvasSize };
}

