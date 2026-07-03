import { auth } from "./firebase-config.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

/* =====================================
   DROPDOWN ADMIN
===================================== */

const adminToggle = document.getElementById("adminToggle");
const adminDropdown = document.getElementById("adminDropdown");

if (adminToggle && adminDropdown) {

  adminToggle.addEventListener("click", (e) => {

    e.stopPropagation();

    profileDropdown?.classList.remove("show");

    adminDropdown.classList.toggle("show");

  });

}

/* =====================================
   DROPDOWN PERFIL
===================================== */

const profileToggle = document.getElementById("profileToggle");
const profileDropdown = document.getElementById("profileDropdown");

if (profileToggle && profileDropdown) {

  profileToggle.addEventListener("click", (e) => {

    e.stopPropagation();

    adminDropdown?.classList.remove("show");

    profileDropdown.classList.toggle("show");

  });

}

/* =====================================
   FECHAR AO CLICAR FORA
===================================== */

document.addEventListener("click", () => {

  adminDropdown?.classList.remove("show");
  profileDropdown?.classList.remove("show");

});

adminDropdown?.addEventListener("click", (e) => {
  e.stopPropagation();
});

profileDropdown?.addEventListener("click", (e) => {
  e.stopPropagation();
});

/* =====================================
   LOGIN
===================================== */

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {

  loginBtn.addEventListener("click", async () => {

    const email =
      document.getElementById("loginEmail").value.trim();

    const senha =
      document.getElementById("loginSenha").value;

    if (!email || !senha) {

      alert("Informe e-mail e senha.");

      return;

    }

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        senha
      );

      profileDropdown.classList.remove("show");

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

  profileDropdown?.classList.remove("show");

};

/* =====================================
   ESTADO DO LOGIN
===================================== */

const loginForm =
  document.getElementById("loginForm");

const logoutBox =
  document.getElementById("logoutBox");

const loginStatus =
  document.getElementById("loginStatus");

onAuthStateChanged(auth, (user) => {

  if (!loginForm || !logoutBox)
    return;

  if (user) {

    loginForm.style.display = "none";
    logoutBox.style.display = "block";

    if (loginStatus) {

      loginStatus.textContent =
        user.email;

    }

  } else {

    loginForm.style.display = "block";
    logoutBox.style.display = "none";

  }

});
