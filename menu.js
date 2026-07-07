import { auth } from "./firebase-config.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

/* =====================================
   CONFIGURAÇÃO
===================================== */

const ADMIN_EMAIL = "acertoscentralizados@gmail.com";

/* =====================================
   ELEMENTOS
===================================== */

const adminMenu = document.getElementById("adminMenu");
const adminToggle = document.getElementById("adminToggle");
const adminDropdown = document.getElementById("adminDropdown");

const profileToggle = document.getElementById("profileToggle");
const profileDropdown = document.getElementById("profileDropdown");

const loginForm = document.getElementById("loginForm");
const logoutBox = document.getElementById("logoutBox");
const loginStatus = document.getElementById("loginStatus");

const loginBtn = document.getElementById("loginBtn");

/* =====================================
   DROPDOWNS
===================================== */

if (adminToggle) {

  adminToggle.addEventListener("click", (e) => {

    e.stopPropagation();

    profileDropdown?.classList.remove("show");

    adminDropdown?.classList.toggle("show");

  });

}

if (profileToggle) {

  profileToggle.addEventListener("click", (e) => {

    e.stopPropagation();

    adminDropdown?.classList.remove("show");

    profileDropdown?.classList.toggle("show");

  });

}

document.addEventListener("click", () => {

  adminDropdown?.classList.remove("show");
  profileDropdown?.classList.remove("show");

});

adminDropdown?.addEventListener("click", e => e.stopPropagation());
profileDropdown?.addEventListener("click", e => e.stopPropagation());

/* =====================================
   LOGIN
===================================== */

if (loginBtn) {

  loginBtn.addEventListener("click", async () => {

    const email = document.getElementById("loginEmail").value.trim();
    const senha = document.getElementById("loginSenha").value;

    if (!email || !senha) {

      alert("Informe e-mail e senha.");
      return;

    }

    try {

      await signInWithEmailAndPassword(auth, email, senha);

      profileDropdown?.classList.remove("show");

    } catch (err) {

      alert(err.message);

    }

  });

}

/* =====================================
   LOGOUT
===================================== */

window.logout = async function () {

  await signOut(auth);

};

/* =====================================
   CONTROLE DE ACESSO
===================================== */

function bloquearAdmin() {

  if (!adminToggle) return;

  adminToggle.disabled = true;
  adminToggle.style.opacity = ".5";
  adminToggle.title = "Apenas administradores";

}

function liberarAdmin() {

  if (!adminToggle) return;

  adminToggle.disabled = false;
  adminToggle.style.opacity = "1";
  adminToggle.title = "";

}

function verificarPaginaAdmin(isAdmin) {

  const pagina = window.location.pathname.toLowerCase();

  const estaNoAdmin =
    pagina.endsWith("/admin.html") ||
    pagina.endsWith("admin.html") ||
    pagina.endsWith("/alteracao.html") ||
    pagina.endsWith("alteracao.html");

  if (estaNoAdmin && !isAdmin) {

    alert("Você não possui permissão para acessar esta página.");

    window.location.href = "index.html";

  }

}

/* =====================================
   FIREBASE AUTH
===================================== */

onAuthStateChanged(auth, (user) => {

  if (user) {

    loginForm.style.display = "none";
    logoutBox.style.display = "block";

    if (loginStatus) {

      loginStatus.textContent = user.email;

    }

    const admin = user.email.toLowerCase() === ADMIN_EMAIL;

    if (admin) {

      liberarAdmin();

    } else {

      bloquearAdmin();

    }

    verificarPaginaAdmin(admin);

  } else {

    loginForm.style.display = "block";
    logoutBox.style.display = "none";

    bloquearAdmin();

    verificarPaginaAdmin(false);

  }

});
