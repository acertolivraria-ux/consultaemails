/* =====================================
   THEME (DARK / LIGHT)
===================================== */

function applyTheme(theme) {

  document.documentElement.setAttribute("data-theme", theme);

  localStorage.setItem("theme", theme);

  const btn = document.getElementById("themeToggle");

  if (btn) {
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
  }

}

function toggleTheme() {

  const atual =
    document.documentElement.getAttribute("data-theme") || "light";

  const novo =
    atual === "dark"
      ? "light"
      : "dark";

  applyTheme(novo);

}

export function initThemeToggle(buttonId = "themeToggle") {

  const btn = document.getElementById(buttonId);

  if (!btn) return;

  const salvo =
    localStorage.getItem("theme") || "light";

  applyTheme(salvo);

  btn.addEventListener("click", toggleTheme);

}

/* =====================================
   INICIALIZA AUTOMATICAMENTE
===================================== */

document.addEventListener("DOMContentLoaded", () => {

  initThemeToggle();

});
