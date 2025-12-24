// frontend/src/visualizers/structures/queueVisualizer.js

const SVG_NS = "http://www.w3.org/2000/svg";
const PRIMARY = "#15396a";
const PRIMARY_SOFT = "#1f4f8a";
const ACCENT_LIGHT = "#f5efe1";
const MUTED = "#6b7280";

const BASE_WIDTH = 1000;
const BASE_HEIGHT = 420;
const BOX_W = 90;
const BOX_H = 60;
const GAP = 12;

const clearSvg = (svg) => {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
};

const applyDimensions = (svg, width, height) => {
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
};

const drawGridBackground = (svg, width, height, id = "queue-grid") => {
  const defs = document.createElementNS(SVG_NS, "defs");
  const pattern = document.createElementNS(SVG_NS, "pattern");
  pattern.setAttribute("id", id);
  pattern.setAttribute("width", "50");
  pattern.setAttribute("height", "50");
  pattern.setAttribute("patternUnits", "userSpaceOnUse");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", "M 50 0 L 0 0 0 50");
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
  applyDimensions(svg, BASE_WIDTH, BASE_HEIGHT);
  drawGridBackground(svg, BASE_WIDTH, BASE_HEIGHT);
  const label = document.createElementNS(SVG_NS, "text");
  label.setAttribute("x", String(BASE_WIDTH / 2));
  label.setAttribute("y", String(BASE_HEIGHT / 2));
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

const computeWidth = (count) => {
  if (count <= 0) return BASE_WIDTH;
  const totalWidth = count * BOX_W + (count - 1) * GAP;
  return Math.max(BASE_WIDTH, totalWidth + 240);
};

export function createQueueVisualizer() {
  const getPreferredCanvasSize = (values = []) => ({
    width: computeWidth(values.length),
    height: BASE_HEIGHT,
  });

  const render = (svg, values = [], options = {}) => {
    if (!svg) return;
    const data = Array.isArray(values) ? values : [];
    if (!data.length) {
      drawPlaceholder(svg, "Queue is empty. Enqueue values to begin.");
      return;
    }

    const highlight = new Set(options.highlightIndices || []);
    const size = getPreferredCanvasSize(data);
    clearSvg(svg);
    applyDimensions(svg, size.width, size.height);
    drawGridBackground(svg, size.width, size.height);

    const total = data.length * BOX_W + (data.length - 1) * GAP;
    const startX = size.width / 2 - total / 2;
    const centerY = size.height / 2;

    data.forEach((value, index) => {
      const x = startX + index * (BOX_W + GAP);
      const y = centerY - BOX_H / 2;
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("x", String(x));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", String(BOX_W));
      rect.setAttribute("height", String(BOX_H));
      rect.setAttribute("rx", "8");
      rect.setAttribute("ry", "8");
      rect.setAttribute("fill", highlight.has(index) ? ACCENT_LIGHT : "#ffffff");
      rect.setAttribute("stroke", PRIMARY);
      rect.setAttribute("stroke-width", index === 0 || index === data.length - 1 ? "3" : "2");
      svg.appendChild(rect);

      const text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("x", String(x + BOX_W / 2));
      text.setAttribute("y", String(y + BOX_H / 2 + 5));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", PRIMARY);
      text.setAttribute("font-size", "18");
      text.setAttribute(
        "font-family",
        "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      );
      text.textContent = String(value);
      svg.appendChild(text);
    });

    const frontX = startX + BOX_W / 2;
    const rearX = startX + (data.length - 1) * (BOX_W + GAP) + BOX_W / 2;
    const labelY = centerY - BOX_H / 2 - 28;

    const frontLabel = document.createElementNS(SVG_NS, "text");
    frontLabel.setAttribute("x", String(frontX));
    frontLabel.setAttribute("y", String(labelY));
    frontLabel.setAttribute("text-anchor", "middle");
    frontLabel.setAttribute("fill", PRIMARY_SOFT);
    frontLabel.setAttribute("font-size", "14");
    frontLabel.setAttribute(
      "font-family",
      "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    );
    frontLabel.textContent = "FRONT";
    svg.appendChild(frontLabel);

    const rearLabel = document.createElementNS(SVG_NS, "text");
    rearLabel.setAttribute("x", String(rearX));
    rearLabel.setAttribute("y", String(labelY));
    rearLabel.setAttribute("text-anchor", "middle");
    rearLabel.setAttribute("fill", MUTED);
    rearLabel.setAttribute("font-size", "14");
    rearLabel.setAttribute(
      "font-family",
      "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    );
    rearLabel.textContent = "REAR";
    svg.appendChild(rearLabel);
  };

  return { render, getPreferredCanvasSize };
}

