import { db } from "./firebase-config.js";
import { auth } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";



/* =====================================
   CONFIGURAÇÃO
===================================== */


const ADMIN_EMAIL =
  "acertoscentralizados@gmail.com";



let lojas = [];
let editoras = [];
let contatos = [];







/* =====================================
   SEGURANÇA
===================================== */


onAuthStateChanged(
  auth,
  user => {


    if(
      !user ||
      user.email.toLowerCase()
      !== ADMIN_EMAIL.toLowerCase()
    ){


      window.location.href =
        "index.html";


    }


  }
);







/* =====================================
   ABAS
===================================== */


window.mostrarAbaAlteracao =
function(aba){


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



  if(alvo){

    alvo.style.display =
      "block";

  }



};








/* =====================================
   BUSCA
===================================== */


window.buscarDados =
async function(){



  const texto =
    document
      .getElementById("busca")
      .value
      .trim()
      .toLowerCase();




  try{



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
      doc => {


        const dado =
          doc.data();



        dado.id =
          doc.id;



        if(

          !texto ||

          JSON.stringify(dado)
          .toLowerCase()
          .includes(texto)

        ){

          lojas.push(dado);

        }


      }
    );







    editorasSnap.forEach(
      doc => {


        const dado =
          doc.data();



        dado.id =
          doc.id;



        if(

          !texto ||

          JSON.stringify(dado)
          .toLowerCase()
          .includes(texto)

        ){

          editoras.push(dado);

        }



      }
    );







    contatosSnap.forEach(
      doc => {


        const dado =
          doc.data();



        dado.id =
          doc.id;



        if(

          !texto ||

          JSON.stringify(dado)
          .toLowerCase()
          .includes(texto)

        ){

          contatos.push(dado);

        }



      }
    );





    renderLojas();

    renderEditoras();

    renderContatos();




  }


  catch(err){


    console.error(err);


    alert(
      "Erro ao buscar informações."
    );


  }



};








/* =====================================
   RENDER LOJAS
===================================== */


function renderLojas(){


  const div =
    document.getElementById(
      "listaLojas"
    );



  if(
    lojas.length === 0
  ){

    div.innerHTML =
      "<p>Nenhuma loja encontrada.</p>";

    return;

  }





  div.innerHTML =
    lojas.map(

      loja => `


      <div class="email">


        <span>

        <strong>
        ${loja.nome}
        </strong>

        <br>

        Número:
        ${loja.numero}

        <br>

        CNPJ:
        ${loja.cnpj || "-"}

        </span>



        <div>


        ✏️

        🗑️


        </div>



      </div>


      `

    ).join("");



}








/* =====================================
   RENDER EDITORAS
===================================== */


function renderEditoras(){


  const div =
    document.getElementById(
      "listaEditoras"
    );



  if(
    editoras.length === 0
  ){

    div.innerHTML =
      "<p>Nenhuma editora encontrada.</p>";

    return;

  }




  div.innerHTML =
    editoras.map(

      editora => `


      <div class="email">


        <span>

        <strong>
        ${editora.nome}
        </strong>

        <br>

        CNPJ:
        ${editora.cnpj}

        </span>



        <div>

        ✏️

        🗑️

        </div>



      </div>


      `

    ).join("");



}








/* =====================================
   RENDER CONTATOS
===================================== */


function renderContatos(){


  const div =
    document.getElementById(
      "listaContatos"
    );



  if(
    contatos.length === 0
  ){

    div.innerHTML =
      "<p>Nenhum contato encontrado.</p>";

    return;

  }







  div.innerHTML =
    contatos.map(

      contato => `


      <div class="email">


        <span>


        <strong>
        ${contato.email}
        </strong>


        <br>


        Loja:
        ${contato.loja}


        <br>


        Editora:
        ${contato.editora}



        </span>




        <div>

        ✏️

        🗑️


        </div>



      </div>


      `

    ).join("");



}
