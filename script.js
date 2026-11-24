/* =========================================================
   Patinhas & Cia – JavaScript
   1) Menu  2) Formulário  3) Lista de interesse  4) Busca
   ========================================================= */

// ---------- 1) MENU INTERATIVO ----------
const btnMenu = document.getElementById('btn-menu');
const menu = document.getElementById('menu');
const links = document.querySelectorAll('.menu__link');

// Abrir / fechar menu no celular
btnMenu.addEventListener('click', () => {
  const aberto = menu.classList.toggle('aberto');
  btnMenu.setAttribute('aria-expanded', aberto);
  btnMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
});

// Fechar o menu ao clicar em um link
links.forEach(link => {
  link.addEventListener('click', () => {
    menu.classList.remove('aberto');
    btnMenu.setAttribute('aria-expanded', 'false');
  });
});

// Destacar o item do menu da seção que está na tela
const secoes = document.querySelectorAll('main section[id]');
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach(entrada => {
    if (entrada.isIntersecting) {
      links.forEach(l => l.classList.toggle('ativo', l.getAttribute('href') === '#' + entrada.target.id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
secoes.forEach(s => observador.observe(s));

// ---------- 2) VALIDAÇÃO DO FORMULÁRIO ----------
const form = document.getElementById('form-contato');
const msgSucesso = document.getElementById('msg-sucesso');

function mostrarErro(idCampo, mensagem) {
  const campo = document.getElementById(idCampo);
  campo.closest('.campo').classList.add('invalido');
  document.getElementById('erro-' + idCampo).textContent = mensagem;
}
function limparErro(idCampo) {
  const campo = document.getElementById(idCampo);
  campo.closest('.campo').classList.remove('invalido');
  document.getElementById('erro-' + idCampo).textContent = '';
}

function validarFormulario() {
  let valido = true;
  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const telefone = form.telefone.value.replace(/\D/g, ''); // só números
  const assunto = form.assunto.value;
  const mensagem = form.mensagem.value.trim();

  ['nome', 'email', 'telefone', 'assunto', 'mensagem'].forEach(limparErro);

  if (nome.length < 3) { mostrarErro('nome', 'Digite seu nome completo.'); valido = false; }

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email === '') { mostrarErro('email', 'Digite seu e-mail.'); valido = false; }
  else if (!regexEmail.test(email)) { mostrarErro('email', 'E-mail inválido. Exemplo: nome@email.com'); valido = false; }

  if (telefone === '') { mostrarErro('telefone', 'Digite seu telefone.'); valido = false; }
  else if (telefone.length < 10 || telefone.length > 11) { mostrarErro('telefone', 'Telefone inválido. Use DDD + número.'); valido = false; }

  if (assunto === '') { mostrarErro('assunto', 'Escolha um assunto.'); valido = false; }

  if (mensagem.length < 10) { mostrarErro('mensagem', 'Escreva pelo menos 10 caracteres.'); valido = false; }

  return valido;
}

form.addEventListener('submit', (evento) => {
  evento.preventDefault(); // impede o envio padrão
  msgSucesso.hidden = true;

  if (validarFormulario()) {
    msgSucesso.textContent = 'Mensagem enviada com sucesso! Responderemos em breve, ' + form.nome.value.trim().split(' ')[0] + '.';
    msgSucesso.hidden = false;
    form.reset();
  }
});

// ---------- 3) LISTA DE INTERESSE ----------
const painel = document.getElementById('painel-lista');
const itensUl = document.getElementById('itens-lista');
const listaVazia = document.getElementById('lista-vazia');
const subtotalEl = document.getElementById('subtotal');
const contadorEl = document.getElementById('contador');

let lista = {}; // { id: { nome, preco, qtd } }

const moeda = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function atualizarLista() {
  itensUl.innerHTML = '';
  let subtotal = 0;
  let quantidade = 0;

  Object.entries(lista).forEach(([id, item]) => {
    subtotal += item.preco * item.qtd;
    quantidade += item.qtd;

    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `
      <span class="item__nome">${item.nome}</span>
      <span class="item__preco">${moeda(item.preco * item.qtd)}</span>
      <div class="item__qtd">
        <button type="button" data-acao="menos" data-id="${id}" aria-label="Diminuir quantidade">−</button>
        <span>${item.qtd}</span>
        <button type="button" data-acao="mais" data-id="${id}" aria-label="Aumentar quantidade">+</button>
      </div>
      <button type="button" class="item__remover" data-acao="remover" data-id="${id}">Remover</button>`;
    itensUl.appendChild(li);
  });

  listaVazia.hidden = quantidade > 0;
  subtotalEl.textContent = moeda(subtotal);
  contadorEl.textContent = quantidade;
}

// Botões "Adicionar à lista"
document.querySelectorAll('.btn-add').forEach(botao => {
  botao.addEventListener('click', () => {
    const cartao = botao.closest('.produto');
    const id = cartao.dataset.id;
    if (lista[id]) {
      lista[id].qtd++;
    } else {
      lista[id] = { nome: cartao.dataset.nome, preco: parseFloat(cartao.dataset.preco), qtd: 1 };
    }
    atualizarLista();
    botao.textContent = 'Adicionado ✔';
    setTimeout(() => (botao.textContent = 'Adicionar à lista'), 1000);
  });
});

// Botões + − e remover dentro do painel
itensUl.addEventListener('click', (e) => {
  const acao = e.target.dataset.acao;
  const id = e.target.dataset.id;
  if (!acao) return;
  if (acao === 'mais') lista[id].qtd++;
  if (acao === 'menos') { lista[id].qtd--; if (lista[id].qtd <= 0) delete lista[id]; }
  if (acao === 'remover') delete lista[id];
  atualizarLista();
});

// Abrir, fechar e limpar o painel
document.getElementById('btn-lista').addEventListener('click', () => (painel.hidden = !painel.hidden));
document.getElementById('fechar-lista').addEventListener('click', () => (painel.hidden = true));
document.getElementById('limpar-lista').addEventListener('click', () => { lista = {}; atualizarLista(); });

// "Pedir orçamento": preenche o formulário de contato com os itens
document.getElementById('enviar-lista').addEventListener('click', () => {
  const itens = Object.values(lista);
  if (itens.length === 0) { alert('Adicione pelo menos um item à lista.'); return; }
  const texto = 'Olá! Gostaria de um orçamento para:\n' +
    itens.map(i => `- ${i.qtd}x ${i.nome}`).join('\n') +
    '\nSubtotal estimado: ' + subtotalEl.textContent;
  form.assunto.value = 'Orçamento';
  form.mensagem.value = texto;
  painel.hidden = true;
  document.getElementById('contato').scrollIntoView();
});

// ---------- 4) PESQUISA DINÂMICA ----------
const campoBusca = document.getElementById('campo-busca');
const semResultado = document.getElementById('sem-resultado');
const cartoes = document.querySelectorAll('.produto');

// Remove acentos e deixa minúsculo para comparar melhor
const normalizar = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

campoBusca.addEventListener('input', () => {
  const termo = normalizar(campoBusca.value.trim());
  let encontrados = 0;

  cartoes.forEach(cartao => {
    const corresponde = normalizar(cartao.dataset.nome).includes(termo);
    cartao.hidden = !corresponde;
    if (corresponde) encontrados++;
  });

  semResultado.hidden = encontrados > 0;
});

atualizarLista();
