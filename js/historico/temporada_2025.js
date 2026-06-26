// ============================================================
// DADOS HISTÓRICOS CONSOLIDADOS — BESTS LEAGUE 2025
// ============================================================
const temporadaHistorica2025 = {
  id: "temp_2025",
  nome: "Temporada 2025 — Turno Único",
  criadaEm: "2025-08-01",
  arquivadaEm: "2025-12-19",
  timeA: { nome: "BRANCO", cor: "#F2EFE6" },
  timeB: { nome: "AZUL", cor: "#2A4FE0" }, // Azul FUT Oficial
  jogadores: [
    { id: "h25_1", nome: "HADSON", time: "timeA", overall: 3 },
    { id: "h25_2", nome: "GEAN GK", time: "timeA", overall: 3 },
    { id: "h25_3", nome: "LUIS GUILHERME", time: "timeB", overall: 3 }, // Nome limpo (Lhulha)
    { id: "h25_4", nome: "JOÃO LUCAS GK", time: "timeB", overall: 3 },   // Nome limpo (João Lucas)
    { id: "h25_5", nome: "JOHN POMBO", time: "timeA", overall: 3 },
    { id: "h25_6", nome: "YURI", time: "timeA", overall: 3 },
    { id: "h25_7", nome: "WESLEY", time: "avulso", overall: 3 },
    { id: "h25_8", nome: "THIAGO FELIPE", time: "timeB", overall: 3 },  // Nome limpo (Thiago F)
    { id: "h25_9", nome: "GABRIEL", time: "timeB", overall: 3 },
    { id: "h25_10", nome: "BRUNO BÊ", time: "timeB", overall: 3 },       // Nome limpo (Bruno)
    { id: "h25_11", nome: "RENATO", time: "timeA", overall: 3 },
    { id: "h25_12", nome: "RENAN", time: "timeA", overall: 3 },
    { id: "h25_13", nome: "PACHECO", time: "timeB", overall: 3 },
    { id: "h25_14", nome: "DUDU", time: "timeA", overall: 3 },
    { id: "h25_15", nome: "WEMBLEY", time: "timeA", overall: 3 },
    { id: "h25_16", nome: "GUI MEDEIROS", time: "avulso", overall: 3 },
    { id: "h25_17", nome: "JOÃO GK", time: "avulso", overall: 3 },
    { id: "h25_18", nome: "PEDRO NAMBA", time: "avulso", overall: 3 },
    { id: "h25_19", nome: "RYAN", time: "timeA", overall: 3 },
    { id: "h25_20", nome: "ROBERT", time: "timeA", overall: 3 },
    { id: "h25_21", nome: "YURI DUM", time: "avulso", overall: 3 },
    { id: "h25_22", nome: "RAMON GK", time: "avulso", overall: 3 }
  ],
  jogos: [
    { id: "g25_1", date: "2025-08-01", time: "21:00", placarA: 8, placarB: 8, craque: "YURI", gols: [], cartoes: [] },
    { id: "g25_2", date: "2025-08-15", time: "21:00", placarA: 5, placarB: 4, craque: "THIAGO FELIPE", gols: [], cartoes: [] },
    { id: "g25_3", date: "2025-08-22", time: "21:00", placarA: 6, placarB: 5, craque: "JOHN POMBO", gols: [], cartoes: [] },
    { id: "g25_4", date: "2025-08-29", time: "21:00", placarA: 2, placarB: 4, craque: "BRUNO BÊ", gols: [], cartoes: [] },
    { id: "g25_5", date: "2025-09-05", time: "21:00", placarA: 5, placarB: 4, craque: "HADSON", gols: [], cartoes: [] },
    { id: "g25_6", date: "2025-09-12", time: "21:00", placarA: 7, placarB: 5, craque: "LUIS GUILHERME", gols: [], cartoes: [] },
    { id: "g25_7", date: "2025-09-26", time: "21:00", placarA: 1, placarB: 3, craque: "RAMON GK", gols: [], cartoes: [] },
    { id: "g25_8", date: "2025-10-03", time: "21:00", placarA: 6, placarB: 1, craque: "RENATO", gols: [], cartoes: [] },
    { id: "g25_9", date: "2025-10-10", time: "21:00", placarA: 4, placarB: 8, craque: "LUIS GUILHERME", gols: [], cartoes: [] },
    { id: "g25_10", date: "2025-10-17", time: "21:00", placarA: 3, placarB: 2, craque: "JOHN POMBO", gols: [], cartoes: [] },
    { id: "g25_11", date: "2025-10-24", time: "21:00", placarA: 9, placarB: 3, craque: "HADSON", gols: [], cartoes: [] },
    { id: "g25_12", date: "2025-10-31", time: "21:00", placarA: 4, placarB: 2, craque: "GEAN GK", gols: [], cartoes: [] },
    { id: "g25_13", date: "2025-11-07", time: "21:00", placarA: 6, placarB: 7, craque: "JOÃO LUCAS GK", gols: [], cartoes: [] },
    { id: "g25_14", date: "2025-11-14", time: "21:00", placarA: 2, placarB: 5, craque: "JOÃO LUCAS GK", gols: [], cartoes: [] },
    { id: "g25_15", date: "2025-11-21", time: "21:00", placarA: 2, placarB: 3, craque: "DUDU", gols: [], cartoes: [] },
    { id: "g25_16", date: "2025-11-28", time: "21:00", placarA: 4, placarB: 4, craque: "RYAN", gols: [], cartoes: [] },
    { id: "g25_17", date: "2025-12-05", time: "21:00", placarA: 6, placarB: 6, craque: "HADSON", gols: [], cartoes: [] },
    { id: "g25_18", date: "2025-12-11", time: "21:00", placarA: 6, placarB: 7, craque: "BRUNO BÊ", gols: [], cartoes: [] },
    { id: "g25_19", date: "2025-12-19", time: "Pênaltis: 1x3", placarA: 3, placarB: 5, craque: "THIAGO FELIPE", gols: [], cartoes: [] }
  ],
  historico: {
    gols: [
      { jogador: "HADSON", quantidade: 26 }, { jogador: "GEAN GK", quantidade: 17 },
      { jogador: "LUIS GUILHERME", quantidade: 17 }, { jogador: "JOÃO LUCAS GK", quantidade: 15 },
      { jogador: "JOHN POMBO", quantidade: 14 }, { jogador: "YURI", quantidade: 10 },
      { jogador: "WESLEY", quantidade: 10 }, { jogador: "THIAGO FELIPE", quantidade: 10 },
      { jogador: "GABRIEL", quantidade: 9 }, { jogador: "BRUNO BÊ", quantidade: 9 },
      { jogador: "RENATO", quantidade: 8 }, { jogador: "RENAN", quantidade: 4 },
      { jogador: "PACHECO", quantidade: 4 }, { jogador: "DUDU", quantidade: 3 },
      { jogador: "WEMBLEY", quantidade: 3 }, { jogador: "GUI MEDEIROS", quantidade: 2 },
      { jogador: "JOÃO GK", quantidade: 2 }, { jogador: "PEDRO NAMBA", quantidade: 2 },
      { jogador: "RYAN", quantidade: 2 }, { jogador: "ROBERT", quantidade: 1 },
      { jogador: "YURI DUM", quantidade: 1 }
    ]
  }
};