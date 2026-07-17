import { auth, db } from "./firebase-config.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";


import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";



/* =====================================
   CONFIGURAÇÃO
===================================== */


const ADMIN_EMAIL =
  "acertoscentralizados@gmail.com";



let usuarioAtual = null;

let operadorAtual = null;



/* =====================================
   ELEMENTOS
===================================== */


const adminToggle =
  document.getElementById(
    "adminToggle"
  );


const adminDropdown =
  document.getElementById(
    "adminDropdown"
  );



const profileToggle =
  document.getElementById(
    "profileToggle"
  );


const profileDropdown =
  document.getElementById(
    "profileDropdown"
  );



const loginForm =
  document.getElementById(
    "loginForm"
  );


const logoutBox =
  document.getElementById(
    "logoutBox"
  );


const loginStatus =
  document.getElementById(
    "loginStatus"
  );


const loginBtn =
  document.getElementById(
    "loginBtn"
  );



/* =====================================
   VERIFICA ADMIN
===================================== */


function isAdmin(user){


  if(
    !user ||
    !user.email
  )
    return false;



  return (
    user.email.toLowerCase()
    ===
    ADMIN_EMAIL.toLowerCase()
  );


}




/* =====================================
   BUSCAR OPERADOR
===================================== */


async function buscarOperador(email){


  try{


    const q =
      query(

        collection(
          db,
          "operadores"
        ),

        where(
          "email",
          "==",
          email
        )

      );



    const snap =
      await getDocs(q);



    if(
      snap.empty
    )
      return null;




    const dados =
      snap.docs[0].data();



    if(
      dados.ativo === false
    )
      return null;



    return {

      id:
        snap.docs[0].id,

      ...dados

    };



  }


  catch(error){


    console.error(
      error
    );


    return null;


  }


}





/* =====================================
   DROPDOWNS
===================================== */


if(
  adminToggle &&
  adminDropdown
){


  adminToggle.addEventListener(
    "click",
    e=>{


      e.stopPropagation();


      profileDropdown
      ?.classList
      .remove("show");



      adminDropdown
      .classList
      .toggle(
        "show"
      );


    }
  );


}





if(
  profileToggle &&
  profileDropdown
){


  profileToggle.addEventListener(
    "click",
    e=>{


      e.stopPropagation();


      adminDropdown
      ?.classList
      .remove("show");



      profileDropdown
      .classList
      .toggle(
        "show"
      );


    }
  );


}





document.addEventListener(
  "click",
  ()=>{


    adminDropdown
    ?.classList
    .remove(
      "show"
    );


    profileDropdown
    ?.classList
    .remove(
      "show"
    );


  }
);



adminDropdown
?.addEventListener(
  "click",
  e=>
    e.stopPropagation()
);



profileDropdown
?.addEventListener(
  "click",
  e=>
    e.stopPropagation()
);






/* =====================================
   LOGIN
===================================== */


if(loginBtn){


loginBtn.addEventListener(
"click",
async()=>{


const email =
document
.getElementById(
"loginEmail"
)
.value
.trim();



const senha =
document
.getElementById(
"loginSenha"
)
.value;



if(
!email ||
!senha
){


alert(
"Informe e-mail e senha."
);


return;


}



try{


await signInWithEmailAndPassword(

auth,

email,

senha

);



profileDropdown
?.classList
.remove(
"show"
);



}


catch(error){


alert(
"Usuário ou senha inválidos."
);


console.error(
error
);


}



});


}






/* =====================================
   LOGOUT
===================================== */


window.logout =
async function(){


await signOut(
auth
);



profileDropdown
?.classList
.remove(
"show"
);



};







/* =====================================
   CONTROLE DE PÁGINAS
===================================== */


function verificarAcessoPagina(){


const pagina =
window.location.pathname
.split("/")
.pop()
.toLowerCase();



const paginasAdmin = [

"admin.html"

];



const paginasOperador = [

"divergencias.html"

];




if(
paginasAdmin.includes(pagina)
){


if(
!isAdmin(usuarioAtual)
){


alert(
"Acesso restrito ao administrador."
);



window.location.href =
"index.html";


}


}





if(
paginasOperador.includes(pagina)
){



if(
!usuarioAtual
){


window.location.href =
"index.html";


return;


}



if(
!isAdmin(usuarioAtual)
&&
!operadorAtual
){


alert(
"Usuário sem permissão."
);



window.location.href =
"index.html";


}



}



}









/* =====================================
   MENU ADMIN
===================================== */


function atualizarMenuAdmin(){


if(
!adminDropdown
)
return;



const links =
adminDropdown
.querySelectorAll(
"a"
);



links.forEach(
link=>{


if(
isAdmin(usuarioAtual)
){


link.style.display =
"block";


}

else{


link.style.display =
"none";


}


});


}








/* =====================================
   ESTADO LOGIN
===================================== */


onAuthStateChanged(
auth,
async user=>{


usuarioAtual =
user;



operadorAtual =
null;



if(
user &&
!isAdmin(user)
){


operadorAtual =
await buscarOperador(
user.email
);


}




atualizarMenuAdmin();



verificarAcessoPagina();





if(
!loginForm ||
!logoutBox
)
return;





if(user){



loginForm.style.display =
"none";



logoutBox.style.display =
"block";



if(loginStatus){


if(
isAdmin(user)
){


loginStatus.textContent =
"Administrador";


}

else if(
operadorAtual
){


loginStatus.textContent =
operadorAtual.nome;


}

else{


loginStatus.textContent =
user.email;


}


}



}

else{


loginForm.style.display =
"block";


logoutBox.style.display =
"none";


}



});



/* =====================================
   EXPORTAÇÃO
===================================== */


export function usuarioEhAdmin(){


return isAdmin(
auth.currentUser
);


}



export function usuarioOperador(){


return operadorAtual;


}
