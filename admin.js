import { db, auth } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
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
let lojasSelecionadas = new Set();
let contatos = [];

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

onAuthStateChanged(auth, async (user) => {

  usuario = user;

  if (!user) {
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("painel").style.display = "none";
    return;
  }

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("painel").style.display = "block";

  await carregarLojas();
  await carregarEditoras();
});

/* =========================
   ABAS
========================= */

window.mostrarAba = async function (aba) {

  document.querySelectorAll(".aba").forEach(a => {
    a.style.display = "none";
  });

  document.getElementById("aba-" + aba).style.display = "block";

  if (aba === "contatos") {
    await carregarContatos();
  }
};

/* =========================
   LOJAS
========================= */

async function carregarLojas() {

  const div = document.getElementById("lojasDropdownList");
  div.innerHTML = "";

  const snap = await getDocs(collection(db, "lojas"));

  snap.forEach(d => {
    const l = d.data();

    div.innerHTML += `
      <label>
        <input type="checkbox"
          value="${l.numero}"
          onchange="toggleLoja('${l.numero}')">
        ${l.numero} - ${l.nome}
      </label><br>
    `;
  });
}

window.toggleLoja = function (numero) {
  if (lojasSelecionadas.has(numero)) {
    lojasSelecionadas.delete(numero);
  } else {
    lojasSelecionadas.add(numero);
  }
};

window.toggleLojasDropdown = function () {

  const el = document.getElementById("lojasDropdownList");

  el.style.display = el.style.display === "block"
    ? "none"
    : "block";
};

/* =========================
   EDITORAS
========================= */

async function carregarEditoras() {

  const select = document.getElementById("cnpjContato");

  select.innerHTML = `<option value="">Selecione a editora</option>`;

  const snap = await getDocs(collection(db, "editoras"));

  snap.forEach(d => {
    const e = d.data();

    select.innerHTML += `
      <option value="${e.cnpj}">
        ${e.cnpj} - ${e.nome}
      </option>
    `;
  });
}

/* =========================
   SALVAR CONTATO (MANUAL)
========================= */

window.salvarContato = async function () {

  const email = document.getElementById("emailContato").value.trim();
  const nome = document.getElementById("nomeContato").value.trim();
  const editora = document.getElementById("cnpjContato").value;
  const lojas = Array.from(lojasSelecionadas);

  if (!email || !editora || lojas.length === 0) {
    alert("Preencha email, editora e lojas");
    return;
  }

  let criados = 0;

  for (let loja of lojas) {

    const q = query(
      collection(db, "contatos"),
      where("email", "==", email),
      where("editora", "==", editora),
      where("loja", "==", loja)
    );

    const snap = await getDocs(q);

    if (!snap.empty) continue;

    await addDoc(collection(db, "contatos"), {
      email,
      nome: nome || null,
      editora,
      loja
    });

    criados++;
  }

  alert(`${criados} contato(s) criado(s)`);

  document.getElementById("emailContato").value = "";
  document.getElementById("nomeContato").value = "";
  document.getElementById("cnpjContato").value = "";

  lojasSelecionadas.clear();

  document.querySelectorAll("#lojasDropdownList input")
    .forEach(cb => cb.checked = false);
};

/* =========================
   CONTATOS
========================= */

async function carregarContatos() {

  contatos = [];

  const snap = await getDocs(collection(db, "contatos"));

  snap.forEach(d => {
    contatos.push({
      id: d.id,
      ...d.data()
    });
  });

  document.querySelectorAll("#lojasDropdownList input")
    .forEach(cb => cb.checked = false);
}

/* =========================
   EDITAR CONTATO
========================= */

window.editarContato = async function (id) {

  const contato = contatos.find(c => c.id === id);
  if (!contato) return;

  const novoEmail = prompt("Novo email:", contato.email);
  if (!novoEmail) return;

  const modo = confirm(
    "OK = alterar apenas este\nCancelar = alterar todos da editora"
  );

  if (modo) {

    await updateDoc(doc(db, "contatos", id), {
      email: novoEmail
    });

  } else {

    const batch = contatos.filter(c =>
      c.email === contato.email &&
      c.editora === contato.editora
    );

    for (let c of batch) {
      await updateDoc(doc(db, "contatos", c.id), {
        email: novoEmail
      });
    }
  }
};

/* =========================
   EXCLUIR CONTATO
========================= */

window.excluirContato = async function (id, email, editora) {

  const modo = confirm(
    "OK = excluir apenas este\nCancelar = excluir todos da editora"
  );

  if (modo) {

    await deleteDoc(doc(db, "contatos", id));

  } else {

    const snap = await getDocs(collection(db, "contatos"));

    for (let d of snap.docs) {

      const c = d.data();

      if (c.email === email && c.editora === editora) {
        await deleteDoc(doc(db, "contatos", d.id));
      }
    }
  }
};
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
import "./importacao.js";
