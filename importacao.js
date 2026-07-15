import {
  collection,
  getDocs,
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
    .replace(/^"+|"+$/g, "");

}



function emailValido(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}



function removerDuplicados(lista) {

  const mapa = new Map();


  for (const item of lista) {

    const chave =
      `${item.loja}_${item.editora}_${item.email}`;


    mapa.set(
      chave,
      item
    );

  }


  return Array.from(
    mapa.values()
  );

}



function parseCSV(texto) {


  const normalizado =
    texto.replace(
      /\|\s*\n\s*/g,
      "|"
    );



  const linhas =
    normalizado
      .split("\n")
      .map(
        linha =>
          limparTexto(linha)
      )
      .filter(
        Boolean
      );



  const resultado = [];



  for (
    const linha of linhas
  ) {


    const partes =
      linha.split(";");



    const loja =
      limparTexto(
        partes[0]
      );


    const editora =
      limparTexto(
        partes[1]
      );


    const emailsRaw =
      limparTexto(
        partes[2]
      );


    const nome =
      limparTexto(
        partes[3]
      );



    if (
      !loja ||
      !editora ||
      !emailsRaw
    ) {

      ignorados++;

      continue;

    }



    const emails =
      emailsRaw.split("|");



    for (
      let email of emails
    ) {


      email =
        limparTexto(
          email
        );



      if (
        !email ||
        !emailValido(email)
      ) {

        ignorados++;

        continue;

      }



      resultado.push({

        loja,

        editora,

        email,

        nome:
          nome || null

      });


    }


  }



  return resultado;


}
function agruparContatos(lista) {

  const mapa = new Map();


  for (
    const item of lista
  ) {


    const chave =
      `${item.loja}_${item.editora}`;



    if (
      !mapa.has(chave)
    ) {

      mapa.set(
        chave,
        []
      );

    }



    mapa
      .get(chave)
      .push(item);


  }



  return mapa;

}




async function buscarContatosExistentes(
  loja,
  editora
) {


  const q =
    query(

      collection(
        db,
        "contatos"
      ),


      where(
        "loja",
        "==",
        loja
      ),


      where(
        "editora",
        "==",
        editora
      )

    );



  const snap =
    await getDocs(q);



  return snap.docs.map(
    d => ({

      id:
        d.id,

      ...d.data()

    })
  );


}




async function removerContatos(lista) {


  let batch =
    writeBatch(db);



  let count = 0;



  for (
    const item of lista
  ) {


    batch.delete(
      doc(
        db,
        "contatos",
        item.id
      )
    );


    removidos++;

    count++;



    if (
      count === 500
    ) {


      await batch.commit();


      batch =
        writeBatch(db);


      count = 0;


    }


  }



  if (
    count > 0
  ) {

    await batch.commit();

  }


}




async function criarContatos(lista) {


  let batch =
    writeBatch(db);



  let count = 0;



  for (
    const item of lista
  ) {



    const ref =
      doc(
        collection(
          db,
          "contatos"
        )
      );



    batch.set(
      ref,
      {

        email:
          item.email,

        nome:
          item.nome || null,

        loja:
          item.loja,

        editora:
          item.editora

      }
    );



    criados++;

    count++;



    if (
      count === 500
    ) {


      await batch.commit();


      batch =
        writeBatch(db);


      count = 0;


    }


  }



  if (
    count > 0
  ) {

    await batch.commit();

  }


}




async function buscarNovosContatos(
  novos,
  existentes
) {


  return novos.filter(
    item =>

      !existentes.some(
        existente =>

          existente.email === item.email

      )

  );


}
function atualizarProgresso() {


  const el =
    document.getElementById(
      "importProgress"
    );



  if (
    !el
  ) return;



  const percent =
    totalLinhas
      ? Math.round(
          (
            progressoAtual /
            totalLinhas
          ) * 100
        )
      : 0;



  el.innerHTML = `

    <p>📦 Importando...</p>

    <p>
      ${progressoAtual} / ${totalLinhas}
      (${percent}%)
    </p>

    <p>
      ✔ Criados: ${criados}
      |
      🗑 Removidos: ${removidos}
      |
      ⚠ Ignorados: ${ignorados}
    </p>

  `;


}





async function processarGrupo(
  chave,
  itens,
  modo
) {


  const partes =
    chave.split("_");


  const loja =
    partes[0];


  const editora =
    partes[1];



  const existentes =
    await buscarContatosExistentes(
      loja,
      editora
    );



  /*
    MODO SOBRESCREVER

    Remove todos os contatos
    daquela loja + editora
    e recria com o CSV.
  */

  if (
    modo === "sobrescrever"
  ) {


    if (
      existentes.length > 0
    ) {

      await removerContatos(
        existentes
      );

    }



    await criarContatos(
      itens
    );


    return;


  }





  /*
    MODO ACRESCENTAR

    Mantém os existentes
    e cria somente novos.
  */


  const novos =
    await buscarNovosContatos(
      itens,
      existentes
    );



  if (
    novos.length > 0
  ) {

    await criarContatos(
      novos
    );

  }


}





async function executarImportacao(
  lista,
  modo
) {


  const grupos =
    agruparContatos(
      lista
    );



  const chaves =
    Array.from(
      grupos.keys()
    );



  for (
    let i = 0;
    i < chaves.length;
    i++
  ) {


    const chave =
      chaves[i];



    const itens =
      grupos.get(
        chave
      );



    await processarGrupo(
      chave,
      itens,
      modo
    );



    progressoAtual +=
      itens.length;



    atualizarProgresso();


  }


}
window.importarCSV =
async function() {


  try {


    const file =
      document
        .getElementById(
          "csvFile"
        )
        .files[0];



    if (
      !file
    ) {


      alert(
        "Selecione um arquivo CSV."
      );


      return;


    }




    const modo =
      document
        .getElementById(
          "modoImportacao"
        )
        .value;



    progressoAtual = 0;

    totalLinhas = 0;

    criados = 0;

    removidos = 0;

    ignorados = 0;




    const text =
      await file.text();




    const lista =
      removerDuplicados(
        parseCSV(text)
      );




    totalLinhas =
      lista.length;




    if (
      totalLinhas === 0
    ) {


      alert(
        "Nenhum contato válido encontrado no arquivo."
      );


      return;


    }




    atualizarProgresso();




    await executarImportacao(
      lista,
      modo
    );




    atualizarProgresso();




    alert(

      `Importação concluída!\n\n` +

      `✔ Criados: ${criados}\n` +

      `🗑 Removidos: ${removidos}\n` +

      `⚠ Ignorados: ${ignorados}`

    );




    document
      .getElementById(
        "csvFile"
      )
      .value = "";


  }



  catch(e) {


    console.error(e);


    alert(
      "Erro na importação. Veja o console."
    );


  }


};
