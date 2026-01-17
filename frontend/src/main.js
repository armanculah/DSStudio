// frontend/src/main.js
import "./style.css";
import { STRUCTURE_INFO, STRUCTURE_ORDER } from "./data/structureInfo.js";
import { API_ORIGIN, AUTH_BASE } from "./config.js";

const NAV_AVATAR_PLACEHOLDER = "/profile-placeholder.png";
const NAV_LOGGED_OUT_SELECTOR = "[data-nav-auth='logged-out']";
const NAV_LOGGED_IN_SELECTOR = "[data-nav-auth='logged-in']";

const resolveImageSrc = (path) => {
  if (!path) return NAV_AVATAR_PLACEHOLDER;
  if (path.startsWith("http")) return path;
  return `${API_ORIGIN}${path}`;
};

const setNavAuthState = (isLoggedIn) => {
  document
    .querySelectorAll(NAV_LOGGED_IN_SELECTOR)
    .forEach((el) => el.classList.toggle("hidden", !isLoggedIn));
  document
    .querySelectorAll(NAV_LOGGED_OUT_SELECTOR)
    .forEach((el) => el.classList.toggle("hidden", isLoggedIn));
};

const hydrateNavProfile = async () => {
  const navLinks = document.querySelectorAll("[data-nav-profile-link]");
  setNavAuthState(false);
  if (!navLinks.length) return;

  try {
    const res = await fetch(`${AUTH_BASE}/me`, { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json().catch(() => ({}));
    navLinks.forEach((link) => {
      const avatar = link.querySelector("[data-nav-profile-avatar]");
      const label = link.querySelector("[data-nav-profile-name]");
      if (avatar) {
        const pictureSrc = data.profile_picture_url || data.profile_picture;
        avatar.src = resolveImageSrc(pictureSrc);
      }
      if (label) {
        label.textContent = data.name || "Profile";
      }
    });
    setNavAuthState(true);
  } catch (error) {
    console.warn("Unable to load nav profile.", error);
  }
};

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

  // Landing page structure list
  const learnList = document.getElementById("structureLearnList");
  if (learnList) {
    const fragment = document.createDocumentFragment();
    STRUCTURE_ORDER.forEach((key) => {
      const info = STRUCTURE_INFO[key];
      if (!info) return;
      const item = document.createElement("li");
      item.className =
        "ds-card flex flex-col gap-3 border border-gray-200 shadow-sm";

      const header = document.createElement("div");
      header.className = "flex items-center justify-between gap-4";
      const title = document.createElement("h3");
      title.className = "text-lg font-semibold text-gray-900";
      title.textContent = info.label;
      header.appendChild(title);

      item.appendChild(header);

      const desc = document.createElement("p");
      desc.className = "text-sm text-gray-600";
      desc.textContent = info.description;
      item.appendChild(desc);

      const opsLabel = document.createElement("p");
      opsLabel.className = "text-sm font-semibold text-gray-800";
      opsLabel.textContent = "Core ideas:";
      item.appendChild(opsLabel);

      const opsList = document.createElement("ul");
      opsList.className = "text-sm text-gray-600 list-disc pl-5 space-y-1";
      info.operations.slice(0, 3).forEach((operation) => {
        const li = document.createElement("li");
        li.textContent = operation;
        opsList.appendChild(li);
      });
      item.appendChild(opsList);

      fragment.appendChild(item);
    });
    learnList.innerHTML = "";
    learnList.appendChild(fragment);
  }

  hydrateNavProfile();
});

// API health probe
(async () => {
  try {
    const r = await fetch("/api/v1/health");
    const j = await r.json();
    console.log("[api health]", j);
  } catch (e) {
    console.warn("API health check failed:", e);
  }
})();
