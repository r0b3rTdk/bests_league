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
  const limpo = JSON.parse(JSON.stringify(appState));
  localStorage.setItem("bests-league-state", JSON.stringify(limpo));
  
  const indicator = document.getElementById("syncIndicator");
  if (indicator) {
    indicator.innerHTML = "🔄 Salvando...";
    indicator.className = "bl-sync-indicator bl-sync-saving";
  }
  
  if (typeof db !== "undefined") {
    // 🔹 CORREÇÃO: Troque "bests_league" por window.FIREBASE_DB_PATH
    db.ref(window.FIREBASE_DB_PATH).set(limpo)
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

// ============================================================
// ANO x TURNO — "temporada" é o ano inteiro (12 meses), "turno" é
// cada metade (6 meses). Temporadas antigas não tinham esses campos
// estruturados, então caímos pro nome em texto como reserva.
// ============================================================

// Ano da temporada — usa o campo estruturado se existir, senão tenta
// achar um ano de 4 dígitos no nome (temporadas criadas antes disso existir).
function obterAnoTemporada(temp) {
  if (!temp) return null;
  if (temp.ano) return temp.ano;
  const match = (temp.nome || "").match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : null;
}

// Turno (1, 2, ou null quando é o ano inteiro sem dividir/turno único).
function obterTurnoTemporada(temp) {
  if (!temp) return null;
  if (temp.turno === 1 || temp.turno === 2) return temp.turno;
  const nome = (temp.nome || "").toLowerCase();
  if (/2[ºo]?\s*turno/.test(nome)) return 2;
  if (/1[ºo]?\s*turno/.test(nome)) return 1;
  return null;
}

// Todas as temporadas que pertencem ao mesmo ano (1º turno + 2º turno,
// ou só ela mesma se for turno único / ano sem divisão).
function temporadasDoMesmoAno(temp) {
  const ano = obterAnoTemporada(temp);
  if (ano === null) return [temp];
  return (appState.temporadas || []).filter((t) => obterAnoTemporada(t) === ano);
}

// Mescla os jogos/jogadores de todas as temporadas do mesmo ano num só
// objeto "de mentira", pra reaproveitar calcularArtilharia/calcularCraques
// exatamente como já funcionam pra uma temporada só. Se só existir um
// turno até agora, retorna a própria temporada sem trabalho extra.
function mesclarTemporadasDoAno(temp) {
  const todas = temporadasDoMesmoAno(temp);
  if (todas.length <= 1) return temp;

  const jogadoresPorNome = {};
  todas.forEach((t) => {
    (t.jogadores || []).forEach((j) => {
      // Turno mais recente "vence" em caso de mesmo jogador em times diferentes
      jogadoresPorNome[j.nome.trim().toLowerCase()] = j;
    });
  });

  // historico.gols é uma base de gols separada dos jogos individuais
  // (usada em várias contas) — precisa somar por jogador, não só
  // concatenar os jogos, senão essa base some da conta do "ano inteiro".
  const golsHistoricoPorNome = {};
  todas.forEach((t) => {
    if (t.historico && t.historico.gols) {
      t.historico.gols.forEach((g) => {
        const nome = g.jogador;
        golsHistoricoPorNome[nome] = (golsHistoricoPorNome[nome] || 0) + (g.quantidade || 0);
      });
    }
  });
  const historicoMesclado = {
    gols: Object.entries(golsHistoricoPorNome).map(([jogador, quantidade]) => ({ jogador, quantidade })),
  };

  return {
    id: `ano_${obterAnoTemporada(temp)}`,
    nome: `Temporada ${obterAnoTemporada(temp)} — ano inteiro`,
    timeA: temp.timeA,
    timeB: temp.timeB,
    jogadores: Object.values(jogadoresPorNome),
    jogos: todas.flatMap((t) => t.jogos || []),
    historico: historicoMesclado,
  };
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
    capitao: false,
    foto: j.foto || "",
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

// ============================================================
// AGENDAMENTO AUTOMÁTICO — mantém SEMPRE só o PRÓXIMO jogo da
// temporada em andamento agendado (sem placar ainda), nunca uma
// lista inteira de sextas-feiras. Some sozinho quando o resultado é
// lançado, e o próximo já nasce agendado na hora.
// ============================================================

// Descobre o horário mais usado nos jogos já cadastrados da temporada
// (moda) — cai pro padrão 21:00 se ainda não existir nenhum jogo.
function horarioPadraoDaTemporada(temp) {
  const jogos = (temp && temp.jogos) || [];
  const contagem = {};
  jogos.forEach((j) => { if (j.time) contagem[j.time] = (contagem[j.time] || 0) + 1; });
  let melhor = "21:00", max = 0;
  Object.entries(contagem).forEach(([horario, n]) => {
    if (n > max) { max = n; melhor = horario; }
  });
  return melhor;
}

// Próxima sexta-feira (formato YYYY-MM-DD) a partir de amanhã.
function proximaSextaFeira(apartirDe) {
  const base = apartirDe || new Date();
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 12, 0, 0);
  d.setDate(d.getDate() + 1); // começa amanhã — não mexe no dia de hoje
  while (d.getDay() !== 5) d.setDate(d.getDate() + 1); // 5 = sexta-feira
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Garante que exista exatamente UM jogo "agendado" (placar em branco)
// por vez — sempre o próximo, nunca vários de uma vez. Remove qualquer
// agendado extra/antigo que tenha sobrado de antes. Retorna quantos
// jogos novos foram criados (0 ou 1).
function garantirProximoJogoAgendado(temp) {
  if (!temp) return 0;
  if (!temp.jogos) temp.jogos = [];

  const hojeStr = new Date().toISOString().slice(0, 10);
  const agendados = temp.jogos
    .filter((j) => j.placarA === null || j.placarA === undefined)
    .filter((j) => j.date >= hojeStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Já existe pelo menos um agendado futuro: mantém só o mais próximo
  // e descarta qualquer outro extra (é isso que "limpa" os antigos).
  const manterId = agendados.length > 0 ? agendados[0].id : null;
  temp.jogos = temp.jogos.filter((j) => {
    const semPlacar = j.placarA === null || j.placarA === undefined;
    if (!semPlacar) return true; // jogo já disputado — nunca mexe
    return j.id === manterId; // dos agendados, só sobrevive o escolhido
  });

  if (manterId) return 0; // já tinha o próximo agendado, nada novo a criar

  // Base pro cálculo da próxima sexta: usa a maior data já usada na
  // temporada (jogada ou agendada) se ela ainda estiver no futuro —
  // evita duplicar a mesma data quando um resultado é lançado no
  // mesmo dia em que "a próxima sexta" ainda seria hoje.
  const todasAsDatas = temp.jogos.map((j) => j.date).filter(Boolean);
  const maiorData = todasAsDatas.length ? todasAsDatas.reduce((a, b) => (a > b ? a : b)) : null;
  const baseParaCalculo = maiorData && maiorData > hojeStr ? new Date(maiorData + "T12:00:00") : new Date();

  const horarioPadrao = horarioPadraoDaTemporada(temp);
  temp.jogos.push({
    id: uid("g"),
    date: proximaSextaFeira(baseParaCalculo),
    time: horarioPadrao,
    placarA: null,
    placarB: null,
    craque: "",
    gols: [],
    cartoes: [],
  });
  return 1;
}
