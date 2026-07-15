import { db } from "./firebase-config.js";

import { auth } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";


import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  limit
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";



/* =====================================
   CONTROLE DE ADMIN
===================================== */


const ADMIN_EMAIL =
  "acertoscentralizados@gmail.com";


const painel =
  document.getElementById("painel");



onAuthStateChanged(
  auth,
  (user)=>{


    if(!painel)
      return;



    if(
      user &&
      user.email.toLowerCase()
      === ADMIN_EMAIL.toLowerCase()
    ){

      painel.style.display =
        "block";


    }

    else{


      painel.style.display =
        "none";


    }


  }
);




/* =====================================
   ABAS
===================================== */


window.mostrarAba =
function(aba){


  document
    .querySelectorAll(".aba")
    .forEach(
      elemento=>{

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
   LOJAS
===================================== */


window.salvarLoja =
async function(){


  const numero =
    document
      .getElementById("numeroLoja")
      .value
      .trim();


  const nome =
    document
      .getElementById("nomeLoja")
      .value
      .trim();


  const cnpj =
    document
      .getElementById("cnpjLoja")
      .value
      .trim();




  if(
    !numero ||
    !nome ||
    !cnpj
  ){

    alert(
      "Preencha número, nome e CNPJ da loja."
    );

    return;

  }




  try{


    const existeNumero =
      await getDocs(

        query(

          collection(
            db,
            "lojas"
          ),

          where(
            "numero",
            "==",
            numero
          ),

          limit(1)

        )

      );



    if(!existeNumero.empty){

      alert(
        "Já existe uma loja com esse número."
      );

      return;

    }




    const existeCnpj =
      await getDocs(

        query(

          collection(
            db,
            "lojas"
          ),

          where(
            "cnpj",
            "==",
            cnpj
          ),

          limit(1)

        )

      );



    if(!existeCnpj.empty){

      alert(
        "Já existe uma loja com esse CNPJ."
      );

      return;

    }




    await addDoc(

      collection(
        db,
        "lojas"
      ),

      {

        numero,
        nome,
        cnpj

      }

    );



    alert(
      "Loja cadastrada com sucesso!"
    );



    document.getElementById(
      "numeroLoja"
    ).value = "";



    document.getElementById(
      "nomeLoja"
    ).value = "";



    document.getElementById(
      "cnpjLoja"
    ).value = "";



  }


  catch(err){


    console.error(err);


    alert(
      "Erro ao salvar loja."
    );


  }


};






/* =====================================
   EDITORAS
===================================== */


window.salvarEditora =
async function(){



  const cnpj =
    document
      .getElementById("cnpjEditora")
      .value
      .trim();


  const nome =
    document
      .getElementById("nomeEditora")
      .value
      .trim();




  if(
    !cnpj ||
    !nome
  ){

    alert(
      "Preencha todos os campos."
    );

    return;

  }




  try{


    const existe =
      await getDocs(

        query(

          collection(
            db,
            "editoras"
          ),

          where(
            "cnpj",
            "==",
            cnpj
          ),

          limit(1)

        )

      );



    if(!existe.empty){

      alert(
        "Já existe uma editora com esse CNPJ."
      );

      return;

    }




    await addDoc(

      collection(
        db,
        "editoras"
      ),

      {

        cnpj,
        nome

      }

    );



    alert(
      "Editora cadastrada com sucesso!"
    );



    document.getElementById(
      "cnpjEditora"
    ).value = "";



    document.getElementById(
      "nomeEditora"
    ).value = "";



  }


  catch(err){


    console.error(err);


    alert(
      "Erro ao salvar editora."
    );


  }


};

