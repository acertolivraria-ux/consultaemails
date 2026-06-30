const dados = [

{

editora:"Abril",

cnpj:"12345678000100",

lojas:["001","002","003"],

emails:[

"comercial@abril.com.br",

"financeiro@abril.com.br",

"suporte@abril.com.br"

]

},

{

editora:"Moderna",

cnpj:"99888777000199",

lojas:["010","011"],

emails:[

"contato@moderna.com.br"

]

}

];

document

.getElementById("btnPesquisar")

.addEventListener("click",pesquisar);
function pesquisar(){

const loja=document.getElementById("loja").value;

const editora=document.getElementById("editora").value.toLowerCase();

}
const resultado=dados.find(item=>{

return(

item.lojas.includes(loja)

&&

(

item.editora.toLowerCase()==editora

||

item.cnpj==editora

)

);

});
if(resultado){

}
let html="";

resultado.emails.forEach(email=>{

html+=`

<div class="email">

<span>${email}</span>

<button onclick="copiar('${email}')">

📋

</button>

</div>

`;

});
html+=`

<button onclick="copiarTodos()">

📋 Copiar todos

</button>

`;
function copiar(email){

navigator.clipboard.writeText(email);

alert("Copiado!");

}
function copiarTodos(){

const texto=resultado.emails.join(";");

navigator.clipboard.writeText(texto);

alert("Todos os e-mails foram copiados.");

}
