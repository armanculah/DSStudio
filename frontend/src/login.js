// frontend/src/login.js
import "./style.css";
import { API_BASE } from "./config.js";


function setMessage(el, text, isError = true) {
  if (!el) return;
  el.textContent = text || "";
  el.classList.remove("text-red-600", "text-green-600");
  el.classList.add(isError ? "text-red-600" : "text-green-600");
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMsg");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(msg, "");

    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
      setMessage(msg, "Please enter email and password.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send/receive auth cookie
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const detail = data.detail || data.error || "Login failed.";
        setMessage(msg, detail, true);
        return;
      }

      setMessage(msg, "Login successful, redirecting…", false);
      setTimeout(() => {
        window.location.href = "./profile.html";
      }, 600);
    } catch (err) {
      console.error(err);
      setMessage(msg, "Could not reach server. Is the backend running?");
    }
  });
});
