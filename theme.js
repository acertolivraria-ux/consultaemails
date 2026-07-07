/* =====================================
   THEME MANAGER
===================================== */

function aplicarTema(theme) {

  document.documentElement.setAttribute(
    "data-theme",
    theme
  );

  localStorage.setItem(
    "theme",
    theme
  );


  const botao =
    document.getElementById("themeToggle");


  if (botao) {

    botao.textContent =
      theme === "dark"
        ? "☀️"
        : "🌙";

  }

}


/* =====================================
   ALTERAR TEMA
===================================== */

function alternarTema() {


  const atual =
    document.documentElement.getAttribute(
      "data-theme"
    ) || "light";


  const novo =
    atual === "dark"
      ? "light"
      : "dark";


  aplicarTema(novo);

}


/* =====================================
   INICIALIZAÇÃO
===================================== */

export function initThemeToggle() {


  const botao =
    document.getElementById(
      "themeToggle"
    );


  const salvo =
    localStorage.getItem(
      "theme"
    ) || "light";


  aplicarTema(salvo);


  if (!botao)
    return;


  /*
    Evita adicionar o evento duas vezes
    caso a função seja chamada novamente.
  */

  if (
    botao.dataset.themeReady === "true"
  ) {
    return;
  }


  botao.dataset.themeReady = "true";


  botao.addEventListener(
    "click",
    alternarTema
  );

}


/* =====================================
   AUTO START
===================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initThemeToggle();

  }
);
