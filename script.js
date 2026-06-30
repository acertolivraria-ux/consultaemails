alert("JavaScript carregou!");
const dados = [
  {
    editora: "Abril",
    cnpj: "12345678000100",
    lojas: ["001", "002", "003"],
    emails: [
      "comercial@abril.com.br",
      "financeiro@abril.com.br",
      "suporte@abril.com.br"
    ]
  },
  {
    editora: "Moderna",
    cnpj: "99888777000199",
    lojas: ["010", "011"],
    emails: [
      "contato@moderna.com.br"
    ]
  }
];

let resultadoAtual = null;

document
  .getElementById("btnPesquisar")
  .addEventListener("click", pesquisar);

function pesquisar() {

  const loja = document.getElementById("loja").value;
  const editora = document.getElementById("editora").value.toLowerCase();

  resultadoAtual = dados.find(item =>
    item.lojas.includes(loja) &&
    (
      item.editora.toLowerCase() === editora ||
      item.cnpj === editora
    )
  );

  const divResultado = document.getElementById("resultado");

  if (!resultadoAtual) {
    divResultado.innerHTML = "<p>Nenhum resultado encontrado.</p>";
    return;
  }

  let html = `
    <button onclick="copiarTodos()">
      📋 Copiar todos
    </button>
    <br><br>
  `;

  resultadoAtual.emails.forEach(email => {
    html += `
      <div class="email">
        <span>${email}</span>
        <button onclick="copiar('${email}')">📋</button>
      </div>
    `;
  });

  divResultado.innerHTML = html;
}

function copiar(email) {
  navigator.clipboard.writeText(email);
  alert("E-mail copiado!");
}

function copiarTodos() {
  const texto = resultadoAtual.emails.join(";");
  navigator.clipboard.writeText(texto);
  alert("Todos os e-mails foram copiados!");
}
