import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { db } from "./firebase-config.js";
let progressoAtual = 0;
let totalLinhas = 0;

let criados = 0;
let removidos = 0;
let ignorados = 0;
function limparTexto(t) {
  if (!t) return "";

  return t
    .toString()
    .trim()
    .replace(/\r/g, "")
    .replace(/^"+|"+$/g, ""); // remove aspas externas
}
function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function parseCSV(texto) {
  const linhas = texto
    .split("\n")
    .map(l => limparTexto(l))
    .filter(l => l);

  const resultado = [];

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];

    // 🔥 ignora cabeçalho (linha 1)
    if (i === 0 && linha.toLowerCase().includes("loja")) {
      continue;
    }

    const partes = linha.split(";");

    const loja = limparTexto(partes[0]);
    const editora = limparTexto(partes[1]);
    const emailsRaw = limparTexto(partes[2]);
    const nome = limparTexto(partes[3]);

    if (!loja || !editora || !emailsRaw) {
      ignorados++;
      continue;
    }

    const emails = emailsRaw.split("|");

    for (let email of emails) {
      email = limparTexto(email);

      if (!email || !emailValido(email)) {
        ignorados++;
        continue;
      }

      resultado.push({
        loja,
        editora,
        email,
        nome: nome || null
      });
    }
  }

  return resultado;
}
function agruparContatos(lista) {
  const mapa = new Map();

  for (const item of lista) {
    const chave = `${item.loja}_${item.editora}`;

    if (!mapa.has(chave)) {
      mapa.set(chave, []);
    }

    mapa.get(chave).push(item);
  }

  return mapa;
}
async function buscarContatosExistentes(loja, editora) {
  const q = query(
    collection(db, "contatos"),
    where("loja", "==", loja),
    where("editora", "==", editora)
  );

  const snap = await getDocs(q);

  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}
async function removerContatos(lista) {
  const batch = writeBatch(db);

  let count = 0;

  for (const item of lista) {
    batch.delete(doc(db, "contatos", item.id));
    removidos++;
    count++;

    // Firestore limita 500 operações por batch
    if (count === 500) {
      await batch.commit();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
  }
}
async function criarContatos(lista) {
  let batch = writeBatch(db);
  let count = 0;

  for (const item of lista) {
    const ref = doc(collection(db, "contatos"));

    batch.set(ref, {
      email: item.email,
      nome: item.nome || null,
      loja: item.loja,
      editora: item.editora
    });

    criados++;
    count++;

    if (count === 500) {
      await batch.commit();
      batch = writeBatch(db);
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
  }
}
function atualizarProgresso() {
  const el = document.getElementById("importProgress");

  if (!el) return;

  const percent = totalLinhas
    ? Math.round((progressoAtual / totalLinhas) * 100)
    : 0;

  el.innerHTML = `
    <p>📦 Importando...</p>
    <p>${progressoAtual} / ${totalLinhas} (${percent}%)</p>
    <p>✔ Criados: ${criados} | 🗑 Removidos: ${removidos} | ⚠ Ignorados: ${ignorados}</p>
  `;
}
async function processarGrupo(chave, itens) {
  const [loja, editora] = chave.split("_");

  // 1. Buscar antigos
  const existentes = await buscarContatosExistentes(loja, editora);

  // 2. Remover antigos
  if (existentes.length > 0) {
    await removerContatos(existentes);
  }

  // 3. Criar novos
  await criarContatos(itens);
}
async function executarImportacao(lista) {
  const grupos = agruparContatos(lista);

  const chaves = Array.from(grupos.keys());

  for (let i = 0; i < chaves.length; i++) {
    const chave = chaves[i];
    const itens = grupos.get(chave);

    await processarGrupo(chave, itens);

    progressoAtual += itens.length;
    atualizarProgresso();
  }
}
window.importarCSV = async function () {

  const file = document.getElementById("csvFile").files[0];

  if (!file) {
    alert("Selecione um arquivo CSV");
    return;
  }

  // 🔄 reset de estado
  progressoAtual = 0;
  totalLinhas = 0;
  criados = 0;
  removidos = 0;
  ignorados = 0;

  const text = await file.text();

  // 📄 parse inicial de linhas
  const linhasBrutas = text
    .split("\n")
    .map(l => l.trim())
    .filter(l => l);

  totalLinhas = linhasBrutas.length;

  // 🔥 transforma CSV em estrutura limpa
  const lista = parseCSV(text);

  totalLinhas = lista.length;

  atualizarProgresso();

  // 🚀 executa importação
  await executarImportacao(lista);

  // 📊 finalização
  atualizarProgresso();

  alert(
    `Importação concluída!\n\n` +
    `✔ Criados: ${criados}\n` +
    `🗑 Removidos: ${removidos}\n` +
    `⚠ Ignorados: ${ignorados}`
  );

  // 🧹 limpa estado do sistema
  lojasSelecionadas.clear();

  document.querySelectorAll("#lojasDropdownList input")
    .forEach(cb => cb.checked = false);

  document.getElementById("csvFile").value = "";
};
window.importarCSV = importarCSV;
