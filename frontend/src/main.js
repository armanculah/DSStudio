// frontend/src/main.js
import "./style.css";

// Shared functionality across pages
document.addEventListener("DOMContentLoaded", () => {
  // Speed slider functionality for playground
  const speedSlider = document.getElementById("speedSlider");
  const speedValue = document.getElementById("speedValue");

  if (speedSlider && speedValue) {
    speedSlider.addEventListener("input", (e) => {
      speedValue.textContent = e.target.value;
    });
  }

  // Simple form focus improvements
  const inputs = document.querySelectorAll(".ds-input");
  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      input.parentElement?.classList.add("focused");
    });

    input.addEventListener("blur", () => {
      input.parentElement?.classList.remove("focused");
    });
  });
});

// API health probe
(async () => {
  try {
    const r = await fetch("http://127.0.0.1:8000/api/v1/health");
    const j = await r.json();
    console.log("[api health]", j);
  } catch (e) {
    console.warn("API health check failed:", e);
  }
})();
