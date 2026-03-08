import { db, ref, push, set, update, onValue, remove } from "./firebase.js";

let pessoas = {};
let editandoID = null;

const pessoasRef = ref(db, "danca_pessoas");

onValue(pessoasRef, (snapshot) => {

  pessoas = snapshot.val() || {};

  atualizarLista();
  atualizarRanking();
  atualizarResumo();

});


// ADICIONAR MEMBRO
document.getElementById("formAdd").addEventListener("submit", (e) => {

  e.preventDefault();

  const nome = document.getElementById("novoNome").value.trim();

  if (!nome) return;

  const novaRef = push(pessoasRef);

  set(novaRef, {
    nome,
    M: 0,
    D: 0,
    O: 0,
    P: 0,
    F: 0
  });

  document.getElementById("novoNome").value = "";

});


// LANÇAR MDO
document.getElementById("formMDO").addEventListener("submit", (e) => {

  e.preventDefault();

  const id = document.getElementById("nome").value;
  if (!id) return;

  const M = parseInt(document.getElementById("meditacao").value) || 0;
  const D = parseInt(document.getElementById("decoracao").value) || 0;
  const O = parseInt(document.getElementById("oracao").value) || 0;

  const pessoa = pessoas[id];

  update(ref(db, "danca_pessoas/" + id), {

    M: pessoa.M + M,
    D: pessoa.D + D,
    O: pessoa.O + O

  });

  limparCampos();

});


// PRESENÇA
window.marcarPresenca = function () {

  const id = document.getElementById("nomePresenca").value;

  if (!id) return;

  const pessoa = pessoas[id];

  update(ref(db, "danca_pessoas/" + id), {

    P: (pessoa.P || 0) + 1

  });

};

window.marcarFalta = function () {

  const id = document.getElementById("nomePresenca").value;

  if (!id) return;

  const pessoa = pessoas[id];

  update(ref(db, "danca_pessoas/" + id), {

    F: (pessoa.F || 0) + 1

  });

};


// LISTA ORDEM ALFABÉTICA
function atualizarLista() {

  const selectMDO = document.getElementById("nome");
  const selectPresenca = document.getElementById("nomePresenca");

  selectMDO.innerHTML = "";
  selectPresenca.innerHTML = "";

  const lista = Object.entries(pessoas)
    .sort((a,b)=> a[1].nome.localeCompare(b[1].nome));

  lista.forEach(([id,pessoa]) => {

    const option1 = document.createElement("option");
    option1.value = id;
    option1.innerText = pessoa.nome;

    const option2 = option1.cloneNode(true);

    selectMDO.appendChild(option1);
    selectPresenca.appendChild(option2);

  });

}


// RANKING
function atualizarRanking() {

  const rankingDiv = document.getElementById("ranking");

  rankingDiv.innerHTML = "";

  const lista = Object.entries(pessoas);

  lista.sort((a,b)=>{

    const totalA = a[1].M + a[1].D + a[1].O;
    const totalB = b[1].M + b[1].D + b[1].O;

    return totalB - totalA;

  });

  let pos = 1;

  lista.forEach(([id,pessoa])=>{

    const card = document.createElement("div");

    card.className="ranking-card";

    card.innerHTML = `
    
    <div class="ranking-header">

      <strong>#${pos} ${pessoa.nome}</strong>

      <div>

        <button class="btn-small btn-editar" onclick="abrirModal('${id}')">Editar</button>

        <button class="btn-small btn-excluir" onclick="deletarPessoa('${id}','${pessoa.nome}')">Excluir</button>

      </div>

    </div>

    <div class="small">

    M${pessoa.M} | D${pessoa.D} | O${pessoa.O}
    <br>
    Presença ${pessoa.P || 0} | Falta ${pessoa.F || 0}

    </div>
    `;

    rankingDiv.appendChild(card);

    pos++;

  });

}


// EDITAR
window.abrirModal = function (id) {

  editandoID = id;

  const pessoa = pessoas[id];

  document.getElementById("editNome").value = pessoa.nome;
  document.getElementById("editM").value = pessoa.M;
  document.getElementById("editD").value = pessoa.D;
  document.getElementById("editO").value = pessoa.O;

  document.getElementById("modalEditar").style.display = "flex";

};

window.fecharModal = function () {

  document.getElementById("modalEditar").style.display = "none";

};

window.salvarEdicao = function () {

  if (!editandoID) return;

  update(ref(db, "danca_pessoas/" + editandoID), {

    nome: document.getElementById("editNome").value,
    M: parseInt(editM.value) || 0,
    D: parseInt(editD.value) || 0,
    O: parseInt(editO.value) || 0

  });

  fecharModal();

};


// EXCLUIR
window.deletarPessoa = function (id,nome) {

  if(!confirm(`Tem certeza que deseja excluir ${nome}?`)) return;

  remove(ref(db, "danca_pessoas/" + id));

};


// RESUMO (TOTAL APENAS DECORAR)
function atualizarResumo() {

  const totalMembros = Object.keys(pessoas).length;

  let totalDecorar = 0;

  for(let id in pessoas){

    totalDecorar += pessoas[id].D;

  }

  document.getElementById("totalMembros").innerText = totalMembros;

  document.getElementById("totalVersiculos").innerText = totalDecorar;

}


// LIMPAR
function limparCampos() {

  document.getElementById("meditacao").value = "";
  document.getElementById("decoracao").value = "";
  document.getElementById("oracao").value = "";

}


// BUSCA
document.getElementById("buscarMDO").addEventListener("input", filtrarMDO);
document.getElementById("buscarPresenca").addEventListener("input", filtrarPresenca);


function filtrarMDO(){

  const termo = this.value.toLowerCase();

  const select = document.getElementById("nome");

  for(let option of select.options){

    option.style.display = option.text.toLowerCase().includes(termo) ? "" : "none";

  }

}


function filtrarPresenca(){

  const termo = this.value.toLowerCase();

  const select = document.getElementById("nomePresenca");

  for(let option of select.options){

    option.style.display = option.text.toLowerCase().includes(termo) ? "" : "none";

  }

}


// PDF
window.exportarPDF = function(){

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  let y = 20;

  doc.setFontSize(18);
  doc.text("RELATÓRIO MINISTÉRIO DE DANÇA",20,10);

  doc.setFontSize(12);

  const lista = Object.entries(pessoas)
    .sort((a,b)=> (b[1].M+b[1].D+b[1].O) - (a[1].M+a[1].D+a[1].O));

  lista.forEach(([id,p])=>{

    doc.text(`${p.nome}`,20,y);

    doc.text(`M:${p.M} D:${p.D} O:${p.O}`,80,y);

    doc.text(`P:${p.P||0} F:${p.F||0}`,150,y);

    y += 8;

  });

  doc.save("ranking_danca.pdf");

};
