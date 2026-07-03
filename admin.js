import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  limit
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

  try {
    const existeNumero = await getDocs(
      query(
        collection(db, "lojas"),
        where("numero", "==", numero),
        limit(1)
      )
    );

    if (!existeNumero.empty) {
      alert("Já existe uma loja com esse número.");
      return;
    }

    const existeNome = await getDocs(
      query(
        collection(db, "lojas"),
        where("nome", "==", nome),
        limit(1)
      )
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
  } catch (err) {
    console.error(err);
    alert("Erro ao salvar loja.");
  }
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

  try {
    const existe = await getDocs(
      query(
        collection(db, "editoras"),
        where("cnpj", "==", cnpj),
        limit(1)
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
  } catch (err) {
    console.error(err);
    alert("Erro ao salvar editora.");
  }
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
    try {
      const text = e.target.result;

      const linhas = text
        .split("\n")
        .map(l => l.trim())
        .filter(l => l.length > 0);

      let criados = 0;

      for (const linha of linhas) {
        const cols = linha.split(",");

        const loja = cols[0]?.trim();
        const editora = cols[1]?.trim();
        const emails = cols[2]?.trim();
        const nome = cols[3]?.trim() || null;

        if (!loja || !editora || !emails) continue;

        const listaEmails = emails
          .split("|")
          .map(e => e.trim())
          .filter(Boolean);

        for (const email of listaEmails) {
          const existe = await getDocs(
            query(
              collection(db, "contatos"),
              where("email", "==", email),
              where("loja", "==", loja),
              where("editora", "==", editora),
              limit(1)
            )
          );

          if (!existe.empty) continue;

          await addDoc(collection(db, "contatos"), {
            loja,
            editora,
            email,
            nome
          });

          criados++;
        }
      }

      alert(`${criados} contatos importados com sucesso!`);
    } catch (err) {
      console.error(err);
      alert("Erro ao importar CSV.");
    }
  };

  reader.readAsText(file);
};
