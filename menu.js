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

if (adminToggle && adminDropdown) {

  adminToggle.addEventListener("click", (e) => {

    e.stopPropagation();

    profileDropdown?.classList.remove("show");

    adminDropdown.classList.toggle("show");

  });

}

if (profileToggle && profileDropdown) {

  profileToggle.addEventListener("click", (e) => {

    e.stopPropagation();

    adminDropdown?.classList.remove("show");

    profileDropdown.classList.toggle("show");

  });

}

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

  profileDropdown?.classList.remove("show");

};
/* =====================================
   CONTROLE DE PERMISSÃO
===================================== */

function isAdmin(user) {

  if (!user || !user.email)
    return false;


  return (
    user.email.toLowerCase() ===
    ADMIN_EMAIL.toLowerCase()
  );

}


/* =====================================
   CONTROLE DE PÁGINAS ADMIN
===================================== */

function verificarAcessoPagina(user) {


  const pagina =
    window.location.pathname
      .split("/")
      .pop()
      .toLowerCase();



  const paginasRestritas = [

    "admin.html",
    "alteracao.html"

  ];



  if (
    paginasRestritas.includes(pagina)
    &&
    !isAdmin(user)
  ) {

    alert(
      "Você não possui permissão para acessar esta página."
    );


    window.location.href =
      "index.html";

  }


}



/* =====================================
   CONTROLE DO MENU ADMIN
===================================== */

function atualizarMenuAdmin(admin) {


  if (!adminDropdown)
    return;



  const links =
    adminDropdown.querySelectorAll("a");



  links.forEach(link => {

    if (admin) {

      link.style.display =
        "block";

    } else {

      link.style.display =
        "none";

    }

  });



}



/* =====================================
   ESTADO DE LOGIN
===================================== */

onAuthStateChanged(
  auth,
  (user) => {



    const admin =
      isAdmin(user);



    atualizarMenuAdmin(admin);



    verificarAcessoPagina(user);



    if (!loginForm || !logoutBox)
      return;



    if (user) {



      loginForm.style.display =
        "none";



      logoutBox.style.display =
        "block";



      if (loginStatus) {

        loginStatus.textContent =
          user.email;

      }



    } else {



      loginForm.style.display =
        "block";



      logoutBox.style.display =
        "none";



    }



  }
);



/* =====================================
   EXPORTA PARA OUTROS ARQUIVOS
===================================== */

export function usuarioEhAdmin() {

  const user =
    auth.currentUser;


  return isAdmin(user);

}
