// ============================================================
// BESTS LEAGUE — inicialização
// ============================================================

function initTabs() {
  document.querySelectorAll(".bl-tab[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentTab = btn.getAttribute("data-tab");
      document.querySelectorAll(".bl-tab[data-tab]").forEach((b) => b.classList.remove("bl-tab-active"));
      btn.classList.add("bl-tab-active");
      renderTabContent();
    });
  });
}

function initTemporadaSelect() {
  const adminToken = window.localStorage.getItem("bl_admin_token");
  window.isAdmin = adminToken === "PELADA_ADMIN_2026";

  const select = document.getElementById("temporadaSelect");
  select.addEventListener("change", () => {
    if (select.value === "__nova__") {
      renderTemporadaHeader(); // reverte a seleção visual antes de abrir o modal
      openNovaTemporadaModal();
      return;
    }
    trocarTemporadaVisualizada(select.value);
    currentTab = "inicio";
    document.querySelectorAll(".bl-tab[data-tab]").forEach((b) => b.classList.remove("bl-tab-active"));
    document.querySelector('.bl-tab[data-tab="inicio"]').classList.add("bl-tab-active");
    renderAll();
  });
}

// Nova função para escutar o clique do botão "Novo jogo"
function initNovoJogoBtn() {
  const btnNovoJogo = document.getElementById("btnNovoJogo");
  if (btnNovoJogo) {
    btnNovoJogo.addEventListener("click", () => {
      openJogoModal(); // <-- Função vinda de js/modals/jogo.js
    });
  }
}

// Função para dar o sumiço elegante na tela de loading
function esconderLoadingTrap() {
  const loadingScreen = document.getElementById("blLoadingScreen");
  if (loadingScreen) {
    loadingScreen.classList.add("bl-hide"); 
  }
}

function init() {
  initTabs();
  initTemporadaSelect();
  initNovoJogoBtn();
  if (typeof initFutCardTilt === "function") initFutCardTilt();

  console.log("Conectando ao Firebase...");

  db.ref(window.FIREBASE_DB_PATH).once("value")
    .then((snapshot) => {
      const firebaseData = snapshot.val();

      if (firebaseData) {
        console.log("Dados sincronizados da nuvem com sucesso!");
        appState = firebaseData;
        localStorage.setItem("bests-league-state", JSON.stringify(firebaseData)); 
      } else {
        console.log("Nuvem vazia. Iniciando migração do localStorage local...");
        appState = loadAppState() || { temporadaVisualizadaId: "temp_1", temporadas: [] };
        db.ref(window.FIREBASE_DB_PATH).set(appState);
      }

      if (typeof temporadaEmAndamento === "function") {
        appState.temporadaVisualizadaId = temporadaEmAndamento().id;
      }

      const jogosAgendadosAgora = manterAgendaEmDia();
      renderAll();
      esconderLoadingTrap();
      avisarAgendaAtualizada(jogosAgendadosAgora);
    })
    .catch((error) => {
      console.error("Erro crítico ao sincronizar com Firebase, usando dados locais offline:", error);
      appState = loadAppState();
      
      if (appState && typeof temporadaEmAndamento === "function") {
        appState.temporadaVisualizadaId = temporadaEmAndamento().id;
      }
      
      const jogosAgendadosAgora = manterAgendaEmDia();
      renderAll();
      esconderLoadingTrap();
      avisarAgendaAtualizada(jogosAgendadosAgora);
    });
}

// Só o admin gera/edita dados — visitantes comuns só leem. Garante
// (silenciosamente, sem duplicar) que exista o PRÓXIMO jogo agendado
// na temporada em andamento — nunca uma lista inteira de sextas.
// Roda ANTES do primeiro renderAll(), pra tela já nascer em dia.
function manterAgendaEmDia() {
  if (!window.isAdmin) return 0;
  if (typeof garantirProximoJogoAgendado !== "function" || typeof temporadaEmAndamento !== "function") return 0;
  try {
    const ativa = temporadaEmAndamento();
    const criados = garantirProximoJogoAgendado(ativa);
    saveAppState();
    return criados;
  } catch (e) {
    console.warn("Não foi possível atualizar a agenda automática:", e);
    return 0;
  }
}

// Aviso (opcional, só quando algo mudou) depois que a tela de loading
// já sumiu, pra não passar despercebido atrás da animação de entrada.
function avisarAgendaAtualizada(criados) {
  if (!criados || criados <= 0) return;
  if (typeof showToast !== "function") return;
  setTimeout(() => {
    showToast("Próximo jogo já está agendado");
  }, 500);
}

document.addEventListener("DOMContentLoaded", init);