// frontend/src/visualizers/structures/linkedListVisualizer.js

const SVG_NS = "http://www.w3.org/2000/svg";

export function createLinkedListVisualizer(svgElement) {
  const svg = svgElement;

  const clearSvg = () => {
    if (!svg) return;
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
  };

  const drawPlaceholder = (text) => {
    if (!svg) return;
    clearSvg();

    const bg = document.createElementNS(SVG_NS, "rect");
    bg.setAttribute("x", "0");
    bg.setAttribute("y", "0");
    bg.setAttribute("width", "1000");
    bg.setAttribute("height", "400");
    bg.setAttribute("fill", "#ffffff");
    bg.setAttribute("stroke", "#e5e7eb");
    svg.appendChild(bg);

    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("x", "500");
    label.setAttribute("y", "200");
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

  const renderList = (values) => {
    if (!svg) return;
    clearSvg();

    if (!values.length) {
      drawPlaceholder("List is empty. Insert values to begin.");
      return;
    }

    const width = 1000;
    const height = 400;

    const nodeWidth = 90;
    const nodeHeight = 60;
    const gap = 40;

    const totalWidth = values.length * nodeWidth + (values.length - 1) * gap;
    const startX = (width - totalWidth) / 2;
    const centerY = height / 2;

    // Draw nodes
    values.forEach((value, index) => {
      const x = startX + index * (nodeWidth + gap);
      const y = centerY - nodeHeight / 2;

      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", nodeWidth);
      rect.setAttribute("height", nodeHeight);
      rect.setAttribute("rx", "8");
      rect.setAttribute("ry", "8");
      rect.setAttribute("fill", index === 0 ? "#ecfeff" : "#ffffff"); // head highlighted
      rect.setAttribute("stroke", "#0ea5e9");
      rect.setAttribute("stroke-width", "2");
      svg.appendChild(rect);

      const text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("x", x + nodeWidth / 2);
      text.setAttribute("y", y + nodeHeight / 2 + 5);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", "#111827");
      text.setAttribute("font-size", "18");
      text.setAttribute(
        "font-family",
        "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      );
      text.textContent = value;
      svg.appendChild(text);
    });

    // Draw arrows between nodes
    for (let i = 0; i < values.length - 1; i += 1) {
      const fromX =
        startX + i * (nodeWidth + gap) + nodeWidth; // right edge of node i
      const toX = startX + (i + 1) * (nodeWidth + gap); // left edge of node i+1
      const y = centerY;

      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", fromX + 5);
      line.setAttribute("y1", y);
      line.setAttribute("x2", toX - 5);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", "#6b7280");
      line.setAttribute("stroke-width", "2");
      svg.appendChild(line);

      const arrow = document.createElementNS(SVG_NS, "polygon");
      const arrowSize = 6;
      arrow.setAttribute(
        "points",
        `${toX - 5},${y} ${toX - 5 - arrowSize},${y - arrowSize} ${
          toX - 5 - arrowSize
        },${y + arrowSize}`,
      );
      arrow.setAttribute("fill", "#6b7280");
      svg.appendChild(arrow);
    }

    // HEAD label above first node
    const headX = startX + nodeWidth / 2;
    const headY = centerY - nodeHeight / 2 - 30;

    const headText = document.createElementNS(SVG_NS, "text");
    headText.setAttribute("x", headX);
    headText.setAttribute("y", headY);
    headText.setAttribute("text-anchor", "middle");
    headText.setAttribute("fill", "#0f766e");
    headText.setAttribute("font-size", "14");
    headText.setAttribute(
      "font-family",
      "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    );
    headText.textContent = "HEAD";
    svg.appendChild(headText);

    const headArrow = document.createElementNS(SVG_NS, "line");
    headArrow.setAttribute("x1", headX);
    headArrow.setAttribute("y1", headY + 4);
    headArrow.setAttribute("x2", headX);
    headArrow.setAttribute("y2", centerY - nodeHeight / 2);
    headArrow.setAttribute("stroke", "#0f766e");
    headArrow.setAttribute("stroke-width", "2");
    svg.appendChild(headArrow);

    // NULL label after last node
    const lastX =
      startX + (values.length - 1) * (nodeWidth + gap) + nodeWidth + 40;

    const nullText = document.createElementNS(SVG_NS, "text");
    nullText.setAttribute("x", lastX);
    nullText.setAttribute("y", centerY + 4);
    nullText.setAttribute("text-anchor", "middle");
    nullText.setAttribute("fill", "#6b7280");
    nullText.setAttribute("font-size", "14");
    nullText.setAttribute(
      "font-family",
      "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    );
    nullText.textContent = "NULL";
    svg.appendChild(nullText);
  };

  return {
    render(values) {
      renderList(values);
    },
    reset() {
      drawPlaceholder("List cleared. Insert values to begin.");
    },
  };
}
