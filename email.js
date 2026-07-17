import { db, auth } from "./firebase-config.js";

import {
  collection,
  getDocs,
  addDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";



/* =====================================
   ESTADO
===================================== */


let lojas = [];
let editoras = [];
let modelos = [];
let operadores = [];

let usuarioAtual = null;





/* =====================================
   UTILIDADES
===================================== */


function formatarNome(nome){

  if(!nome)
    return "";

  return nome
    .toLowerCase()
    .split(" ")
    .map(
      palavra =>
        palavra.charAt(0).toUpperCase()
        +
        palavra.slice(1)
    )
    .join(" ");

}



function saudacao(){

  const hora =
    new Date().getHours();


  return hora < 18
    ? "Bom dia"
    : "Boa tarde";

}





function substituirCampos(
  texto,
  dados
){


  let resultado = texto;


  Object.keys(dados)
  .forEach(chave=>{


    resultado =
      resultado.replaceAll(
        `(${chave})`,
        dados[chave] || ""
      );


  });


  return resultado;


}







/* =====================================
   LOGIN
===================================== */


onAuthStateChanged(
auth,
(user)=>{

  usuarioAtual = user;


});







/* =====================================
   CARREGAR DADOS
===================================== */


async function carregarDados(){


const [
 lojasSnap,
 editorasSnap,
 modelosSnap,
 operadoresSnap
]

=
await Promise.all([


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
"modelosEmail"
)
),


getDocs(
collection(
db,
"operadores"
)
)


]);





lojas = [];

editoras = [];

modelos = [];

operadores = [];





lojasSnap.forEach(doc=>{

lojas.push({

id:doc.id,
...doc.data()

});


});





editorasSnap.forEach(doc=>{

editoras.push({

id:doc.id,
...doc.data()

});


});





modelosSnap.forEach(doc=>{


modelos.push({

id:doc.id,
...doc.data()

});


});





operadoresSnap.forEach(doc=>{


operadores.push({

id:doc.id,
...doc.data()

});


});




preencherSelects();


}








/* =====================================
   SELECTS
===================================== */


function preencherSelects(){


const selectLoja =
document.getElementById(
"emailLoja"
);


const selectEditora =
document.getElementById(
"emailEditora"
);


const selectMotivo =
document.getElementById(
"emailMotivo"
);




if(selectLoja){


selectLoja.innerHTML =
`
<option value="">
Selecione a loja
</option>
`;


lojas.forEach(loja=>{


selectLoja.innerHTML +=
`
<option value="${loja.numero}">
${loja.numero} - ${loja.nome}
</option>
`;


});


}






if(selectEditora){


selectEditora.innerHTML =
`
<option value="">
Selecione a editora
</option>
`;


editoras.forEach(editora=>{


selectEditora.innerHTML +=
`
<option value="${editora.cnpj}">
${editora.nome}
</option>
`;


});


}







if(selectMotivo){


selectMotivo.innerHTML =
`
<option value="">
Selecione o motivo
</option>
`;


modelos.forEach(modelo=>{


selectMotivo.innerHTML +=
`
<option value="${modelo.id}">
${modelo.motivo}
</option>
`;


});


}



}









/* =====================================
   GERAR EMAIL
===================================== */


window.gerarEmail =
function(){



const lojaNumero =
document.getElementById(
"emailLoja"
).value;



const editoraCnpj =
document.getElementById(
"emailEditora"
).value;



const modeloId =
document.getElementById(
"emailMotivo"
).value;





const loja =
lojas.find(
item =>
item.numero === lojaNumero
);




const editora =
editoras.find(
item =>
item.cnpj === editoraCnpj
);





const modelo =
modelos.find(
item =>
item.id === modeloId
);





if(
!loja ||
!editora ||
!modelo
){

alert(
"Preencha todos os campos."
);

return;

}






const dados = {


"EDITORA":
formatarNome(
editora.nome
),


"LOJA":
formatarNome(
loja.nome
),


"CNPJ":
loja.cnpj,


"NUMERO DA LOJA":
loja.numero


};






let corpo =
substituirCampos(
modelo.corpo,
dados
);




corpo =
saudacao()
+
"!\n\n"
+
corpo;





document.getElementById(
"emailAssunto"
).value =
modelo.titulo;





document.getElementById(
"emailCorpo"
).value =
corpo;



};









/* =====================================
   COPIAR EMAIL
===================================== */


window.copiarEmail =
async function(){



const assunto =
document.getElementById(
"emailAssunto"
).value;


const corpo =
document.getElementById(
"emailCorpo"
).value;




await navigator.clipboard.writeText(

`Assunto: ${assunto}

${corpo}`

);




alert(
"E-mail copiado."
);



};









/* =====================================
   SALVAR DIVERGÊNCIA
===================================== */


window.salvarDivergencia =
async function(){



const loja =
document.getElementById(
"emailLoja"
).value;


const editora =
document.getElementById(
"emailEditora"
).value;


const assunto =
document.getElementById(
"emailAssunto"
).value;




await addDoc(

collection(
db,
"divergencias"
),

{


loja,

editora,

assunto,


status:
"EM ANDAMENTO",


dataEnvio:
new Date(),


operador:
usuarioAtual?.email || "",


resolvido:false,


motivoNaoResolvido:"",


observacoes:"",


ultimaResposta:"",


dataResolucao:null,


linkEmail:""


}


);




alert(
"Divergência registrada."
);



};








document.addEventListener(
"DOMContentLoaded",
()=>{


carregarDados();


});
