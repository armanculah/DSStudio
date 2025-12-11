// frontend/src/signup.js
import "./style.css";
import { API_BASE } from "./config.js";

function setMessage(el, text, isError = true) {
  if (!el) return;
  el.textContent = text || "";
  el.classList.remove("text-red-600", "text-green-600");
  el.classList.add(isError ? "text-red-600" : "text-green-600");
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  const msg = document.getElementById("signupMsg");
  const nameInput = document.getElementById("name");
  const surnameInput = document.getElementById("surname");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(msg, "");

    const name = nameInput?.value.trim();
    const surname = surnameInput?.value.trim();
    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    if (!name || !surname || !email || !password) {
      setMessage(msg, "Please complete all fields.");
      return;
    }

    if (password.length < 8) {
      setMessage(msg, "Password must be at least 8 characters.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, surname, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const detail =
          data.detail ||
          data.error ||
          "Sign up failed. Maybe that email is already registered?";
        setMessage(msg, detail, true);
        return;
      }

      // Automatically log the user in after a successful signup.
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        setMessage(
          msg,
          "Account created, but automatic login failed. Please log in manually.",
          true,
        );
        setTimeout(() => {
          window.location.href = "./login.html";
        }, 1000);
        return;
      }

      setMessage(msg, "Account created! Redirecting to your profile…", false);
      setTimeout(() => {
        window.location.href = "./profile.html";
      }, 600);
    } catch (err) {
      console.error(err);
      setMessage(msg, "Could not reach server. Is the backend running?");
    }
  });
});
