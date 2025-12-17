// frontend/src/visualizers/structures/linkedListVisualizer.js

const SVG_NS = "http://www.w3.org/2000/svg";
const PRIMARY_COLOR = "#15396a";
const ACCENT_LIGHT = "#f5efe1";
const ACCENT_COLOR = "#8f7a4e";
const MUTED_COLOR = "#6b7280";
const BASE_WIDTH = 1100;
const BASE_HEIGHT = 400;
const NODE_WIDTH = 90;
const NODE_HEIGHT = 60;
const GAP = 40;

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
  pattern.setAttribute("id", "list-grid");
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
  rect.setAttribute("fill", "url(#list-grid)");
  rect.setAttribute("stroke", "#e5e7eb");
  svg.appendChild(rect);
};

const drawPlaceholder = (svg, text) => {
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
  label.textContent = text;
  svg.appendChild(label);
};

const computeWidth = (count) => {
  if (count <= 0) return BASE_WIDTH;
  const totalNodesWidth = count * NODE_WIDTH + (count - 1) * GAP;
  return Math.max(BASE_WIDTH, totalNodesWidth + 220);
};

export function createLinkedListVisualizer() {
  const getPreferredCanvasSize = (values = []) => ({
    width: computeWidth(values.length),
    height: BASE_HEIGHT,
  });

  const render = (svg, values = []) => {
    if (!svg) return;
    const data = Array.isArray(values) ? values : [];
    if (!data.length) {
      drawPlaceholder(svg, "List is empty. Insert values to begin.");
      return;
    }

    const size = getPreferredCanvasSize(data);
    clearSvg(svg);
    applyDimensions(svg, size.width, size.height);
    drawBackground(svg, size.width, size.height);

    const totalWidth = data.length * NODE_WIDTH + (data.length - 1) * GAP;
    const startX = size.width / 2 - totalWidth / 2;
    const centerY = size.height / 2;

    data.forEach((value, index) => {
      const x = startX + index * (NODE_WIDTH + GAP);
      const y = centerY - NODE_HEIGHT / 2;

      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("x", String(x));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", String(NODE_WIDTH));
      rect.setAttribute("height", String(NODE_HEIGHT));
      rect.setAttribute("rx", "8");
      rect.setAttribute("ry", "8");
      rect.setAttribute("fill", index === 0 ? ACCENT_LIGHT : "#ffffff");
      rect.setAttribute("stroke", PRIMARY_COLOR);
      rect.setAttribute("stroke-width", "2");
      svg.appendChild(rect);

      const text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("x", String(x + NODE_WIDTH / 2));
      text.setAttribute("y", String(y + NODE_HEIGHT / 2 + 5));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", PRIMARY_COLOR);
      text.setAttribute("font-size", "18");
      text.setAttribute(
        "font-family",
        "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      );
      text.textContent = value;
      svg.appendChild(text);

      if (index < data.length - 1) {
        const arrowStartX = x + NODE_WIDTH;
        const arrowEndX = startX + (index + 1) * (NODE_WIDTH + GAP);

        const line = document.createElementNS(SVG_NS, "line");
        line.setAttribute("x1", String(arrowStartX + 6));
        line.setAttribute("y1", String(centerY));
        line.setAttribute("x2", String(arrowEndX - 6));
        line.setAttribute("y2", String(centerY));
        line.setAttribute("stroke", MUTED_COLOR);
        line.setAttribute("stroke-width", "2");
        svg.appendChild(line);

        const triangle = document.createElementNS(SVG_NS, "polygon");
        const sizeArrow = 6;
        triangle.setAttribute(
          "points",
          `${arrowEndX - 6},${centerY} ${arrowEndX - 6 - sizeArrow},${
            centerY - sizeArrow
          } ${arrowEndX - 6 - sizeArrow},${centerY + sizeArrow}`,
        );
        triangle.setAttribute("fill", MUTED_COLOR);
        svg.appendChild(triangle);
      }
    });

    const headLabel = document.createElementNS(SVG_NS, "text");
    headLabel.setAttribute("x", String(startX + NODE_WIDTH / 2));
    headLabel.setAttribute("y", String(centerY - NODE_HEIGHT / 2 - 28));
    headLabel.setAttribute("text-anchor", "middle");
    headLabel.setAttribute("fill", ACCENT_COLOR);
    headLabel.setAttribute("font-size", "14");
    headLabel.setAttribute(
      "font-family",
      "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    );
    headLabel.textContent = "HEAD";
    svg.appendChild(headLabel);

    const headArrow = document.createElementNS(SVG_NS, "line");
    headArrow.setAttribute("x1", String(startX + NODE_WIDTH / 2));
    headArrow.setAttribute("y1", String(centerY - NODE_HEIGHT / 2 - 22));
    headArrow.setAttribute("x2", String(startX + NODE_WIDTH / 2));
    headArrow.setAttribute("y2", String(centerY - NODE_HEIGHT / 2));
    headArrow.setAttribute("stroke", ACCENT_COLOR);
    headArrow.setAttribute("stroke-width", "2");
    svg.appendChild(headArrow);

    const nullX = startX + (data.length - 1) * (NODE_WIDTH + GAP) + NODE_WIDTH + 50;
    const nullText = document.createElementNS(SVG_NS, "text");
    nullText.setAttribute("x", String(nullX));
    nullText.setAttribute("y", String(centerY + 5));
    nullText.setAttribute("text-anchor", "middle");
    nullText.setAttribute("fill", MUTED_COLOR);
    nullText.setAttribute("font-size", "14");
    nullText.setAttribute(
      "font-family",
      "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    );
    nullText.textContent = "NULL";
    svg.appendChild(nullText);
  };

  const reset = (svg) => {
    if (!svg) return;
    drawPlaceholder(svg, "List cleared. Insert values to begin.");
  };

  return {
    render,
    reset,
    getPreferredCanvasSize,
  };
}
