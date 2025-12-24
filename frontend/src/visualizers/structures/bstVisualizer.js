// frontend/src/visualizers/structures/bstVisualizer.js

const SVG_NS = "http://www.w3.org/2000/svg";
const PRIMARY = "#15396a";
const ACCENT_LIGHT = "#f5efe1";
const ACCENT = "#8f7a4e";
const MUTED = "#6b7280";

const NODE_R = 20;
const LEVEL_Y = 80;
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

const drawBackground = (svg, width, height, id = "bst-grid") => {
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

const layoutInorder = (root) => {
  const nodes = [];
  const edges = [];
  let index = 0;

  const walk = (node, depth, parent) => {
    if (!node) return;
    walk(node.left, depth + 1, node);
    const x = MARGIN_X + index * 70;
    const y = MARGIN_Y + depth * LEVEL_Y;
    nodes.push({ node, x, y, depth });
    index += 1;
    if (parent) edges.push({ from: parent, to: node });
    walk(node.right, depth + 1, node);
  };

  walk(root, 0, null);
  const maxDepth = nodes.reduce((acc, n) => Math.max(acc, n.depth), 0);
  const width = Math.max(1000, MARGIN_X * 2 + Math.max(1, index - 1) * 70 + 200);
  const height = Math.max(600, MARGIN_Y * 2 + (maxDepth + 1) * LEVEL_Y + 120);

  const positionMap = new Map();
  nodes.forEach((entry) => positionMap.set(entry.node, entry));
  const resolvedEdges = edges
    .map((edge) => ({
      from: positionMap.get(edge.from),
      to: positionMap.get(edge.to),
    }))
    .filter((edge) => edge.from && edge.to);

  return { nodes, edges: resolvedEdges, width, height };
};

export function createBstVisualizer() {
  const getPreferredCanvasSize = (root) => {
    if (!root) return { width: 1000, height: 600 };
    const layout = layoutInorder(root);
    return { width: layout.width, height: layout.height };
  };

  const render = (svg, root, options = {}) => {
    if (!svg) return;
    if (!root) {
      drawPlaceholder(svg, "Tree is empty. Insert values to begin.");
      return;
    }

    const highlightValues = new Set(options.highlightValues || []);
    const foundValue =
      typeof options.foundValue === "number" ? options.foundValue : null;

    const { nodes, edges, width, height } = layoutInorder(root);
    clearSvg(svg);
    applyDimensions(svg, width, height);
    drawBackground(svg, width, height);

    edges.forEach((edge) => {
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", String(edge.from.x));
      line.setAttribute("y1", String(edge.from.y));
      line.setAttribute("x2", String(edge.to.x));
      line.setAttribute("y2", String(edge.to.y));
      line.setAttribute("stroke", MUTED);
      line.setAttribute("stroke-width", "2");
      svg.appendChild(line);
    });

    nodes.forEach(({ node, x, y }) => {
      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("cx", String(x));
      circle.setAttribute("cy", String(y));
      circle.setAttribute("r", String(NODE_R));
      const isFound = foundValue === node.value;
      const isHighlight = highlightValues.has(node.value);
      circle.setAttribute(
        "fill",
        isFound ? "rgba(143, 122, 78, 0.22)" : isHighlight ? ACCENT_LIGHT : "#ffffff",
      );
      circle.setAttribute("stroke", isFound ? ACCENT : PRIMARY);
      circle.setAttribute("stroke-width", isFound ? "3" : "2");
      svg.appendChild(circle);

      const text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("x", String(x));
      text.setAttribute("y", String(y + 6));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", PRIMARY);
      text.setAttribute("font-size", "14");
      text.setAttribute(
        "font-family",
        "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      );
      text.textContent = String(node.value);
      svg.appendChild(text);
    });
  };

  return { render, getPreferredCanvasSize };
}

