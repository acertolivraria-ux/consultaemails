console.log("SCRIPT CARREGOU");
import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

/* =========================
   ESTADO GLOBAL DA BUSCA
========================= */
let emailsAtuais = [];

/* =========================
   FUNÇÃO PRINCIPAL DE BUSCA
========================= */
window.pesquisar = async function () {

  const loja = document.getElementById("loja").value.trim();
  const editoraInput = document.getElementById("editora").value.trim().toLowerCase();

  if (!loja || !editoraInput) {
    alert("Preencha loja e editora");
    return;
  }

  emailsAtuais = [];

  const contatosSnap = await getDocs(collection(db, "contatos"));
  const editorasSnap = await getDocs(collection(db, "editoras"));

  let editoraValida = null;

  /* =========================
     VALIDAR EDITORA
  ========================= */
  editorasSnap.forEach(doc => {

    const d = doc.data();

    if (
      d.nome?.toLowerCase() === editoraInput ||
      d.cnpj === editoraInput
    ) {
      editoraValida = d.cnpj; // 👈 IMPORTANTE: usar o CNPJ
    }

  });

  if (!editoraValida) {
    document.getElementById("resultado").innerHTML =
      "<p>❌ Editora não encontrada</p>";
    return;
  }

  /* =========================
     FILTRAR CONTATOS (CORRETO)
  ========================= */

  contatosSnap.forEach(doc => {

    const c = doc.data();

    if (
      c.loja === loja &&
      c.editora === editoraValida
    ) {
      emailsAtuais.push(c.email);
    }

  });

  renderResultado();
};
/* =========================
   RENDERIZAÇÃO NA TELA
========================= */
function renderResultado() {

  const div = document.getElementById("resultado");

  if (emailsAtuais.length === 0) {
    div.innerHTML = "<p>⚠️ Nenhum contato encontrado</p>";
    return;
  }

  let html = `
    <button onclick="copiarTodos()">
      📋 Copiar todos
    </button>
    <br><br>
  `;

  emailsAtuais.forEach(email => {

    html += `
      <div class="email">
        <span>${email}</span>
        <button onclick="copiar('${email}')">
          📋
        </button>
      </div>
    `;

  });

  div.innerHTML = html;
}

/* =========================
   COPIAR UM EMAIL
========================= */
window.copiar = function (email) {
  navigator.clipboard.writeText(email);
  alert("E-mail copiado!");
};

/* =========================
   COPIAR TODOS
========================= */
window.copiarTodos = function () {

  if (!emailsAtuais.length) return;

  const texto = emailsAtuais.join(";");

  navigator.clipboard.writeText(texto);

  alert("Todos os e-mails foram copiados!");
};
