import { db, auth } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

/* =========================
   BUSCA DE CONTATOS
========================= */

let emailsAtuais = [];

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

  let editorasValidas = [];

  editorasSnap.forEach(doc => {
    const d = doc.data();

    if (
      d.nome?.toLowerCase() === editoraInput ||
      d.cnpj === editoraInput
    ) {
      editorasValidas.push(d.cnpj);
    }
  });

  if (editorasValidas.length === 0) {
    document.getElementById("resultado").innerHTML =
      "<p>❌ Editora não encontrada</p>";
    return;
  }

  contatosSnap.forEach(doc => {
    const c = doc.data();

    if (
      c.loja === loja &&
      editorasValidas.includes(c.editora)
    ) {
      emailsAtuais.push(c.email);
    }
  });

  renderResultado();
};

function renderResultado() {

  const div = document.getElementById("resultado");

  if (emailsAtuais.length === 0) {
    div.innerHTML = "<p>⚠️ Nenhum contato encontrado</p>";
    return;
  }

  let html = `
    <button onclick="copiarTodos()">📋 Copiar todos</button>
    <br><br>
  `;

  emailsAtuais.forEach(email => {
    html += `
      <div class="email">
        <span>${email}</span>
        <button onclick="copiar('${email}')">📋</button>
      </div>
    `;
  });

  div.innerHTML = html;
}

window.copiar = function (email) {
  navigator.clipboard.writeText(email);
  alert("E-mail copiado!");
};

window.copiarTodos = function () {
  navigator.clipboard.writeText(emailsAtuais.join(";"));
  alert("Todos os e-mails foram copiados!");
};


/* =========================
   ADMIN DROPDOWN (CORRIGIDO)
========================= */

const adminToggle = document.getElementById("adminToggle");
const adminDropdown = document.querySelector(".admin-menu");

if (adminToggle && adminDropdown) {

  adminToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    adminDropdown.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    adminDropdown.classList.remove("show");
  });
}

/* =========================
   LOGIN / LOGOUT (INDEX)
========================= */

const profileToggle = document.getElementById("profileToggle");
const profileDropdown = document.getElementById("profileDropdown");

const loginForm = document.getElementById("loginForm");
const logoutBox = document.getElementById("logoutBox");
const loginBtn = document.getElementById("loginBtn");

if (profileToggle && profileDropdown) {

  profileToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    profileDropdown.classList.remove("show");
  });
}

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {

    const email = document.getElementById("loginEmail").value;
    const senha = document.getElementById("loginSenha").value;

    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch (err) {
      alert(err.message);
    }
  });
}

window.logout = async function () {
  await signOut(auth);
};

onAuthStateChanged(auth, (user) => {

  if (!loginForm || !logoutBox) return;

  if (user) {
    loginForm.style.display = "none";
    logoutBox.style.display = "block";
  } else {
    loginForm.style.display = "block";
    logoutBox.style.display = "none";
  }
});
