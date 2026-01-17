// frontend/src/profile.js
import "./style.css";
import { API_ORIGIN, AUTH_BASE, PROFILE_BASE } from "./config.js";

const PLACEHOLDER_IMAGE = "/profile-placeholder.png";
const SAVED_VIS_STORAGE_KEY = "dss-saved-visualization";

const NOT_AVAILABLE = "Not provided yet";
const profileImage = document.getElementById("profileImage");
const userFullName = document.getElementById("userFullName");
const userEmail = document.getElementById("userEmail");
const detailName = document.getElementById("detailName");
const detailSurname = document.getElementById("detailSurname");
const detailEmail = document.getElementById("detailEmail");
const editProfileBtn = document.getElementById("editProfileBtn");
const settingsBtn = document.getElementById("settingsBtn");
const profileModal = document.getElementById("profileModal");
const settingsModal = document.getElementById("settingsModal");
const closeProfileModal = document.getElementById("closeProfileModal");
const closeSettingsModal = document.getElementById("closeSettingsModal");
const profileForm = document.getElementById("profileForm");
const nameInput = document.getElementById("formName");
const surnameInput = document.getElementById("formSurname");
const emailInput = document.getElementById("formEmail");
const passwordForm = document.getElementById("passwordForm");
const currentPasswordInput = document.getElementById("currentPassword");
const newPasswordInput = document.getElementById("newPassword");
const profileMessage = document.getElementById("profileMessage");
const passwordMessage = document.getElementById("passwordMessage");
const savedExamplesList = document.getElementById("savedExamplesList");
const exampleCount = document.getElementById("exampleCount");
const changePictureBtn = document.getElementById("changePictureBtn");
const profilePictureInput = document.getElementById("profilePictureInput");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");
const logoutBtn = document.getElementById("logoutBtn");

const state = {
  user: null,
};

function setStatus(element, message, type = "info") {
  if (!element) return;
  element.textContent = message || "";
  element.classList.remove("text-gray-500", "text-green-600", "text-red-600");
  if (!message) {
    element.classList.add("text-gray-500");
    return;
  }
  const color =
    type === "error" ? "text-red-600" : type === "success" ? "text-green-600" : "text-gray-500";
  element.classList.add(color);
}

function toggleModal(modal, show) {
  if (!modal) return;
  modal.classList.toggle("hidden", !show);
  document.body.classList.toggle("overflow-hidden", show);
}

function formatDate(value) {
  if (!value) return NOT_AVAILABLE;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function resolveImageSrc(url) {
  if (!url) return PLACEHOLDER_IMAGE;
  if (url.startsWith("http")) return url;
  return `${API_ORIGIN}${url}`;
}

function renderSavedVisualizations(visualizations) {
  if (!savedExamplesList || !exampleCount) return;
  exampleCount.textContent = `${visualizations.length} saved`;

  savedExamplesList.innerHTML = "";

  if (!visualizations.length) {
    savedExamplesList.innerHTML =
      '<p class="text-sm text-gray-500 md:col-span-2">No saved visualizations yet. Save one from the playground to see it listed here.</p>';
    return;
  }

  visualizations.forEach((viz) => {
    const item = document.createElement("div");
    item.className =
      "p-4 border border-gray-200 rounded-xl bg-white flex flex-col gap-3 shadow-sm";

    const header = document.createElement("div");
    header.className = "flex items-center justify-between";

    const info = document.createElement("div");
    const title = document.createElement("p");
    title.className = "font-semibold text-gray-900";
    title.textContent = viz.name;
    info.appendChild(title);

    const meta = document.createElement("p");
    meta.className = "text-sm text-gray-500";
    const kindLabel = (viz.kind || "structure").toUpperCase();
    meta.textContent = `${kindLabel} • Saved ${formatDate(viz.created_at)}`;
    info.appendChild(meta);
    header.appendChild(info);

    const badge = document.createElement("span");
    badge.className = "ds-tag";
    badge.textContent = viz.kind || "structure";
    header.appendChild(badge);
    item.appendChild(header);

    const normalizePayload = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (payload && typeof payload === "object") {
        if (Array.isArray(payload.values)) return payload.values;
        if (payload.tree && typeof payload.tree === "object") {
          const collected = [];
          const walk = (node) => {
            if (!node) return;
            collected.push(node.value);
            walk(node.left);
            walk(node.right);
          };
          walk(payload.tree);
          if (collected.length) return collected;
        }
      }
      return payload;
    };

    const payloadPreview = document.createElement("code");
    payloadPreview.className =
      "text-xs text-gray-600 bg-gray-100 rounded px-2 py-1 overflow-x-auto";
    payloadPreview.textContent = JSON.stringify(normalizePayload(viz.payload));
    item.appendChild(payloadPreview);

    const actions = document.createElement("div");
    actions.className = "flex justify-end gap-2";

    const loadBtn = document.createElement("button");
    loadBtn.className = "ds-btn ds-btn-primary text-sm px-3 py-1 load-saved-btn";
    loadBtn.textContent = "Load in playground";
    loadBtn.dataset.id = viz.id;
    actions.appendChild(loadBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.className =
      "ds-btn ds-btn-secondary text-sm px-3 py-1 delete-saved-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.dataset.id = viz.id;
    actions.appendChild(deleteBtn);

    item.appendChild(actions);

    savedExamplesList.appendChild(item);
  });
}

function renderProfile(user) {
  if (!user) return;
  state.user = user;
  const fullName = [user.name, user.surname].filter(Boolean).join(" ").trim() || "Unnamed learner";
  if (userFullName) userFullName.textContent = fullName;
  if (userEmail) userEmail.textContent = user.email || NOT_AVAILABLE;
  if (detailName) detailName.textContent = user.name || NOT_AVAILABLE;
  if (detailSurname) detailSurname.textContent = user.surname || NOT_AVAILABLE;
  if (detailEmail) detailEmail.textContent = user.email || NOT_AVAILABLE;
  if (profileImage) profileImage.src = resolveImageSrc(user.profile_picture_url);
  if (nameInput) nameInput.value = user.name || "";
  if (surnameInput) surnameInput.value = user.surname || "";
  if (emailInput) emailInput.value = user.email || "";
  renderSavedVisualizations(user.saved_visualizations || []);
}

async function fetchProfile() {
  try {
    const authRes = await fetch(`${AUTH_BASE}/me`, { credentials: "include" });
    if (authRes.status === 401) {
      window.location.href = "./login.html";
      return;
    }
    if (!authRes.ok) {
      throw new Error("Failed to verify login status.");
    }

    const res = await fetch(`${PROFILE_BASE}/me`, { credentials: "include" });
    if (res.status === 401) {
      window.location.href = "./login.html";
      return;
    }
    if (!res.ok) {
      throw new Error("Failed to load profile");
    }
    const data = await res.json();
    renderProfile(data);
  } catch (error) {
    console.error(error);
    setStatus(profileMessage, "Unable to load profile. Please log in again.", "error");
  }
}

async function submitProfileUpdate(event) {
  event.preventDefault();
  if (!nameInput || !surnameInput || !emailInput) return;
  const payload = {
    name: nameInput.value.trim(),
    surname: surnameInput.value.trim(),
    email: emailInput.value.trim(),
  };

  try {
    const res = await fetch(`${PROFILE_BASE}/me`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || data.error || "Could not update profile.");
    }
    renderProfile(data);
    toggleModal(profileModal, false);
    setStatus(profileMessage, "Profile updated successfully.", "success");
  } catch (error) {
    console.error(error);
    setStatus(profileMessage, error.message, "error");
  }
}

async function submitPasswordUpdate(event) {
  event.preventDefault();
  if (!currentPasswordInput || !newPasswordInput) return;
  const payload = {
    current_password: currentPasswordInput.value,
    new_password: newPasswordInput.value,
  };

  try {
    const res = await fetch(`${PROFILE_BASE}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || data.error || "Could not update password.");
    }
    currentPasswordInput.value = "";
    newPasswordInput.value = "";
    setStatus(passwordMessage, "Password updated.", "success");
  } catch (error) {
    console.error(error);
    setStatus(passwordMessage, error.message, "error");
  }
}

async function uploadProfilePicture(file) {
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    setStatus(profileMessage, "File is too large. Please use a file under 5MB.", "error");
    return;
  }
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${PROFILE_BASE}/profile-picture`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || data.error || "Could not upload profile picture.");
    }
    renderProfile(data);
    setStatus(profileMessage, "Profile picture updated.", "success");
  } catch (error) {
    console.error(error);
    setStatus(profileMessage, error.message, "error");
  } finally {
    if (profilePictureInput) profilePictureInput.value = "";
  }
}

async function deleteAccount() {
  const confirmed = window.confirm(
    "Are you sure you want to delete your account? This cannot be undone."
  );
  if (!confirmed) return;

  try {
    const res = await fetch(`${PROFILE_BASE}/me`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || data.error || "Could not delete account.");
    }
    setStatus(profileMessage, "Account deleted. Redirecting…", "success");
    setTimeout(() => {
      window.location.href = "./signup.html";
    }, 800);
  } catch (error) {
    console.error(error);
    setStatus(profileMessage, error.message, "error");
  }
}

async function refreshSavedVisualizations() {
  try {
    const res = await fetch(`${PROFILE_BASE}/me/saved-visualizations`, {
      credentials: "include",
    });
    if (res.status === 401) {
      window.location.href = "./login.html";
      return;
    }
    if (!res.ok) {
      throw new Error("Unable to load saved visualizations.");
    }
    const data = await res.json();
    state.user.saved_visualizations = data;
    renderSavedVisualizations(data);
  } catch (error) {
    console.error(error);
    setStatus(profileMessage, error.message, "error");
  }
}

async function deleteSavedVisualization(id) {
  if (!id) return;
  const confirmed = window.confirm("Delete this saved visualization?");
  if (!confirmed) return;

  try {
    const res = await fetch(`${PROFILE_BASE}/me/saved-visualizations/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.status === 401) {
      window.location.href = "./login.html";
      return;
    }
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || data.error || "Unable to delete entry.");
    }
    await refreshSavedVisualizations();
  } catch (error) {
    console.error(error);
    setStatus(profileMessage, error.message, "error");
  }
}

function queueVisualizationForPlayground(entry) {
  const normalizePayload = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === "object") {
      if (Array.isArray(payload.values)) return payload.values;
      if (payload.tree && typeof payload.tree === "object") {
        const collected = [];
        const walk = (node) => {
          if (!node) return;
          collected.push(node.value);
          walk(node.left);
          walk(node.right);
        };
        walk(payload.tree);
        if (collected.length) return collected;
      }
    }
    return payload;
  };
  try {
    localStorage.setItem(
      SAVED_VIS_STORAGE_KEY,
      JSON.stringify({
        id: entry.id,
        name: entry.name,
        kind: entry.kind,
        payload: normalizePayload(entry.payload),
      }),
    );
    window.location.href = "./playground.html";
  } catch (error) {
    console.error(error);
    setStatus(profileMessage, "Unable to launch saved visualization.", "error");
  }
}

function loadVisualizationInPlayground(id) {
  const vizId = Number(id);
  if (Number.isNaN(vizId)) {
    setStatus(profileMessage, "Invalid visualization selected.", "error");
    return;
  }
  const entry = state.user?.saved_visualizations?.find(
    (viz) => viz.id === vizId,
  );
  if (!entry) {
    setStatus(profileMessage, "Visualization not found in your list.", "error");
    return;
  }
  queueVisualizationForPlayground(entry);
}

async function handleLogout() {
  try {
    const res = await fetch(`${AUTH_BASE}/logout`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || data.error || "Logout failed.");
    }
    setStatus(profileMessage, "Logged out. Redirecting…", "success");
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 600);
  } catch (error) {
    console.error(error);
    setStatus(profileMessage, error.message, "error");
  }
}

function bindEvents() {
  editProfileBtn?.addEventListener("click", () => toggleModal(profileModal, true));
  settingsBtn?.addEventListener("click", () => toggleModal(settingsModal, true));
  closeProfileModal?.addEventListener("click", () => toggleModal(profileModal, false));
  closeSettingsModal?.addEventListener("click", () => toggleModal(settingsModal, false));
  profileModal?.addEventListener("click", (event) => {
    if (event.target === profileModal) toggleModal(profileModal, false);
  });
  settingsModal?.addEventListener("click", (event) => {
    if (event.target === settingsModal) toggleModal(settingsModal, false);
  });
  profileForm?.addEventListener("submit", submitProfileUpdate);
  passwordForm?.addEventListener("submit", submitPasswordUpdate);
  changePictureBtn?.addEventListener("click", () => profilePictureInput?.click());
  profilePictureInput?.addEventListener("change", (event) => {
    const [file] = event.target.files || [];
    uploadProfilePicture(file);
  });
  deleteAccountBtn?.addEventListener("click", deleteAccount);
  logoutBtn?.addEventListener("click", handleLogout);
  savedExamplesList?.addEventListener("click", (event) => {
    const target = event.target;
    if (target?.classList?.contains("delete-saved-btn")) {
      const entryId = target.dataset.id;
      deleteSavedVisualization(entryId);
      return;
    }
    if (target?.classList?.contains("load-saved-btn")) {
      const entryId = target.dataset.id;
      loadVisualizationInPlayground(entryId);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  fetchProfile();
});
