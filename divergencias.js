import { db, auth } from "./firebase-config.js";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";



/* =====================================
   CONFIGURAÇÃO
===================================== */


const ADMIN_EMAIL =
"acertoscentralizados@gmail.com";



let usuarioAtual = null;

let divergencias = [];

let divergenciaSelecionada = null;

let filtroAtual = "todas";








/* =====================================
   VERIFICAR ADMIN
===================================== */


function usuarioEhAdmin(){


if(
!usuarioAtual ||
!usuarioAtual.email
)
return false;



return (

usuarioAtual.email.toLowerCase()
===
ADMIN_EMAIL.toLowerCase()

);


}








/* =====================================
   LOGIN
===================================== */


onAuthStateChanged(

auth,

(user)=>{


usuarioAtual = user;



if(!user){

window.location.href =
"index.html";

return;

}



carregarDivergencias();



}

);









/* =====================================
   CARREGAR
===================================== */


async function carregarDivergencias(){



try{



let snap;



if(
usuarioEhAdmin()
){


snap =
await getDocs(

query(

collection(
db,
"divergencias"
),

orderBy(
"dataEnvio",
"desc"
)

)

);


}



else{


snap =
await getDocs(

query(

collection(
db,
"divergencias"
),

where(
"operador",
"==",
usuarioAtual.email
)


)

);


}





divergencias = [];



snap.forEach(item=>{


divergencias.push({

id:item.id,

...item.data()

});


});




renderizar();



}


catch(error){


console.error(error);


alert(
"Erro ao carregar divergências."
);


}



}









/* =====================================
   FILTRO
===================================== */


window.filtrarDivergencias =
function(status){



filtroAtual =
status;



renderizar();



};









/* =====================================
   RENDER
===================================== */


function renderizar(){


const div =
document.getElementById(
"listaDivergencias"
);



if(!div)
return;





let lista =
divergencias;





if(
filtroAtual !== "todas"
){


lista =
lista.filter(

item =>
item.status === filtroAtual

);


}







if(
lista.length === 0
){


div.innerHTML =
`

<p>
Nenhuma divergência encontrada.
</p>

`;


return;


}









div.innerHTML =

lista.map(item=>{



return `


<div class="email">


<div>


<strong>

📌 ${item.assunto}

</strong>


<br>


Loja:
${item.loja}


<br>


Editora:
${item.editora}



<br>


Status:
<b>
${item.status}
</b>



<br>


Enviado em:

${formatarData(item.dataEnvio)}



<br>


Operador:

${item.operador}



</div>




<div>


<button

onclick="editarDivergencia('${item.id}')"

>

✏️

</button>



</div>


</div>


`;



}).join("");



}









/* =====================================
   FORMATAR DATA
===================================== */


function formatarData(data){



if(!data)
return "-";



try{


if(
data.seconds
){


return new Date(
data.seconds * 1000
)
.toLocaleDateString(
"pt-BR"
);


}



return new Date(data)
.toLocaleDateString(
"pt-BR"
);



}

catch{

return "-";

}


}









/* =====================================
   ABRIR MODAL
===================================== */


window.editarDivergencia =
function(id){



const item =
divergencias.find(
d =>
d.id === id
);



if(!item)
return;



divergenciaSelecionada =
item;






document.getElementById(
"editStatus"
).value =
item.status || "EM ANDAMENTO";



document.getElementById(
"editLinkEmail"
).value =
item.linkEmail || "";



document.getElementById(
"editResolvido"
).value =
String(
item.resolvido || false
);



document.getElementById(
"editMotivo"
).value =
item.motivoNaoResolvido || "";



document.getElementById(
"editObservacoes"
).value =
item.observacoes || "";



document.getElementById(
"editUltimaResposta"
).value =
item.ultimaResposta || "";



document.getElementById(
"editDataResolucao"
).value =
item.dataResolucao || "";





document.getElementById(
"modalDivergencia"
).style.display =
"flex";



};









/* =====================================
   FECHAR MODAL
===================================== */


window.fecharModal =
function(){


document.getElementById(
"modalDivergencia"
).style.display =
"none";


divergenciaSelecionada =
null;


};









/* =====================================
   SALVAR ALTERAÇÃO
===================================== */


window.salvarAlteracaoDivergencia =
async function(){



if(
!divergenciaSelecionada
)
return;





try{



const id =
divergenciaSelecionada.id;





await updateDoc(

doc(
db,
"divergencias",
id
),

{


status:

document.getElementById(
"editStatus"
).value,



linkEmail:

document.getElementById(
"editLinkEmail"
).value,



resolvido:

document.getElementById(
"editResolvido"
).value
===
"true",



motivoNaoResolvido:

document.getElementById(
"editMotivo"
).value,



observacoes:

document.getElementById(
"editObservacoes"
).value,



ultimaResposta:

document.getElementById(
"editUltimaResposta"
).value,



dataResolucao:

document.getElementById(
"editDataResolucao"
).value
|| null,



ultimaAtualizacao:

new Date()


}


);




alert(
"Divergência atualizada."
);




fecharModal();



carregarDivergencias();



}


catch(error){


console.error(error);


alert(
"Erro ao atualizar divergência."
);


}



};
