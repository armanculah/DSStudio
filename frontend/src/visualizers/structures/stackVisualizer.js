// frontend/src/visualizers/structures/stackVisualizer.js

const SVG_NS = "http://www.w3.org/2000/svg";
const PRIMARY_COLOR = "#15396a";
const PRIMARY_SOFT = "#1f4f8a";
const ACCENT_LIGHT = "#f5efe1";
const BASE_WIDTH = 1000;
const BASE_HEIGHT = 400;
const BOX_WIDTH = 90;
const BOX_HEIGHT = 60;
const GAP = 10;

const clearSvg = (svg) => {
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }
};

const applyDimensions = (svg, width, height) => {
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
};

const drawBackground = (svg, width, height) => {
  const defs = document.createElementNS(SVG_NS, "defs");
  const pattern = document.createElementNS(SVG_NS, "pattern");
  pattern.setAttribute("id", "grid-bg");
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
  rect.setAttribute("fill", "url(#grid-bg)");
  rect.setAttribute("stroke", "#e5e7eb");
  svg.appendChild(rect);
};

const drawPlaceholder = (svg, message) => {
  clearSvg(svg);
  applyDimensions(svg, BASE_WIDTH, BASE_HEIGHT);
  drawBackground(svg, BASE_WIDTH, BASE_HEIGHT);

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
  const totalWidth = count * BOX_WIDTH + (count - 1) * GAP;
  return Math.max(BASE_WIDTH, totalWidth + 200);
};

export function createStackVisualizer() {
  const getPreferredCanvasSize = (values = []) => ({
    width: computeWidth(values.length),
    height: BASE_HEIGHT,
  });

  const render = (svg, values = []) => {
    if (!svg) return;
    const data = Array.isArray(values) ? values : [];
    if (!data.length) {
      drawPlaceholder(svg, "Stack is empty. Push values to begin.");
      return;
    }

    const size = getPreferredCanvasSize(data);
    clearSvg(svg);
    applyDimensions(svg, size.width, size.height);
    drawBackground(svg, size.width, size.height);

    const startX =
      size.width / 2 -
      (data.length * BOX_WIDTH + (data.length - 1) * GAP) / 2;
    const centerY = size.height / 2;

    const baseline = document.createElementNS(SVG_NS, "line");
    baseline.setAttribute("x1", String(startX - 20));
    baseline.setAttribute("x2", String(startX + data.length * BOX_WIDTH + (data.length - 1) * GAP + 20));
    baseline.setAttribute("y1", String(centerY + BOX_HEIGHT / 2 + 12));
    baseline.setAttribute("y2", String(centerY + BOX_HEIGHT / 2 + 12));
    baseline.setAttribute("stroke", "#d1d5db");
    baseline.setAttribute("stroke-width", "2");
    svg.appendChild(baseline);

    data.forEach((value, index) => {
      const x = startX + index * (BOX_WIDTH + GAP);
      const y = centerY - BOX_HEIGHT / 2;

      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("x", String(x));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", String(BOX_WIDTH));
      rect.setAttribute("height", String(BOX_HEIGHT));
      rect.setAttribute("rx", "8");
      rect.setAttribute("ry", "8");
      rect.setAttribute(
        "fill",
        index === data.length - 1 ? ACCENT_LIGHT : "#ffffff",
      );
      rect.setAttribute("stroke", PRIMARY_COLOR);
      rect.setAttribute("stroke-width", "2");
      svg.appendChild(rect);

      const text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("x", String(x + BOX_WIDTH / 2));
      text.setAttribute("y", String(y + BOX_HEIGHT / 2 + 5));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", PRIMARY_COLOR);
      text.setAttribute("font-size", "18");
      text.setAttribute(
        "font-family",
        "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      );
      text.textContent = value;
      svg.appendChild(text);
    });

    const topIndex = data.length - 1;
    const topX = startX + topIndex * (BOX_WIDTH + GAP) + BOX_WIDTH / 2;
    const topY = centerY - BOX_HEIGHT / 2 - 28;

    const topLabel = document.createElementNS(SVG_NS, "text");
    topLabel.setAttribute("x", String(topX));
    topLabel.setAttribute("y", String(topY));
    topLabel.setAttribute("text-anchor", "middle");
    topLabel.setAttribute("fill", PRIMARY_SOFT);
    topLabel.setAttribute("font-size", "14");
    topLabel.setAttribute(
      "font-family",
      "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    );
    topLabel.textContent = "TOP";
    svg.appendChild(topLabel);

    const arrowLine = document.createElementNS(SVG_NS, "line");
    arrowLine.setAttribute("x1", String(topX));
    arrowLine.setAttribute("y1", String(topY + 4));
    arrowLine.setAttribute("x2", String(topX));
    arrowLine.setAttribute("y2", String(centerY - BOX_HEIGHT / 2));
    arrowLine.setAttribute("stroke", PRIMARY_SOFT);
    arrowLine.setAttribute("stroke-width", "2");
    svg.appendChild(arrowLine);

    const arrowHead = document.createElementNS(SVG_NS, "polygon");
    const arrowSize = 6;
    arrowHead.setAttribute(
      "points",
      `${topX - arrowSize},${centerY - BOX_HEIGHT / 2 - 2} ${topX + arrowSize},${
        centerY - BOX_HEIGHT / 2 - 2
      } ${topX},${centerY - BOX_HEIGHT / 2 + arrowSize}`,
    );
    arrowHead.setAttribute("fill", PRIMARY_SOFT);
    svg.appendChild(arrowHead);
  };

  const reset = (svg) => {
    if (!svg) return;
    drawPlaceholder(svg, "Stack cleared. Push values to begin.");
  };

  return {
    render,
    reset,
    getPreferredCanvasSize,
  };
}
