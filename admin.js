import { db, auth } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

let userLogado = null;

/* =========================
   LOGIN
========================= */

window.login = function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  signInWithEmailAndPassword(auth, email, senha)
    .catch(err => alert("Erro: " + err.message));
};

/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(auth, async user => {
  userLogado = user;

  if (user) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("painel").style.display = "block";

    await carregarLojas();
    await carregarEditoras();

  } else {
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("painel").style.display = "none";
  }
});

/* =========================
   LOGOUT
========================= */

window.logout = function () {
  signOut(auth)
    .then(() => {
      alert("Logout realizado!");
    })
    .catch(err => alert(err.message));
};

/* =========================
   ABAS
========================= */

window.mostrarAba = function (aba) {
  document.getElementById("aba-lojas").style.display = "none";
  document.getElementById("aba-editoras").style.display = "none";
  document.getElementById("aba-contatos").style.display = "none";

  document.getElementById("aba-" + aba).style.display = "block";
};

/* =========================
   LOJAS
========================= */

window.salvarLoja = async function () {
  const numero = document.getElementById("numeroLoja").value.trim();
  const nome = document.getElementById("nomeLoja").value.trim();

  if (!numero || !nome) {
    alert("Preencha todos os campos");
    return;
  }

  await addDoc(collection(db, "lojas"), {
    numero,
    nome
  });

  alert("Loja cadastrada!");
  document.getElementById("numeroLoja").value = "";
  document.getElementById("nomeLoja").value = "";

  await carregarLojas();
};

async function carregarLojas() {
  const snap = await getDocs(collection(db, "lojas"));

  let html = "";

  snap.forEach(d => {
    const data = d.data();

    html += `
      <label>
        <input type="checkbox" class="lojaCheck" value="${data.numero}">
        ${data.numero} - ${data.nome}
      </label><br>
    `;
  });

  document.getElementById("lojasCheckbox").innerHTML = html;
}

/* =========================
   EDITORAS
========================= */

window.salvarEditora = async function () {
  const nome = document.getElementById("nomeEditora").value.trim();
  const cnpj = document.getElementById("cnpjEditora").value.trim();

  if (!nome || !cnpj) {
    alert("Preencha todos os campos");
    return;
  }

  await addDoc(collection(db, "editoras"), {
    nome,
    cnpj
  });

  alert("Editora cadastrada!");
  document.getElementById("nomeEditora").value = "";
  document.getElementById("cnpjEditora").value = "";

  await carregarEditoras();
};

async function carregarEditoras() {
  const snap = await getDocs(collection(db, "editoras"));

  let html = "";

  snap.forEach(d => {
    const data = d.data();

    html += `
      <label>
        <input type="checkbox" class="editoraCheck" value="${data.cnpj}">
        ${data.nome}
      </label><br>
    `;
  });

  document.getElementById("editorasCheckbox").innerHTML = html;
}

/* =========================
   CONTATOS
========================= */

window.salvarContato = async function () {

  const email = document.getElementById("emailContato").value.trim();
  const nome = document.getElementById("nomeContato").value.trim();

  const lojas = Array.from(document.querySelectorAll(".lojaCheck:checked"))
    .map(el => el.value);

  const editoras = Array.from(document.querySelectorAll(".editoraCheck:checked"))
    .map(el => el.value);

  if (!email || lojas.length === 0 || editoras.length === 0) {
    alert("Preencha email, lojas e editoras");
    return;
  }

  await addDoc(collection(db, "contatos"), {
    email,
    nome: nome || null,
    lojas,
    editoras
  });

  alert("Contato salvo!");

  document.getElementById("emailContato").value = "";
  document.getElementById("nomeContato").value = "";
};

/* =========================
   CSV IMPORT
========================= */

window.importarCSV = async function () {

  const file = document.getElementById("csvFile").files[0];

  if (!file) {
    alert("Selecione um arquivo CSV");
    return;
  }

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
        lojas: [loja.trim()],
        editoras: [cnpj.trim()]
      });

    }
  }

  alert("CSV importado com sucesso!");
};

/* =========================
   PLACEHOLDER FUTURO
   (substituir/excluir contato)
========================= */

window.excluirContato = async function (email) {

  const snap = await getDocs(collection(db, "contatos"));

  snap.forEach(async d => {
    const data = d.data();

    if (data.email === email) {
      await deleteDoc(doc(db, "contatos", d.id));
    }
  });

};
