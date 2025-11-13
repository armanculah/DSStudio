// frontend/src/signup.js
import "./style.css";

const API_BASE = "http://127.0.0.1:8000/api/v1";

function setMessage(el, text, isError = true) {
  if (!el) return;
  el.textContent = text || "";
  el.classList.remove("text-red-600", "text-green-600");
  el.classList.add(isError ? "text-red-600" : "text-green-600");
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  const msg = document.getElementById("signupMsg");
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

    if (password.length < 8) {
      setMessage(msg, "Password must be at least 8 characters.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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

      setMessage(msg, "Account created! Redirecting to login…", false);
      setTimeout(() => {
        window.location.href = "./login.html";
      }, 800);
    } catch (err) {
      console.error(err);
      setMessage(msg, "Could not reach server. Is the backend running?");
    }
  });
});
