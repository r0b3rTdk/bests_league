// ============================================================
// DADOS DA BESTS LEAGUE — TEMPORADA ATUAL (2026)
// ============================================================
const TIME_A = "timeA";
const TIME_B = "timeB";
const TIME_AVULSO = "avulso";

const golsHistoricoInicial = {
  WEMBLEY: 23, HADSON: 20, "BRUNO BÊ": 11, VINICIUS: 10, "GEAN GK": 10,
  GABRIEL: 9, "JOÃO LUCAS GK": 9, YURI: 8, RYAN: 8, PACHECO: 8,
  GUSTAVO: 7, "JOHN POMBO": 7, DUDU: 6, "LUIS GUILHERME": 5, RENATO: 5,
  GENATON: 4, "THIAGO FELIPE": 3, ROBERT: 3, RENAN: 3, RAFAEL: 2,
  WESLEY: 2, PEDRINHO: 2, PEIXE: 2,
};

const seedJogadores = [
  { id: "j1", nome: "WEMBLEY", time: TIME_A, overall: 3 },
  { id: "j2", nome: "HADSON", time: TIME_A, overall: 3 },
  { id: "j3", nome: "BRUNO BÊ", time: TIME_B, overall: 3 }, // Unificado definitivo
  { id: "j4", nome: "VINICIUS", time: TIME_A, overall: 3 },
  { id: "j5", nome: "GEAN GK", time: TIME_A, overall: 3 },
  { id: "j6", nome: "GABRIEL", time: TIME_B, overall: 3 },
  { id: "j7", nome: "JOÃO LUCAS GK", time: TIME_B, overall: 3 },
  { id: "j8", nome: "YURI", time: TIME_A, overall: 3 },
  { id: "j9", nome: "RYAN", time: TIME_A, overall: 3 },
  { id: "j10", nome: "PACHECO", time: TIME_B, overall: 3 },
  { id: "j11", nome: "GUSTAVO", time: TIME_A, overall: 3 },
  { id: "j12", nome: "JOHN POMBO", time: TIME_A, overall: 3 },
  { id: "j13", nome: "DUDU", time: TIME_A, overall: 3 },
  { id: "j14", nome: "LUIS GUILHERME", time: TIME_A, overall: 3 },
  { id: "j15", nome: "RENATO", time: TIME_A, overall: 3 },
  { id: "j16", nome: "GENATON", time: TIME_A, overall: 3 },
  { id: "j17", nome: "THIAGO FELIPE", time: TIME_B, overall: 3 }, // Nome corrigido
  { id: "j18", nome: "ROBERT", time: TIME_A, overall: 3 },
  { id: "j19", nome: "RENAN", time: TIME_A, overall: 3 },
  { id: "j20", nome: "RAFAEL", time: TIME_A, overall: 3 },
  { id: "j21", nome: "WESLEY", time: TIME_AVULSO, overall: 3 },
  { id: "j22", nome: "PEDRINHO", time: TIME_AVULSO, overall: 3 },
  { id: "j23", nome: "PEIXE", time: TIME_A, overall: 3 }
];

const seedJogos = [
  { id: "g1", date: "2026-01-09", time: "21:00", placarA: 2, placarB: 6, craque: "BRUNO BÊ", gols: [], cartoes: [] },
  { id: "g2", date: "2026-01-16", time: "21:00", placarA: 1, placarB: 2, craque: "JOÃO LUCAS GK", gols: [], cartoes: [] },
  { id: "g3", date: "2026-01-23", time: "21:00", placarA: 6, placarB: 5, craque: "GEAN GK", gols: [], cartoes: [] },
  { id: "g4", date: "2026-01-30", time: "21:00", placarA: 2, placarB: 9, craque: "BRUNO BÊ", gols: [], cartoes: [] },
  { id: "g5", date: "2026-02-06", time: "21:00", placarA: 4, placarB: 5, craque: "ROBERT", gols: [], cartoes: [] },
  { id: "g6", date: "2026-02-13", time: "21:00", placarA: 5, placarB: 1, craque: "HADSON", gols: [], cartoes: [] },
  { id: "g7", date: "2026-02-20", time: "21:00", placarA: 5, placarB: 7, craque: "WEMBLEY", gols: [], cartoes: [] },
  { id: "g8", date: "2026-02-27", time: "21:00", placarA: 2, placarB: 2, craque: "GEAN GK", gols: [], cartoes: [] },
  { id: "g9", date: "2026-03-06", time: "21:00", placarA: 2, placarB: 5, craque: "DUDU", gols: [], cartoes: [] },
  { id: "g10", date: "2026-03-13", time: "21:00", placarA: 3, placarB: 3, craque: "THIAGO FELIPE", gols: [], cartoes: [] },
  { id: "g11", date: "2026-03-20", time: "21:00", placarA: 5, placarB: 5, craque: "JOÃO LUCAS GK", gols: [], cartoes: [] },
  { id: "g12", date: "2026-03-27", time: "21:00", placarA: 8, placarB: 8, craque: "PEIXE", gols: [], cartoes: [] },
  { id: "g13", date: "2026-04-10", time: "21:00", placarA: 6, placarB: 2, craque: "GUSTAVO", gols: [], cartoes: [] },
  { id: "g14", date: "2026-04-17", time: "21:00", placarA: 3, placarB: 9, craque: "RAFAEL", gols: [], cartoes: [] },
  { id: "g15", date: "2026-04-24", time: "21:00", placarA: 3, placarB: 1, craque: "GEAN GK", gols: [], cartoes: [] },
  { id: "g16", date: "2026-05-08", time: "21:00", placarA: 6, placarB: 3, craque: "GUSTAVO", gols: [], cartoes: [] },
  { id: "g17", date: "2026-05-15", time: "21:00", placarA: 5, placarB: 2, craque: "GEAN GK", gols: [], cartoes: [] },
  { id: "g18", date: "2026-05-22", time: "21:00", placarA: 3, placarB: 6, craque: "JOHN POMBO", gols: [], cartoes: [] },
  { id: "g19", date: "2026-05-29", time: "21:00", placarA: 4, placarB: 2, craque: "HADSON", gols: [], cartoes: [] },
  { id: "g20", date: "2026-06-05", time: "21:00", placarA: 2, placarB: 2, craque: "RAFAEL", gols: [], cartoes: [] },
  { id: "g21", date: "2026-06-16", time: "21:00", placarA: 8, placarB: 4, craque: "VINICIUS", gols: [], cartoes: [] },
];

function criarSeedInicial() {
  return {
    temporadaVisualizadaId: "temp_1",
    temporadas: [
      {
        id: "temp_1",
        nome: "Temporada 2026 — 1º turno",
        criadaEm: "2026-01-09",
        arquivadaEm: null,
        timeA: { nome: "BRANCO", cor: "#F2EFE6" },
        timeB: { nome: "PRETO", cor: "#1a1a1a" },
        jogadores: seedJogadores,
        jogos: seedJogos,
        historico: {
          gols: Object.entries(golsHistoricoInicial).map(([nome, qtd]) => ({ jogador: nome, quantidade: qtd })),
        },
      },
      // Junta o arquivo externo aqui de forma limpa!
      temporadaHistorica2025
    ],
  };
}