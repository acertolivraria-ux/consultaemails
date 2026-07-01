// theme.js

export function applySavedTheme() {
  const theme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", theme);
}

export function initThemeToggle(buttonId = "themeToggle") {
  const btn = document.getElementById(buttonId);

  if (!btn) return;

  const current = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", current);
  btn.textContent = current === "dark" ? "☀️" : "🌙";

  btn.addEventListener("click", () => {
    const actual = document.documentElement.getAttribute("data-theme");
    const next = actual === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);

    btn.textContent = next === "dark" ? "☀️" : "🌙";
  });
}
