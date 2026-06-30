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
let usuario = null;

let lojas = [];
let editoras = [];
let contatos = [];
window.login = function () {

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    signInWithEmailAndPassword(auth, email, senha)
        .catch(err => alert(err.message));

};
window.logout = async function () {

    await signOut(auth);

};
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
window.mostrarAba = async function (aba) {

  document.querySelectorAll(".aba").forEach(a => {
    a.style.display = "none";
  });

  document.getElementById("aba-" + aba).style.display = "block";

  // 🔥 carrega contatos só quando abrir a aba
  if (aba === "contatos") {
    await carregarContatos();
  }
};
let lojasSelecionadas = new Set();
async function carregarLojas() {

  const div = document.getElementById("lojasDropdownList");

  div.innerHTML = "";

  const snap = await getDocs(collection(db, "lojas"));

  snap.forEach(doc => {

    const l = doc.data();

    div.innerHTML += `
      <label>
        <input type="checkbox" value="${l.numero}"
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

async function carregarEditoras() {

  const select = document.getElementById("cnpjContato");

  select.innerHTML = `<option value="">Selecione a editora</option>`;

  const snap = await getDocs(collection(db, "editoras"));

  snap.forEach(doc => {

    const e = doc.data();

    select.innerHTML += `
      <option value="${e.cnpj}">
        ${e.cnpj} - ${e.nome}
      </option>
    `;
  });
}

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

  // reset
  document.getElementById("emailContato").value = "";
  document.getElementById("nomeContato").value = "";
  document.getElementById("cnpjContato").value = "";
  lojasSelecionadas.clear();

document.querySelectorAll("#lojasDropdownList input")
  .forEach(cb => cb.checked = false);

};
async function carregarContatos() {

  contatos = [];

  const snap = await getDocs(collection(db, "contatos"));

  snap.forEach(d => {
    contatos.push({
      id: d.id,
      ...d.data()
    });
  });

  // 🔥 garante reset visual correto dos checkboxes
  document.querySelectorAll("#lojasDropdownList input")
    .forEach(cb => cb.checked = false);
}

window.editarContato = async function (id) {

  const contato = contatos.find(c => c.id === id);

  const novoEmail = prompt("Novo email:", contato.email);
  if (!novoEmail) return;

  const modo = confirm(
    "OK = alterar apenas esta loja\nCancelar = alterar todas as lojas da editora"
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
window.excluirContato = async function (id, email, editora) {

  const modo = confirm(
    "OK = excluir apenas esta loja\nCancelar = excluir todas as lojas da editora"
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
window.importarCSV = async function () {

  const file = document.getElementById("csvFile").files[0];

  if (!file) {
    alert("Selecione um arquivo CSV");
    return;
  }

  const text = await file.text();

  const linhas = text
    .split("\n")
    .map(l => l.trim())
    .filter(l => l);

  const mapa = new Map();

  for (let linha of linhas) {

    if (!linha) continue;

    const partes = linha.split(";");

    const loja = partes[0]?.trim();
    const cnpj = partes[1]?.trim();
    const emails = partes[2]?.trim();
    const nome = partes[3]?.trim();

    if (!loja || !cnpj || !emails) continue;

    const chave = `${loja}_${cnpj}`;

    if (!mapa.has(chave)) {
      mapa.set(chave, []);
    }

    const listaEmails = emails.split("|").map(e => e.trim());

    for (let email of listaEmails) {

      if (!email) continue;

      mapa.get(chave).push({
        email,
        nome: nome || null,
        loja,
        editora: cnpj
      });
    }
  }

  let removidos = 0;
  let criados = 0;

  for (let [chave, novosContatos] of mapa.entries()) {

    const [loja, editora] = chave.split("_");

    const q = query(
      collection(db, "contatos"),
      where("loja", "==", loja),
      where("editora", "==", editora)
    );

    const snap = await getDocs(q);

    for (let docSnap of snap.docs) {
      await deleteDoc(doc(db, "contatos", docSnap.id));
      removidos++;
    }

    for (let c of novosContatos) {
      await addDoc(collection(db, "contatos"), c);
      criados++;
    }
  }

  alert(`Importação concluída!\n\nRemovidos: ${removidos}\nCriados: ${criados}`);

  // 🔥 limpeza de estado global
  lojasSelecionadas.clear();
};
