import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

/* =====================================
   ESTADO
===================================== */

let usuarioLogado = null;

/* =====================================
   ABAS
===================================== */

window.mostrarAba = function (aba) {

  document.querySelectorAll(".aba").forEach(el => {
    el.style.display = "none";
  });

  const target = document.getElementById("aba-" + aba);

  if (target) {
    target.style.display = "block";
  }

};

/* =====================================
   LOJAS
===================================== */

window.salvarLoja = async function () {

  const numero = document.getElementById("numeroLoja").value.trim();
  const nome = document.getElementById("nomeLoja").value.trim();

  if (!numero || !nome) {
    alert("Preencha todos os campos.");
    return;
  }

  const existeNumero = await getDocs(
    query(collection(db, "lojas"), where("numero", "==", numero))
  );

  if (!existeNumero.empty) {
    alert("Já existe uma loja com esse número.");
    return;
  }

  const existeNome = await getDocs(
    query(collection(db, "lojas"), where("nome", "==", nome))
  );

  if (!existeNome.empty) {
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

/* =====================================
   EDITORAS
===================================== */

window.salvarEditora = async function () {

  const cnpj = document.getElementById("cnpjEditora").value.trim();
  const nome = document.getElementById("nomeEditora").value.trim();

  if (!cnpj || !nome) {
    alert("Preencha todos os campos.");
    return;
  }

  const existe = await getDocs(
    query(collection(db, "editoras"), where("cnpj", "==", cnpj))
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

/* =====================================
   IMPORTAÇÃO CSV
===================================== */

window.importarCSV = function () {

  const fileInput = document.getElementById("csvFile");

  const file = fileInput.files[0];

  if (!file) {
    alert("Selecione um arquivo CSV.");
    return;
  }

  const reader = new FileReader();

  reader.onload = async function (e) {

    const text = e.target.result;

    const linhas = text.split("\n");

    let criados = 0;

    for (let linha of linhas) {

      const [loja, editora, emails, nome] = linha.split(",");

      if (!loja || !editora || !emails)
        continue;

      const listaEmails = emails.split("|");

      for (let email of listaEmails) {

        email = email.trim();

        if (!email) continue;

        const existe = await getDocs(
          query(
            collection(db, "contatos"),
            where("email", "==", email),
            where("loja", "==", loja),
            where("editora", "==", editora)
          )
        );

        if (!existe.empty) continue;

        await addDoc(collection(db, "contatos"), {
          loja: loja.trim(),
          editora: editora.trim(),
          email,
          nome: nome?.trim() || null
        });

        criados++;

      }

    }

    alert(`${criados} contatos importados com sucesso!`);

  };

  reader.readAsText(file);

};
