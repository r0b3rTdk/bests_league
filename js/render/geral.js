// ============================================================
// BESTS LEAGUE — RENDER GERAL E SEGURANÇA MESTRE
// ============================================================

window.isAdmin = isAdmin;


function renderAll() {
  
  console.log("1 - Header");
  renderTemporadaHeader();

  console.log("2 - Hero");
  renderHero();

  console.log("3 - Confronto");
  renderConfrontoBar();

  console.log("4 - Tabs");
  renderTabContent();

  console.log("5 - Admin");
  initBotaoSecretoAdmin();

  console.log("6 - Segurança");
  aplicarTratamentoSeguranca();

  console.log("7 - Finalizado");
}

function initBotaoSecretoAdmin() {
  const footer = document.querySelector(".bl-footer");
  if (footer) {
    // Dá um feedback visual para você saber onde clicar
    footer.style.cursor = "pointer"; 
    footer.style.userSelect = "none";
    footer.title = "Área Restrita — Desenvolvedor";
    
    footer.removeEventListener("click", lancarPromptAdmin);
    footer.addEventListener("click", lancarPromptAdmin);
  }
}

function lancarPromptAdmin() {
  const senha = prompt("Digite a senha para liberar o modo Administrador:");
  if (senha === "bests2026") {
    window.localStorage.setItem("bl_admin_token", "PELADA_ADMIN_2026");
    showToast("Modo Admin Ativado com sucesso!");
    setTimeout(() => { location.reload(); }, 1000);
  } else if (senha !== null) {
    showToast("Senha incorreta!", true);
  }
}

// Bloqueia vazamentos na interface se o token de administrador não existir
function aplicarTratamentoSeguranca() {
  const adminToken = window.localStorage.getItem("bl_admin_token");
  window.isAdmin = adminToken === "PELADA_ADMIN_2026";
  
  // ============================================================
  // Controle de acessos do Admin (Versão Anti-SyntaxError)
  // ============================================================

  // 1. Tranca o botão principal do cabeçalho
  if (document.getElementById("btnNovoJogo")) {
    document.getElementById("btnNovoJogo").style.display = window.isAdmin ? "block" : "none";
  }

  // 2. Tranca a aba/botão de Gerenciar Elenco
  // (Se o ID do seu botão no index.html for diferente de 'btnGerenciarElenco', mude o texto abaixo)
  if (document.getElementById("btnGerenciarElenco")) {
    document.getElementById("btnGerenciarElenco").style.display = window.isAdmin ? "block" : "none";
  }

  // 3. Esconde a opção de "Nova Temporada" do menu dropdown se for visitante
  if (document.querySelector('option[value="__nova__"]')) {
    const optNovaTemporada = document.querySelector('option[value="__nova__"]');
    if (window.isAdmin) {
      optNovaTemporada.removeAttribute("disabled");
      optNovaTemporada.style.display = "block";
    } else {
      optNovaTemporada.setAttribute("disabled", "true");
      optNovaTemporada.style.display = "none";
    }
  }

  // 3. Esconde a opção de "Nova Temporada" do menu dropdown se for visitante
  const optNovaTemporada = document.querySelector('option[value="__nova__"]');
  if (optNovaTemporada) {
    if (isAdmin) {
      optNovaTemporada.removeAttribute("disabled");
      optNovaTemporada.style.display = "block";
    } else {
      optNovaTemporada.setAttribute("disabled", "true");
      optNovaTemporada.style.display = "none";
    }
  }

  // 2. Remove o "+ Criar nova temporada" do menu dropdown (Corrige image_9eff83.png)
  const seletores = document.querySelectorAll("select");
  seletores.forEach((selectTemp) => {
    if (selectTemp && !isAdmin) {
      for (let i = 0; i < selectTemp.options.length; i++) {
        if (selectTemp.options[i].value === "nova" || selectTemp.options[i].text.includes("Criar nova temporada")) {
          selectTemp.remove(i);
        }
      }
    }
  });
}

let toastTimeout = null;
function showToast(msg, isError) {
  const root = document.getElementById("toastRoot");
  clearTimeout(toastTimeout);
  root.innerHTML = `<div class="bl-toast ${isError ? "bl-toast-erro" : ""}">${isError ? "" : checkIcon()} ${escapeHtml(msg)}</div>`;
  toastTimeout = setTimeout(() => { root.innerHTML = ""; }, isError ? 6000 : 2400);
}

function checkIcon() {
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
}