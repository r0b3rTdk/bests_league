// ============================================================
// BESTS LEAGUE — gerenciamento de estado e temporadas
// ============================================================

const STORAGE_KEY = "bestsleague_dados_v2";

let appState = null; // { temporadaAtivaId, temporadas: [...] }

function uid(prefix) {
  return prefix + "_" + Math.random().toString(36).slice(2, 10);
}

function loadAppState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const dadosSalvos = JSON.parse(raw);
      
      // SE O SEU BANCO ANTIGO NÃO TIVER A TEMPORADA 2025, ELE APAGA O CACHE ONLINE E FORÇA A LEITURA DO NOVO DATA.JS
      if (!dadosSalvos.temporadas.some(t => t.id === "temp_2025")) {
        window.localStorage.removeItem(STORAGE_KEY);
        return criarSeedInicial();
      }
      
      return dadosSalvos;
    }
  } catch (e) {
    console.warn("Não foi possível carregar dados salvos, usando dados iniciais.", e);
  }
  return criarSeedInicial();
}

function saveAppState() {
  // 🔹 LIMPEZA ANTI-UNDEFINED: Transforma em texto e volta para objeto. 
  // Isso remove automaticamente qualquer propriedade 'undefined' que o Firebase odeia.
  const limpo = JSON.parse(JSON.stringify(appState));
  
  // 1. Salva no cache local
  localStorage.setItem("bests-league-state", JSON.stringify(limpo));
  
  const indicator = document.getElementById("syncIndicator");
  if (indicator) {
    indicator.innerHTML = "🔄 Salvando...";
    indicator.className = "bl-sync-indicator bl-sync-saving";
  }
  
  if (typeof db !== "undefined") {
    // 🔹 Enviamos a versão limpa para o Firebase
    db.ref("bests_league").set(limpo)
      .then(() => {
        if (indicator) {
          indicator.innerHTML = "☁️ Sincronizado";
          indicator.className = "bl-sync-indicator bl-sync-saved";
        }
      })
      .catch((err) => {
        if (indicator) {
          indicator.innerHTML = "❌ Erro ao salvar";
          indicator.className = "bl-sync-indicator bl-sync-error";
        }
        console.error("Falha ao atualizar o Firebase:", err);
      });
  }
}

// Retorna o objeto da temporada que está em andamento (a mais nova,
// sem arquivadaEm) — é nela que jogos novos são sempre cadastrados.
function temporadaEmAndamento() {
  // 🔹 Busca a temporada que NÃO possui a propriedade 'arquivadaEm'
  const ativa = appState.temporadas.find(t => !t.arquivadaEm);
  
  // Se encontrar a ativa, retorna ela. Se não (fallback), pega a primeira da lista.
  return ativa || appState.temporadas[0];
}

// Retorna a temporada que está sendo exibida na tela no momento
// (pode ser uma arquivada, se o usuário escolheu ver o histórico).
function temporadaVisualizada() {
  const id = appState.temporadaVisualizadaId || temporadaEmAndamento().id;
  return appState.temporadas.find((t) => t.id === id) || temporadaEmAndamento();
}

function listaTemporadas() {
  // Mais recente primeiro
  return [...appState.temporadas].sort((a, b) => (b.criadaEm || "").localeCompare(a.criadaEm || ""));
}

// Cria uma nova temporada, arquivando a atual (em andamento). O elenco é
// copiado da temporada atual (zerando estatísticas) para servir de ponto
// de partida, mas fica totalmente editável a partir daí.
function criarNovaTemporada(nome, timeANome, timeBNome) {
  const atual = temporadaEmAndamento();
  atual.arquivadaEm = new Date().toISOString().slice(0, 10);

  const novoId = uid("temp");
  const elencoCopiado = atual.jogadores.map((j) => ({
    id: uid("j"),
    nome: j.nome,
    time: j.time,
    overall: j.overall || 3,
  }));

  const novaTemporada = {
    id: novoId,
    nome: nome || `Temporada ${appState.temporadas.length + 1}`,
    criadaEm: new Date().toISOString().slice(0, 10),
    arquivadaEm: null,
    timeA: { nome: (timeANome || atual.timeA.nome).toUpperCase(), cor: atual.timeA.cor },
    timeB: { nome: (timeBNome || atual.timeB.nome).toUpperCase(), cor: atual.timeB.cor },
    jogadores: elencoCopiado,
    jogos: [],
    historico: { gols: [] },
  };

  appState.temporadas.push(novaTemporada);
  appState.temporadaVisualizadaId = novoId; // já troca a visualização pra nova temporada
  saveAppState();
}

function trocarTemporadaVisualizada(temporadaId) {
  appState.temporadaVisualizadaId = temporadaId;
  saveAppState();
}
