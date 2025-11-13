// frontend/src/visualizers/structures/stackVisualizer.js

const SVG_NS = "http://www.w3.org/2000/svg";

export function createStackVisualizer(svgElement) {
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

  const renderStack = (values) => {
    if (!svg) return;
    clearSvg();

    if (!values.length) {
      drawPlaceholder("Stack is empty. Push values to begin.");
      return;
    }

    const width = 1000;
    const height = 400;
    const boxWidth = 90;
    const boxHeight = 60;
    const gap = 10;

    const totalWidth = values.length * boxWidth + (values.length - 1) * gap;
    const startX = (width - totalWidth) / 2;
    const centerY = height / 2;

    // baseline under stack
    const baseline = document.createElementNS(SVG_NS, "line");
    baseline.setAttribute("x1", startX - 20);
    baseline.setAttribute("y1", centerY + boxHeight / 2 + 10);
    baseline.setAttribute("x2", startX + totalWidth + 20);
    baseline.setAttribute("y2", centerY + boxHeight / 2 + 10);
    baseline.setAttribute("stroke", "#d1d5db");
    baseline.setAttribute("stroke-width", "2");
    svg.appendChild(baseline);

    values.forEach((value, index) => {
      const x = startX + index * (boxWidth + gap);
      const y = centerY - boxHeight / 2;

      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", boxWidth);
      rect.setAttribute("height", boxHeight);
      rect.setAttribute("rx", "8");
      rect.setAttribute("ry", "8");
      rect.setAttribute(
        "fill",
        index === values.length - 1 ? "#ede9fe" : "#ffffff",
      );
      rect.setAttribute("stroke", "#7c3aed");
      rect.setAttribute("stroke-width", "2");
      svg.appendChild(rect);

      const text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("x", x + boxWidth / 2);
      text.setAttribute("y", y + boxHeight / 2 + 5);
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

    // TOP annotation on the last element
    const topIndex = values.length - 1;
    const topX = startX + topIndex * (boxWidth + gap) + boxWidth / 2;
    const topY = centerY - boxHeight / 2 - 30;

    const topText = document.createElementNS(SVG_NS, "text");
    topText.setAttribute("x", topX);
    topText.setAttribute("y", topY);
    topText.setAttribute("text-anchor", "middle");
    topText.setAttribute("fill", "#4b5563");
    topText.setAttribute("font-size", "14");
    topText.setAttribute(
      "font-family",
      "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    );
    topText.textContent = "TOP";
    svg.appendChild(topText);

    const arrow = document.createElementNS(SVG_NS, "line");
    arrow.setAttribute("x1", topX);
    arrow.setAttribute("y1", topY + 4);
    arrow.setAttribute("x2", topX);
    arrow.setAttribute("y2", centerY - boxHeight / 2);
    arrow.setAttribute("stroke", "#4b5563");
    arrow.setAttribute("stroke-width", "2");
    arrow.setAttribute("marker-end", "url(#arrowhead)");
    svg.appendChild(arrow);
  };

  // Optionally you can add markers for arrows later, or move to D3.

  return {
    render(values) {
      renderStack(values);
    },
    reset() {
      drawPlaceholder("Stack cleared. Push values to begin.");
    },
  };
}
