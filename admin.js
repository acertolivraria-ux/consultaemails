import { db, auth } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

/* =========================
   ESTADO GLOBAL
========================= */

let usuario = null;

/* =========================
   LOGIN / LOGOUT
========================= */

window.login = function () {

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  signInWithEmailAndPassword(auth, email, senha)
    .catch(err => alert(err.message));
};

window.logout = async function () {
  await signOut(auth);
};

/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(auth, (user) => {

  usuario = user;

  if (!user) {
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("painel").style.display = "none";
    return;
  }

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("painel").style.display = "block";
});

/* =========================
   ABAS
========================= */

window.mostrarAba = function (aba) {

  document.querySelectorAll(".aba").forEach(el => {
    el.style.display = "none";
  });

  document.getElementById("aba-" + aba).style.display = "block";
};

/* =========================
   LOJAS
========================= */

window.salvarLoja = async function () {

  const numero = document.getElementById("numeroLoja").value.trim();
  const nome = document.getElementById("nomeLoja").value.trim();

  if (!numero || !nome) {
    alert("Preencha todos os campos.");
    return;
  }

  // Número já existe?
  const numeroExiste = await getDocs(
    query(
      collection(db, "lojas"),
      where("numero", "==", numero)
    )
  );

  if (!numeroExiste.empty) {
    alert("Já existe uma loja com esse número.");
    return;
  }

  // Nome já existe?
  const nomeExiste = await getDocs(
    query(
      collection(db, "lojas"),
      where("nome", "==", nome)
    )
  );

  if (!nomeExiste.empty) {
    alert("Já existe uma loja com esse nome.");
    return;
  }

  await addDoc(collection(db, "lojas"), {
    numero,
    nome
  });

  alert("Loja cadastrada com sucesso!");

  document.getElementById("numeroLoja").value = "";
  document.getElementById("nomeLoja").value = "";
};
/* =========================
   EDITORAS
========================= */

window.salvarEditora = async function () {

  const cnpj = document.getElementById("cnpjEditora").value.trim();
  const nome = document.getElementById("nomeEditora").value.trim();

  if (!cnpj || !nome) {
    alert("Preencha todos os campos.");
    return;
  }

  // CNPJ já existe?
  const existe = await getDocs(
    query(
      collection(db, "editoras"),
      where("cnpj", "==", cnpj)
    )
  );

  if (!existe.empty) {
    alert("Já existe uma editora com esse CNPJ.");
    return;
  }

  await addDoc(collection(db, "editoras"), {
    cnpj,
    nome
  });

  alert("Editora cadastrada com sucesso!");

  document.getElementById("cnpjEditora").value = "";
  document.getElementById("nomeEditora").value = "";
};

/* =========================
   MENU DE PERFIL
========================= */

const profileToggle = document.getElementById("profileToggle");
const profileDropdown = document.getElementById("profileDropdown");

if (profileToggle && profileDropdown) {

  profileToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    profileDropdown.classList.remove("show");
  });

  profileDropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}
/* =========================
   IMPORTAÇÃO CSV
========================= */

import "./importacao.js";

function abrirAba(hash) {

  document.querySelectorAll(".aba").forEach(a => {
    a.style.display = "none";
  });

  if (hash === "#alteracao") {
    document.getElementById("aba-alteracao").style.display = "block";
  } else {
    document.getElementById("aba-cadastro").style.display = "block";
  }
}

/* =========================
   CONTROLE POR URL (#hash)
========================= */

window.addEventListener("load", () => {
  abrirAba(window.location.hash || "#cadastro");
});

window.addEventListener("hashchange", () => {
  abrirAba(window.location.hash);
});
const adminToggle = document.getElementById("adminToggle");
const adminMenu = document.querySelector(".admin-menu");

if (adminToggle && adminMenu) {

  adminToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    adminMenu.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    adminMenu.classList.remove("show");
  });
}
