import { db } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";



/* =====================================
   ESTADO
===================================== */


let emailsAtuais = [];





/* =====================================
   PESQUISA
===================================== */


window.pesquisar =
async function(){


  const loja =
    document
      .getElementById("loja")
      .value
      .trim();



  const editoraInput =
    document
      .getElementById("editora")
      .value
      .trim()
      .toLowerCase();




  if(
    !loja ||
    !editoraInput
  ){

    alert(
      "Preencha a loja e a editora."
    );

    return;

  }





  emailsAtuais = [];




  try{



    const [
      contatosSnap,
      editorasSnap
    ] =
    await Promise.all([


      getDocs(
        collection(
          db,
          "contatos"
        )
      ),



      getDocs(
        collection(
          db,
          "editoras"
        )
      )



    ]);






    const editorasValidas = [];




    editorasSnap.forEach(
      documento=>{


        const dados =
          documento.data();




        if(

          dados.nome
            ?.toLowerCase()
            === editoraInput

          ||

          dados.cnpj
            === editoraInput

        ){


          editorasValidas.push(
            dados.cnpj
          );


        }



      }
    );





    if(
      editorasValidas.length === 0
    ){


      document
        .getElementById("resultado")
        .innerHTML =
        "<p>❌ Editora não encontrada.</p>";



      return;


    }







    contatosSnap.forEach(
      documento=>{


        const contato =
          documento.data();




        if(

          contato.loja
            === loja

          &&

          editorasValidas.includes(
            contato.editora
          )

        ){


          emailsAtuais.push(
            contato.email
          );


        }




      }
    );






    renderResultado();





  }


  catch(err){


    console.error(err);


    alert(
      "Erro ao consultar o banco de dados."
    );



  }



};







/* =====================================
   RESULTADO
===================================== */


function renderResultado(){


  const div =
    document.getElementById(
      "resultado"
    );



  if(
    emailsAtuais.length === 0
  ){


    div.innerHTML =
      "<p>⚠️ Nenhum contato encontrado.</p>";



    return;


  }







  let html = `


    <button onclick="copiarTodos()">

      📋 Copiar todos

    </button>


    <br><br>


  `;







  emailsAtuais.forEach(
    email=>{


      html += `


        <div class="email">


          <span>
            ${email}
          </span>



          <button onclick="copiar('${email}')">

            📋

          </button>



        </div>



      `;



    }
  );







  div.innerHTML =
    html;



}







/* =====================================
   COPIAR
===================================== */


window.copiar =
async function(email){


  try{


    await navigator.clipboard.writeText(
      email
    );



    alert(
      "E-mail copiado!"
    );



  }


  catch{


    alert(
      "Não foi possível copiar."
    );


  }



};







/* =====================================
   COPIAR TODOS
===================================== */


window.copiarTodos =
async function(){



  if(
    emailsAtuais.length === 0
  )
    return;





  try{



    await navigator.clipboard.writeText(

      emailsAtuais.join(";")

    );



    alert(
      "Todos os e-mails foram copiados!"
    );



  }


  catch{


    alert(
      "Não foi possível copiar."
    );



  }



};
