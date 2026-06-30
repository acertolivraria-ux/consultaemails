import { db, auth } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs
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
window.mostrarAba = function (aba) {

  document.getElementById("aba-lojas").style.display = "none";
  document.getElementById("aba-editoras").style.display = "none";
  document.getElementById("aba-contatos").style.display = "none";

  document.getElementById("aba-" + aba).style.display = "block";
};
window.salvarLoja = async function () {

  const numero = document.getElementById("numeroLoja").value.trim();
  const nome = document.getElementById("nomeLoja").value.trim();

  if (!numero || !nome) {
    alert("Preencha todos os campos");
    return;
  }

  const snap = await getDocs(collection(db, "lojas"));

  let existe = false;

  snap.forEach(doc => {
    const d = doc.data();

    if (d.numero === numero || d.nome.toLowerCase() === nome.toLowerCase()) {
      existe = true;
    }
  });

  if (existe) {
    alert("❌ Já existe uma loja com esse número ou nome");
    return;
  }

  await addDoc(collection(db, "lojas"), {
    numero,
    nome
  });

  alert("✔ Loja cadastrada com sucesso!");

  // LIMPAR CAMPOS
  document.getElementById("numeroLoja").value = "";
  document.getElementById("nomeLoja").value = "";
};
window.salvarEditora = async function () {

  const nome = document.getElementById("nomeEditora").value.trim();
  const cnpj = document.getElementById("cnpjEditora").value.trim();

  if (!nome || !cnpj) {
    alert("Preencha todos os campos");
    return;
  }

  const snap = await getDocs(collection(db, "editoras"));

  let existe = false;

  snap.forEach(doc => {
    const d = doc.data();

    if (d.cnpj === cnpj) {
      existe = true;
    }
  });

  if (existe) {
    alert("❌ Já existe uma editora com esse CNPJ");
    return;
  }

  await addDoc(collection(db, "editoras"), {
    nome,
    cnpj
  });

  alert("✔ Editora cadastrada com sucesso!");

  // LIMPAR CAMPOS
  document.getElementById("nomeEditora").value = "";
  document.getElementById("cnpjEditora").value = "";
};

window.salvarContato = async function () {

  const email = document.getElementById("emailContato").value.trim();
  const nome = document.getElementById("nomeContato").value.trim();

  const lojas = Array.from(document.querySelectorAll(".lojaCheck:checked"))
    .map(el => el.value);

  const editoras = Array.from(document.querySelectorAll(".editoraCheck:checked"))
    .map(el => el.value);

  if (!email || lojas.length === 0 || editoras.length === 0) {
    alert("Preencha e-mail, lojas e editoras");
    return;
  }

  await addDoc(collection(db, "contatos"), {
    email,
    nome: nome || null,
    lojas,
    editoras
  });

  alert("✔ Contato salvo!");
};

window.substituirContato = async function (emailAntigo, novoDados, todasLojas = false) {

  const snap = await getDocs(collection(db, "contatos"));

  snap.forEach(async (docItem) => {
    const d = docItem.data();

    if (d.email === emailAntigo) {

      if (todasLojas) {
        // substitui global
        await updateDoc(doc(db, "contatos", docItem.id), novoDados);
      } else {
        // substituição parcial (você define lógica depois)
        await updateDoc(doc(db, "contatos", docItem.id), novoDados);
      }
    }
  });

};
window.excluirContato = async function (email, todasLojas = false) {

  const snap = await getDocs(collection(db, "contatos"));

  snap.forEach(async (docItem) => {
    const d = docItem.data();

    if (d.email === email) {

      if (todasLojas) {
        await deleteDoc(doc(db, "contatos", docItem.id));
      } else {
        await deleteDoc(doc(db, "contatos", docItem.id));
      }
    }
  });

};
window.importarCSV = async function () {

  const file = document.getElementById("csvFile").files[0];
  if (!file) return alert("Selecione um CSV");

  const text = await file.text();
  const linhas = text.split("\n");

  for (let linha of linhas) {

    const [loja, cnpj, emails, nome] = linha.split(",");

    if (!loja || !cnpj || !emails) continue;

    const listaEmails = emails.split(";").map(e => e.trim());

    for (let email of listaEmails) {

      await addDoc(collection(db, "contatos"), {
        email,
        nome: nome || null,
        lojas: [loja],
        editoras: [cnpj]
      });

    }
  }

  alert("✔ CSV importado!");
};
window.logout = function () {

  signOut(auth)
    .then(() => {

      alert("Logout realizado com sucesso!");

      // volta para tela de login
      document.getElementById("loginBox").style.display = "block";
      document.getElementById("painel").style.display = "none";

      // (opcional) limpar campos
      document.getElementById("email").value = "";
      document.getElementById("senha").value = "";

    })
    .catch((error) => {
      alert("Erro ao sair: " + error.message);
    });

};
