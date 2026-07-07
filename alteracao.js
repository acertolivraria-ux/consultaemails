import { db, auth } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


/* =====================================
   CONFIGURAÇÃO
===================================== */

const ADMIN_EMAIL =
  "acertoscentralizados@gmail.com";


let lojas = [];
let editoras = [];
let contatos = [];

let lojaEditando = null;


/* =====================================
   SEGURANÇA
===================================== */

onAuthStateChanged(
  auth,
  (user) => {

    if (
      !user ||
      user.email.toLowerCase() !==
      ADMIN_EMAIL.toLowerCase()
    ) {

      window.location.href =
        "index.html";

    }

  }
);


/* =====================================
   ABAS
===================================== */

window.mostrarAbaAlteracao =
function(aba) {


  document
    .querySelectorAll(".aba")
    .forEach(
      elemento => {

        elemento.style.display =
          "none";

      }
    );


  const alvo =
    document.getElementById(
      "aba-" + aba
    );


  if (alvo) {

    alvo.style.display =
      "block";

  }

};



/* =====================================
   BUSCA
===================================== */

window.buscarDados =
async function() {


  const texto =
    document
      .getElementById("busca")
      .value
      .trim()
      .toLowerCase();



  try {


    const [
      lojasSnap,
      editorasSnap,
      contatosSnap

    ] = await Promise.all([


      getDocs(
        collection(
          db,
          "lojas"
        )
      ),


      getDocs(
        collection(
          db,
          "editoras"
        )
      ),


      getDocs(
        collection(
          db,
          "contatos"
        )
      )


    ]);



    lojas = [];

    editoras = [];

    contatos = [];



    lojasSnap.forEach(
      item => {


        const dado =
          item.data();


        dado.id =
          item.id;



        if (
          !texto ||
          JSON.stringify(dado)
          .toLowerCase()
          .includes(texto)
        ) {

          lojas.push(dado);

        }


      }
    );



    editorasSnap.forEach(
      item => {


        const dado =
          item.data();


        dado.id =
          item.id;



        if (
          !texto ||
          JSON.stringify(dado)
          .toLowerCase()
          .includes(texto)
        ) {

          editoras.push(dado);

        }


      }
    );



    contatosSnap.forEach(
      item => {


        const dado =
          item.data();


        dado.id =
          item.id;



        if (
          !texto ||
          JSON.stringify(dado)
          .toLowerCase()
          .includes(texto)
        ) {

          contatos.push(dado);

        }


      }
    );



    renderLojas();

    renderEditoras();

    renderContatos();


  }


  catch(error) {

    console.error(error);

    alert(
      "Erro ao buscar dados."
    );

  }


};
/* =====================================
   RENDER LOJAS
===================================== */

function renderLojas() {


  const div =
    document.getElementById(
      "listaLojas"
    );



  if (!div)
    return;



  if (lojas.length === 0) {


    div.innerHTML =
      "<p>Nenhuma loja encontrada.</p>";


    return;

  }




  div.innerHTML =
    lojas.map(

      loja => `


      <div class="email">


        <div>


          <strong>
            ${loja.nome}
          </strong>


          <br>


          Número:
          ${loja.numero}


          <br>


          CNPJ:
          ${loja.cnpj || "-"}


        </div>



        <div>


          <button
            onclick="editarLoja('${loja.id}')"
            title="Editar"
          >

            ✏️

          </button>



          <button
            onclick="excluirLoja('${loja.id}')"
            title="Excluir"
          >

            🗑️

          </button>


        </div>


      </div>


      `

    ).join("");



}






/* =====================================
   EDITAR LOJA
===================================== */

window.editarLoja =
function(id) {


  const loja =
    lojas.find(
      item =>
      item.id === id
    );



  if (!loja)
    return;



  lojaEditando =
    id;



  const numero =
    prompt(
      "Número da loja:",
      loja.numero
    );



  if (numero === null)
    return;




  const nome =
    prompt(
      "Nome da loja:",
      loja.nome
    );



  if (nome === null)
    return;




  const cnpj =
    prompt(
      "CNPJ da loja:",
      loja.cnpj || ""
    );



  if (cnpj === null)
    return;



  salvarEdicaoLoja(
    id,
    {
      numero,
      nome,
      cnpj
    }
  );



};






/* =====================================
   SALVAR EDIÇÃO LOJA
===================================== */

async function salvarEdicaoLoja(
  id,
  dados
) {


  try {


    await updateDoc(

      doc(
        db,
        "lojas",
        id
      ),

      dados

    );



    alert(
      "Loja atualizada com sucesso!"
    );



    buscarDados();



  }


  catch(error) {


    console.error(error);


    alert(
      "Erro ao atualizar loja."
    );


  }


}






/* =====================================
   EXCLUIR LOJA
===================================== */

window.excluirLoja =
async function(id) {



  const confirmar =
    confirm(
      "Deseja realmente excluir esta loja?"
    );



  if (!confirmar)
    return;



  try {


    await deleteDoc(

      doc(
        db,
        "lojas",
        id
      )

    );



    alert(
      "Loja excluída com sucesso!"
    );



    buscarDados();



  }


  catch(error) {


    console.error(error);


    alert(
      "Erro ao excluir loja."
    );


  }


};
/* =====================================
   RENDER EDITORAS
===================================== */

function renderEditoras() {


  const div =
    document.getElementById(
      "listaEditoras"
    );



  if (!div)
    return;



  if (editoras.length === 0) {


    div.innerHTML =
      "<p>Nenhuma editora encontrada.</p>";


    return;

  }




  div.innerHTML =
    editoras.map(

      editora => `


      <div class="email">


        <div>


          <strong>
            ${editora.nome}
          </strong>


          <br>


          CNPJ:
          ${editora.cnpj}


        </div>



        <div>


          <button
            onclick="editarEditora('${editora.id}')"
            title="Editar"
          >

            ✏️

          </button>



          <button
            onclick="excluirEditora('${editora.id}')"
            title="Excluir"
          >

            🗑️

          </button>


        </div>


      </div>


      `

    ).join("");



}






/* =====================================
   RENDER CONTATOS
===================================== */

function renderContatos() {


  const div =
    document.getElementById(
      "listaContatos"
    );



  if (!div)
    return;



  if (contatos.length === 0) {


    div.innerHTML =
      "<p>Nenhum contato encontrado.</p>";


    return;

  }





  div.innerHTML =
    contatos.map(

      contato => `


      <div class="email">


        <div>


          <strong>
            ${contato.email}
          </strong>


          <br>


          Loja:
          ${contato.loja}


          <br>


          Editora:
          ${contato.editora}


          <br>


          Nome:
          ${contato.nome || "-"}


        </div>




        <div>


          <button
            onclick="editarContato('${contato.id}')"
            title="Editar"
          >

            ✏️

          </button>



          <button
            onclick="excluirContato('${contato.id}')"
            title="Excluir"
          >

            🗑️

          </button>


        </div>


      </div>


      `

    ).join("");



}







/* =====================================
   EDITAR EDITORA
===================================== */

window.editarEditora =
function(id) {


  const editora =
    editoras.find(
      item =>
      item.id === id
    );



  if (!editora)
    return;



  const nome =
    prompt(
      "Nome da editora:",
      editora.nome
    );



  if (nome === null)
    return;




  const cnpj =
    prompt(
      "CNPJ da editora:",
      editora.cnpj
    );



  if (cnpj === null)
    return;



  salvarEdicaoEditora(
    id,
    {
      nome,
      cnpj
    }
  );


};







/* =====================================
   SALVAR EDITORA
===================================== */

async function salvarEdicaoEditora(
  id,
  dados
) {


  try {


    await updateDoc(

      doc(
        db,
        "editoras",
        id
      ),

      dados

    );



    alert(
      "Editora atualizada com sucesso!"
    );



    buscarDados();



  }


  catch(error) {


    console.error(error);


    alert(
      "Erro ao atualizar editora."
    );


  }


}







/* =====================================
   EXCLUIR EDITORA
===================================== */

window.excluirEditora =
async function(id) {


  const confirmar =
    confirm(
      "Deseja realmente excluir esta editora?"
    );



  if (!confirmar)
    return;




  try {


    await deleteDoc(

      doc(
        db,
        "editoras",
        id
      )

    );



    alert(
      "Editora excluída com sucesso!"
    );



    buscarDados();



  }


  catch(error) {


    console.error(error);


    alert(
      "Erro ao excluir editora."
    );


  }


};



/* =====================================
   EDITAR CONTATO
===================================== */

window.editarContato =
function(id) {


  const contato =
    contatos.find(
      item =>
      item.id === id
    );



  if (!contato)
    return;



  const email =
    prompt(
      "Novo e-mail do contato:",
      contato.email
    );



  if (email === null)
    return;




  const nome =
    prompt(
      "Nome do contato:",
      contato.nome || ""
    );



  if (nome === null)
    return;




  alert(
    "A edição individual de contatos será concluída na próxima etapa, com a opção de alterar somente este registro ou todas as ocorrências."
  );


};







/* =====================================
   EXCLUIR CONTATO
===================================== */

window.excluirContato =
async function(id) {


  const confirmar =
    confirm(
      "Deseja excluir este contato?"
    );



  if (!confirmar)
    return;




  alert(
    "A exclusão individual de contatos será concluída junto com a regra de exclusão em massa."
  );


};
/* =====================================
   INICIALIZAÇÃO
===================================== */


document.addEventListener(
  "DOMContentLoaded",
  () => {


    mostrarAbaAlteracao(
      "lojas"
    );


    buscarDados();



  }
);
