// frontend/src/services/api.js
import { AUTH_BASE, PROFILE_BASE } from "../config.js";

const defaultOptions = {
  credentials: "include",
};

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return {};
  }
};

export async function fetchCurrentUser() {
  const response = await fetch(`${AUTH_BASE}/me`, defaultOptions);
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Unable to fetch current user.");
  }
  return response.json();
}

export async function fetchSavedVisualizations() {
  const response = await fetch(
    `${PROFILE_BASE}/me/saved-visualizations`,
    defaultOptions,
  );
  if (response.status === 401) {
    const error = new Error("Not authenticated.");
    error.status = 401;
    throw error;
  }
  if (!response.ok) {
    throw new Error("Unable to load saved visualizations.");
  }
  return response.json();
}

export async function createSavedVisualization(payload) {
  const response = await fetch(`${PROFILE_BASE}/me/saved-visualizations`, {
    ...defaultOptions,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJson(response);
  if (response.status === 401) {
    const error = new Error("Please log in to save visualizations.");
    error.status = 401;
    throw error;
  }
  if (!response.ok) {
    throw new Error(data.detail || data.error || "Unable to save visualization.");
  }
  return data;
}

export async function deleteSavedVisualization(id) {
  const response = await fetch(
    `${PROFILE_BASE}/me/saved-visualizations/${id}`,
    {
      ...defaultOptions,
      method: "DELETE",
    },
  );
  if (response.status === 401) {
    const error = new Error("Please log in to manage visualizations.");
    error.status = 401;
    throw error;
  }
  if (!response.ok && response.status !== 204) {
    const data = await parseJson(response);
    throw new Error(data.detail || data.error || "Unable to delete visualization.");
  }
  return true;
}
