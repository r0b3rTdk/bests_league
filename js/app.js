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
    loadingScreen.classList.add("bl-hide"); // Dispara o fade-out do CSS
  }
}

function init() {
  initTabs();
  initTemporadaSelect();
  initNovoJogoBtn();

  console.log("Conectando ao Firebase...");

  db.ref("bests_league").once("value")
    .then((snapshot) => {
      const firebaseData = snapshot.val();

      if (firebaseData) {
        console.log("Dados sincronizados da nuvem com sucesso!");
        appState = firebaseData;
        localStorage.setItem("bests-league-state", JSON.stringify(firebaseData)); 
      } else {
        console.log("Nuvem vazia. Iniciando migração do localStorage local...");
        appState = loadAppState() || { temporadaVisualizadaId: "temp_1", temporadas: [] };
        db.ref("bests_league").set(appState);
      }

      if (typeof temporadaEmAndamento === "function") {
        appState.temporadaVisualizadaId = temporadaEmAndamento().id;
      }

      renderAll();
      
      // 🔥 BANCO CARREGADO COM SUCESSO: Desliga o loading!
      esconderLoadingTrap();
    })
    .catch((error) => {
      console.error("Erro crítico ao sincronizar com Firebase, usando dados locais offline:", error);
      appState = loadAppState();
      
      if (appState && typeof temporadaEmAndamento === "function") {
        appState.temporadaVisualizadaId = temporadaEmAndamento().id;
      }
      
      renderAll();
      
      // 🔥 CASO DÊ ERRO/OFFLINE: Libera a tela de qualquer forma com o backup local
      esconderLoadingTrap();
    });
}

document.addEventListener("DOMContentLoaded", init);