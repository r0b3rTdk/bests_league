// ============================================================
// BESTS LEAGUE — cálculos derivados (sempre sobre a temporada
// que está sendo visualizada no momento)
// ============================================================

function calcularArtilharia(temp) {
  const mapa = {};
  const garante = (nome) => {
    if (!mapa[nome]) {
      const j = temp.jogadores.find((p) => p.nome === nome);
      mapa[nome] = { jogador: nome, time: j ? j.time : null, gols: 0 };
    }
  };
  if (temp.historico) {
    temp.historico.gols.forEach((g) => {
      garante(g.jogador);
      mapa[g.jogador].gols += g.quantidade;
    });
  }
  temp.jogos.forEach((jogo) => {
    (jogo.gols || []).forEach((g) => {
      garante(g.jogador);
      mapa[g.jogador].gols += g.quantidade;
    });
  });
  return Object.values(mapa).sort((a, b) => b.gols - a.gols);
}

function calcularCartoes(temp) {
  const mapa = {};
  const garante = (nome) => {
    if (!mapa[nome]) {
      const j = temp.jogadores.find((p) => p.nome === nome);
      mapa[nome] = { jogador: nome, time: j ? j.time : null, amarelos: 0, vermelhos: 0 };
    }
  };
  temp.jogos.forEach((jogo) => {
    (jogo.cartoes || []).forEach((c) => {
      garante(c.jogador);
      if (c.tipo === "amarelo") mapa[c.jogador].amarelos += 1;
      else mapa[c.jogador].vermelhos += 1;
    });
  });
  return Object.values(mapa).sort((a, b) => (b.vermelhos * 3 + b.amarelos) - (a.vermelhos * 3 + a.amarelos));
}

function calcularCraques(temp) {
  const mapa = {};
  temp.jogos.forEach((jogo) => {
    if (!jogo.craque) return;
    if (!mapa[jogo.craque]) mapa[jogo.craque] = 0;
    mapa[jogo.craque] += 1;
  });
  return Object.entries(mapa)
    .map(([jogador, vezes]) => ({ jogador, vezes }))
    .sort((a, b) => b.vezes - a.vezes);
}

function calcularConfronto(temp) {
  let vitoriasA = 0, vitoriasB = 0, empates = 0;
  let golsA = 0, golsB = 0, jogosValidos = 0;
  temp.jogos.forEach((jogo) => {
    if (jogo.placarA === null || jogo.placarA === undefined || jogo.placarB === null || jogo.placarB === undefined) return;
    jogosValidos++;
    golsA += jogo.placarA;
    golsB += jogo.placarB;
    if (jogo.placarA > jogo.placarB) vitoriasA++;
    else if (jogo.placarB > jogo.placarA) vitoriasB++;
    else empates++;
  });
  const totalGols = golsA + golsB;
  const mediaGolsPorJogo = jogosValidos > 0 ? (totalGols / jogosValidos) : 0;
  return { vitoriasA, vitoriasB, empates, golsA, golsB, jogosValidos, totalGols, mediaGolsPorJogo };
}

function jogosOrdenados(temp) {
  return [...temp.jogos].sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
}

// Estatísticas individuais de um jogador específico (para o card/perfil)
function estatisticasJogador(temp, nomeJogador) {
  let gols = 0, amarelos = 0, vermelhos = 0, craques = 0;
  if (temp.historico) {
    temp.historico.gols.forEach((g) => { if (g.jogador === nomeJogador) gols += g.quantidade; });
  }
  const jogosComPlacar = temp.jogos.filter((j) => j.placarA !== null && j.placarA !== undefined);
  temp.jogos.forEach((jogo) => {
    (jogo.gols || []).forEach((g) => {
      if (g.jogador === nomeJogador) gols += g.quantidade;
    });
    (jogo.cartoes || []).forEach((c) => {
      if (c.jogador === nomeJogador) {
        if (c.tipo === "amarelo") amarelos++; else vermelhos++;
      }
    });
    if (jogo.craque === nomeJogador) craques++;
  });
  // Média de gols por jogo: usamos o total de jogos disputados na temporada
  // como base, já que não registramos escalação individual por partida.
  const jogosDisputados = jogosComPlacar.length;
  const mediaGolsPorJogo = jogosDisputados > 0 ? (gols / jogosDisputados) : 0;
  return { gols, amarelos, vermelhos, craques, jogosDisputados, mediaGolsPorJogo };
}

// Verifica se uma data (YYYY-MM-DD) cai numa sexta-feira
function ehSextaFeira(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T12:00:00");
  return d.getDay() === 5;
}
