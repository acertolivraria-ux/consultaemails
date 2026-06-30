import { db } from "./firebase-config.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

let userLogado = null;

/* 🔐 LOGIN */
window.login = function () {

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  signInWithEmailAndPassword(auth, email, senha)
    .catch(err => alert("Erro: " + err.message));
};

/* 🔎 VERIFICA LOGIN */
onAuthStateChanged(auth, user => {

  userLogado = user;

  if (user) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("painel").style.display = "block";
  } else {
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("painel").style.display = "none";
  }

});

/* 🚪 LOGOUT */
window.logout = function () {
  signOut(auth);
};

/* 💾 SALVAR NO BANCO */
window.salvar = async function () {

  const nome = document.getElementById("nome").value;
  const cnpj = document.getElementById("cnpj").value;
  const lojas = document.getElementById("lojas").value
    .split(",")
    .map(l => l.trim());

  const email = document.getElementById("emailContato").value;

  if (!nome || !cnpj) {
    alert("Preencha os dados da editora");
    return;
  }

  await addDoc(collection(db, "editoras"), {
    nome,
    cnpj,
    lojas,
    contatos: [
      { email }
    ]
  });

  alert("Salvo com sucesso!");

  document.getElementById("emailContato").value = "";
};
