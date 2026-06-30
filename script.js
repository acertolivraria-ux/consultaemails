import {
  db
} from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

let resultadoAtual = null;

window.pesquisar = async function () {

  const loja = document.getElementById("loja").value.trim();
  const editoraInput = document.getElementById("editora").value.trim().toLowerCase();

  const snap = await getDocs(collection(db, "editoras"));

  resultadoAtual = null;

  snap.forEach(doc => {

    const data = doc.data();

    const matchEditora =
      data.nome?.toLowerCase() === editoraInput ||
      data.cnpj === editoraInput;

    const matchLoja =
      data.lojas?.includes(loja);

    if (matchEditora && matchLoja) {
      resultadoAtual = data;
    }

  });

  render();
};

function render() {

  const div = document.getElementById("resultado");

  if (!resultadoAtual) {
    div.innerHTML = "<p>Nenhum resultado encontrado</p>";
    return;
  }

  let html = `
    <button onclick="copiarTodos()">📋 Copiar todos</button>
    <br><br>
  `;

  resultadoAtual.contatos?.forEach(c => {

    html += `
      <div class="email">
        <span>${c.email}</span>
        <button onclick="copiar('${c.email}')">📋</button>
      </div>
    `;

  });

  div.innerHTML = html;
}

window.copiar = function (email) {
  navigator.clipboard.writeText(email);
  alert("Copiado!");
};

window.copiarTodos = function () {
  const lista = resultadoAtual.contatos.map(c => c.email).join(";");
  navigator.clipboard.writeText(lista);
  alert("Todos os e-mails copiados!");
};
