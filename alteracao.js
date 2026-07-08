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

let abaAtual = "lojas";

function nomeEditora(cnpj) {

  const editora =
    editoras.find(
      item =>
        item.cnpj === cnpj
    );


  return editora
    ? editora.nome
    : cnpj;

}



function nomeLoja(numero) {

  const loja =
    lojas.find(
      item =>
        item.numero === numero
    );


  return loja
    ? loja.nome
    : numero;

}


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
   CONTROLE DE ABAS
===================================== */

window.mostrarAbaAlteracao =
function(aba) {

  abaAtual = aba;


  const campoBusca =
    document.getElementById("busca");


  if (campoBusca) {

    campoBusca.value = "";

  }


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


  limparResultados();

};



function limparResultados() {


  const listas = [

    "listaLojas",
    "listaEditoras",
    "listaContatos"

  ];


  listas.forEach(id => {


    const elemento =
      document.getElementById(id);


    if (elemento) {

      elemento.innerHTML =
        "<p>Nenhuma consulta realizada.</p>";

    }


  });



  const detalhes =
    document.getElementById(
      "detalhesContato"
    );


  if (detalhes) {

    detalhes.innerHTML = "";

    detalhes.style.display =
      "none";

  }


}


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



        const busca =
          (

            dado.nome
            + " "
            + dado.numero
            + " "
            + (dado.cnpj || "")

          )
          .toLowerCase();



        if (
          abaAtual === "lojas"
          &&
          (
            !texto ||
            busca.includes(texto)
          )
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



        const busca =
          (

            dado.nome
            + " "
            + dado.cnpj

          )
          .toLowerCase();



        if (
          abaAtual === "editoras"
          &&
          (
            !texto ||
            busca.includes(texto)
          )
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



        const busca =
          (

            dado.email
            + " "
            + (dado.nome || "")
            + " "
            + dado.loja
            + " "
            + dado.editora

          )
          .toLowerCase();



        if (
          abaAtual === "contatos"
          &&
          (
            !texto ||
            busca.includes(texto)
          )
        ) {

          contatos.push(dado);

        }


      }
    );




    if (abaAtual === "lojas") {

      renderLojas();

    }


    if (abaAtual === "editoras") {

      renderEditoras();

    }


    if (abaAtual === "contatos") {

      renderContatos();

    }



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
            onclick="verDetalhesLoja('${loja.id}')"
            title="Ver detalhes"
          >

            🔎

          </button>



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
   DETALHES DA LOJA
===================================== */


window.verDetalhesLoja =
function(id) {


  const loja =
    lojas.find(
      item =>
      item.id === id
    );


  if (!loja)
    return;




  const vinculados =
    contatos.filter(

      contato =>
        contato.loja === loja.numero

    );




  let html = `

    <h3>
      🏬 ${loja.nome}
    </h3>

  `;



  if (vinculados.length === 0) {


    html +=
      "<p>Nenhum contato vinculado.</p>";


  }

  else {


    const agrupado = {};



    vinculados.forEach(
      contato => {


        if (
          !agrupado[contato.editora]
        ) {

          agrupado[contato.editora] =
            [];

        }


        agrupado[contato.editora]
          .push(contato);


      }
    );




    Object.keys(agrupado)
    .forEach(editora => {


      html += `


      <div style="
        margin-bottom:15px;
        padding:10px;
        border:1px solid var(--border);
        border-radius:8px;
      ">


<strong>
  🏢 Editora:
  ${nomeEditora(editora)}
</strong>


        <ul>

      `;



      agrupado[editora]
      .forEach(contato => {


        html += `


          <li>

            ${
              contato.nome
              ?
              contato.nome + " - "
              :
              ""
            }

            ${contato.email}

          </li>


        `;


      });



      html += `

        </ul>

      </div>

      `;


    });


  }



  mostrarDetalhes(
    html
  );


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
            onclick="verDetalhesEditora('${editora.id}')"
            title="Ver detalhes"
          >

            🔎

          </button>



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
   DETALHES DA EDITORA
===================================== */


window.verDetalhesEditora =
function(id) {


  const editora =
    editoras.find(
      item =>
      item.id === id
    );


  if (!editora)
    return;




  const vinculados =
    contatos.filter(

      contato =>
        contato.editora === editora.cnpj

    );





  let html = `

    <h3>
      🏢 ${editora.nome}
    </h3>

  `;



  if (vinculados.length === 0) {


    html +=
      "<p>Nenhum contato vinculado.</p>";


  }

  else {


    const agrupado = {};



    vinculados.forEach(
      contato => {


        if (
          !agrupado[contato.loja]
        ) {

          agrupado[contato.loja] =
            [];

        }


        agrupado[contato.loja]
          .push(contato);


      }
    );




    Object.keys(agrupado)
    .forEach(loja => {


      html += `


      <div style="
        margin-bottom:15px;
        padding:10px;
        border:1px solid var(--border);
        border-radius:8px;
      ">


<strong>
  🏬 Loja:
  ${nomeLoja(loja)}
</strong>


        <ul>

      `;



      agrupado[loja]
      .forEach(contato => {


        html += `


          <li>

            ${
              contato.nome
              ?
              contato.nome + " - "
              :
              ""
            }

            ${contato.email}

          </li>


        `;


      });



      html += `

        </ul>

      </div>

      `;


    });


  }




  mostrarDetalhes(
    html
  );


};





/* =====================================
   ÁREA DE DETALHES
===================================== */


function mostrarDetalhes(html) {


  const janela =
    document.getElementById(
      "detalhesContato"
    );



  if (!janela)
    return;



  janela.innerHTML = `

    <button
      onclick="fecharDetalhes()"
      style="
        float:right;
        margin-bottom:10px;
      "
    >
      ❌ Fechar
    </button>


    <div style="clear:both;"></div>


    ${html}

  `;



  janela.style.display =
    "block";


}
window.fecharDetalhes =
function() {


  const janela =
    document.getElementById(
      "detalhesContato"
    );


  if(janela){

    janela.innerHTML = "";

    janela.style.display =
      "none";

  }


};
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




  const resumo = {};



  contatos.forEach(
    contato => {


      if (
        !resumo[contato.email]
      ) {


        resumo[contato.email] = {

          nome:
            contato.nome || "",

          ids: [],

          editoras:
            new Set()

        };


      }



      resumo[contato.email]
        .ids
        .push(contato.id);



      resumo[contato.email]
        .editoras
        .add(contato.editora);



    }
  );





  let html = "";



  Object.keys(resumo)
  .forEach(email => {


    const contato =
      resumo[email];



    html += `


    <div class="email">


      <div>


        <strong>
          📧 ${email}
        </strong>


        <br>


        ${
          contato.nome
          ?
          "Nome: " + contato.nome
          :
          ""
        }


        <br>


        Vínculos:
        ${contato.ids.length}


        <br>


        Editoras:
        ${contato.editoras.size}


      </div>




      <div>


        <button
          onclick="verDetalhesContato('${email}')"
          title="Ver detalhes"
        >

          🔎

        </button>



        <button
          onclick="editarContato('${contato.ids[0]}')"
          title="Editar"
        >

          ✏️

        </button>



        <button
          onclick="excluirContato('${contato.ids[0]}')"
          title="Excluir"
        >

          🗑️

        </button>


      </div>


    </div>


    `;


  });




  div.innerHTML =
    html;



}





/* =====================================
   DETALHES DO CONTATO
===================================== */


window.verDetalhesContato =
function(email) {


  const registros =
    contatos.filter(
      contato =>
        contato.email === email
    );



  if (registros.length === 0)
    return;





  let html = `

    <h3>
      📧 ${email}
    </h3>

  `;




  const agrupado = {};



  registros.forEach(
    contato => {


      if (
        !agrupado[contato.editora]
      ) {

        agrupado[contato.editora] =
          [];

      }


      agrupado[contato.editora]
        .push(contato.loja);


    }
  );





  Object.keys(agrupado)
  .forEach(editora => {



    html += `


    <div style="
      margin-bottom:15px;
      padding:10px;
      border:1px solid var(--border);
      border-radius:8px;
    ">


<strong>
  🏢 Editora:
  ${nomeEditora(editora)}
</strong>


      <ul>


    `;




    agrupado[editora]
    .forEach(loja => {


      html += `


<li>
  🏬 Loja:
  ${nomeLoja(loja)}
</li>


      `;


    });




    html += `


      </ul>


    </div>


    `;



  });





  mostrarDetalhes(
    html
  );

};






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


  if(
    !confirm(
      "Deseja realmente excluir esta loja?"
    )
  )
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



  if(nome === null)
    return;




  const cnpj =
    prompt(
      "CNPJ da editora:",
      editora.cnpj
    );



  if(cnpj === null)
    return;



  salvarEdicaoEditora(
    id,
    {
      nome,
      cnpj
    }
  );


};






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


  if(
    !confirm(
      "Deseja realmente excluir esta editora?"
    )
  )
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
   ESCOLHER EDITORA DO CONTATO
===================================== */


function escolherEditoraContato(contato) {


  const editorasContato = [

    ...new Set(

      contatos
      .filter(
        item =>
          item.email === contato.email
      )
      .map(
        item =>
          item.editora
      )

    )

  ];



  if(
    editorasContato.length === 0
  )
    return null;



  if(
    editorasContato.length === 1
  )
    return editorasContato[0];




  let mensagem =
`Selecione a editora:

`;



  editorasContato.forEach(
    (editora, index) => {

      mensagem +=
        `${index + 1} - ${nomeEditora(editora)}\n`;

    }
  );



  const escolha =
    prompt(
      mensagem
    );



  const indice =
    Number(escolha) - 1;



  if(
    !editorasContato[indice]
  ) {

    alert(
      "Opção inválida."
    );

    return null;

  }



  return editorasContato[indice];

}







/* =====================================
   EDITAR CONTATO
===================================== */


window.editarContato =
async function(id) {


  const contato =
    contatos.find(
      item =>
        item.id === id
    );



  if(!contato)
    return;



  const novoEmail =
    prompt(
      "Novo e-mail do contato:",
      contato.email
    );



  if(novoEmail === null)
    return;




  const novoNome =
    prompt(
      "Nome do contato:",
      contato.nome || ""
    );



  if(novoNome === null)
    return;





  const opcao =
    prompt(

`Como deseja aplicar a alteração?

1 - Somente este registro

2 - Todos os registros deste e-mail

3 - Todos os registros deste e-mail em uma editora específica

Digite 1, 2 ou 3:`,

"1"

    );





  let registrosAlterar = [];




  if(opcao === "1") {


    registrosAlterar.push(
      contato
    );


  }




  else if(opcao === "2") {


    registrosAlterar =
      contatos.filter(

        item =>
          item.email === contato.email

      );


  }




  else if(opcao === "3") {


    const editora =
      escolherEditoraContato(
        contato
      );


    if(!editora)
      return;



    registrosAlterar =
      contatos.filter(

        item =>
          item.email === contato.email
          &&
          item.editora === editora

      );


  }



  else {


    alert(
      "Opção inválida."
    );


    return;

  }






  if(
    !confirm(
`Serão alterados:
${registrosAlterar.length} registro(s).

Confirma?`
    )
  )
    return;






  try {


    await Promise.all(

      registrosAlterar.map(

        item =>

        updateDoc(

          doc(
            db,
            "contatos",
            item.id
          ),

          {

            email:
              novoEmail,

            nome:
              novoNome

          }

        )

      )

    );



    alert(
      "Contatos atualizados com sucesso!"
    );



    buscarDados();



  }


  catch(error) {


    console.error(error);


    alert(
      "Erro ao atualizar contatos."
    );


  }


};









/* =====================================
   EXCLUIR CONTATO
===================================== */


window.excluirContato =
async function(id) {


  const contato =
    contatos.find(
      item =>
        item.id === id
    );



  if(!contato)
    return;





  const opcao =
    prompt(

`Como deseja excluir?

1 - Somente este registro

2 - Todos os registros deste e-mail

3 - Todos os registros deste e-mail em uma editora específica

Digite 1, 2 ou 3:`,

"1"

    );






  let registrosExcluir = [];





  if(opcao === "1") {


    registrosExcluir.push(
      contato
    );


  }




  else if(opcao === "2") {


    registrosExcluir =
      contatos.filter(

        item =>
          item.email === contato.email

      );


  }




  else if(opcao === "3") {


    const editora =
      escolherEditoraContato(
        contato
      );


    if(!editora)
      return;



    registrosExcluir =
      contatos.filter(

        item =>
          item.email === contato.email
          &&
          item.editora === editora

      );


  }




  else {


    alert(
      "Opção inválida."
    );


    return;


  }






  if(
    !confirm(

`Confirma a exclusão?

Serão removidos:
${registrosExcluir.length} registro(s).`

    )
  )
    return;






  try {


    await Promise.all(

      registrosExcluir.map(

        item =>

        deleteDoc(

          doc(
            db,
            "contatos",
            item.id
          )

        )

      )

    );



    alert(
      "Contatos excluídos com sucesso!"
    );



    buscarDados();



  }


  catch(error) {


    console.error(error);


    alert(
      "Erro ao excluir contatos."
    );


  }


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


  }
);
