import {
  db,
  auth
} from "./firebase-config.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

window.login = function () {

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  signInWithEmailAndPassword(auth, email, senha)
    .catch(err => alert(err.message));
};

onAuthStateChanged(auth, user => {

  if (user) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("painel").style.display = "block";
  }

});

window.logout = function () {
  signOut(auth);
};

window.salvar = async function () {

  const nome = document.getElementById("nome").value;
  const cnpj = document.getElementById("cnpj").value;
  const lojas = document.getElementById("lojas").value.split(",").map(l => l.trim());
  const email = document.getElementById("emailContato").value;

  await addDoc(collection(db, "editoras"), {
    nome,
    cnpj,
    lojas,
    contatos: [
      { email }
    ]
  });

  alert("Salvo com sucesso!");
};
