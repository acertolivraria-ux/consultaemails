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
