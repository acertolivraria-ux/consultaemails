import { db, auth } from "./firebase-config.js";


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
   CONFIGURAÇÃO
===================================== */


const ADMIN_EMAIL =
"acertoscentralizados@gmail.com";



const painel =
document.getElementById(
  "painel"
);



/* =====================================
   SEGURANÇA ADMIN
===================================== */


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



});





/* =====================================
   ABAS
===================================== */


window.mostrarAba =
function(aba){



document
.querySelectorAll(".aba")
.forEach(
(elemento)=>{


  elemento.style.display =
  "none";


});




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
   FUNÇÃO AUXILIAR EMAILS
===================================== */


function separarEmails(texto){


if(!texto)
return [];



return texto
.split(";")
.map(
email =>
email.trim()
)
.filter(
email =>
email
);



}







/* =====================================
   LOJAS
===================================== */



window.salvarLoja =
async function(){



const numero =
document
.getElementById(
"numeroLoja"
)
.value
.trim();



const nome =
document
.getElementById(
"nomeLoja"
)
.value
.trim();



const cnpj =
document
.getElementById(
"cnpjLoja"
)
.value
.trim();



const emails =
separarEmails(

document
.getElementById(
"emailsLoja"
)
.value

);





if(
!numero ||
!nome ||
!cnpj
){


alert(
"Preencha número, nome e CNPJ."
);


return;


}





try{



const existente =
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





if(!existente.empty){


alert(
"Já existe uma loja com esse número."
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

cnpj,

emails


}


);




alert(
"Loja cadastrada com sucesso!"
);



limparCampos([

"numeroLoja",

"nomeLoja",

"cnpjLoja",

"emailsLoja"

]);



}



catch(error){


console.error(error);


alert(
"Erro ao cadastrar loja."
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
.getElementById(
"cnpjEditora"
)
.value
.trim();




const nome =
document
.getElementById(
"nomeEditora"
)
.value
.trim();




const emails =
separarEmails(

document
.getElementById(
"emailsEditora"
)
.value

);






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



const existente =
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




if(!existente.empty){


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

nome,

emails


}


);





alert(
"Editora cadastrada com sucesso!"
);




limparCampos([

"cnpjEditora",

"nomeEditora",

"emailsEditora"

]);



}



catch(error){


console.error(error);


alert(
"Erro ao cadastrar editora."
);


}



};
/* =====================================
   OPERADORES
===================================== */


window.salvarOperador =
async function(){


const nome =
document
.getElementById(
"nomeOperador"
)
.value
.trim();



const email =
document
.getElementById(
"emailOperador"
)
.value
.trim()
.toLowerCase();




if(
!nome ||
!email
){


alert(
"Preencha nome e e-mail do operador."
);


return;


}





try{


const existente =
await getDocs(

query(

collection(
db,
"operadores"
),


where(
"email",
"==",
email
),

limit(1)

)

);





if(!existente.empty){


alert(
"Já existe um operador cadastrado com este e-mail."
);


return;


}





await addDoc(

collection(
db,
"operadores"
),

{


nome,

email,

ativo:true,

permissao:
"operador"


}


);





alert(
"Operador cadastrado com sucesso!"
);



limparCampos([

"nomeOperador",

"emailOperador"

]);



carregarOperadores();



}


catch(error){


console.error(error);


alert(
"Erro ao cadastrar operador."
);



}



};









/* =====================================
   CARREGAR OPERADORES
===================================== */


async function carregarOperadores(){



const select =
document.getElementById(
"operadorAssinatura"
);




if(!select)
return;




select.innerHTML =
`

<option value="">
Selecione o operador
</option>

`;




const snapshot =
await getDocs(

collection(
db,
"operadores"
)

);





snapshot.forEach(
(documento)=>{


const operador =
documento.data();





const option =
document.createElement(
"option"
);



option.value =
documento.id;



option.textContent =
operador.nome;



select.appendChild(
option
);



});



}









/* =====================================
   ASSINATURAS
===================================== */


window.salvarAssinatura =
async function(){



const operadorId =
document
.getElementById(
"operadorAssinatura"
)
.value;



const texto =
document
.getElementById(
"textoAssinatura"
)
.value
.trim();






if(
!operadorId ||
!texto
){


alert(
"Selecione o operador e informe a assinatura."
);


return;


}







try{



const operadorDoc =
await getDocs(

query(

collection(
db,
"operadores"
)


)

);




let nomeOperador = "";



operadorDoc.forEach(
(item)=>{


if(
item.id === operadorId
){


nomeOperador =
item.data().nome;


}



});







await addDoc(

collection(
db,
"assinaturas"
),

{


operadorId,

nome:
nomeOperador,

texto


}

);






alert(
"Assinatura cadastrada com sucesso!"
);





limparCampos([

"textoAssinatura"

]);




}



catch(error){


console.error(error);


alert(
"Erro ao cadastrar assinatura."
);



}



};









/* =====================================
   LIMPEZA DE CAMPOS
===================================== */


function limparCampos(lista){


lista.forEach(
(id)=>{


const campo =
document.getElementById(
id
);



if(campo){


campo.value =
"";


}



});


}





/* =====================================
   INICIALIZAÇÃO
===================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{


carregarOperadores();


}
);
/* =====================================
   MODELOS DE EMAIL
===================================== */


window.salvarModeloEmail =
async function(){



const motivo =
document
.getElementById(
"motivoEmail"
)
.value
.trim();




const titulo =
document
.getElementById(
"tituloEmail"
)
.value
.trim();




const corpo =
document
.getElementById(
"corpoEmail"
)
.value
.trim();





const destinoLoja =
document
.getElementById(
"destinoLoja"
)
.checked;




const destinoEditora =
document
.getElementById(
"destinoEditora"
)
.checked;






if(
!motivo ||
!titulo ||
!corpo
){


alert(
"Preencha motivo, título e corpo do e-mail."
);


return;


}






if(
!destinoLoja &&
!destinoEditora
){


alert(
"Selecione pelo menos um destinatário."
);


return;


}







try{



await addDoc(

collection(
db,
"emailsPadrao"
),

{


motivo,

titulo,

corpo,


destinatarios:{


loja:
destinoLoja,


editora:
destinoEditora


}



}

);






alert(
"Modelo de e-mail cadastrado com sucesso!"
);





limparCampos([

"motivoEmail",

"tituloEmail",

"corpoEmail"

]);




document
.getElementById(
"destinoLoja"
)
.checked =
false;




document
.getElementById(
"destinoEditora"
)
.checked =
false;



}



catch(error){


console.error(error);


alert(
"Erro ao cadastrar modelo."
);



}



};









/* =====================================
   VALIDAÇÃO DE ACESSO
===================================== */


function usuarioEhAdmin(){



const user =
auth.currentUser;




return (

user &&

user.email.toLowerCase()
===
ADMIN_EMAIL.toLowerCase()

);



}







/* =====================================
   CARREGAR DADOS INICIAIS
===================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{



if(
usuarioEhAdmin()
){


carregarOperadores();


}




}
);
