// ============================================================
// BESTS LEAGUE — aba Jogadores (cards estilo FIFA Ultimate Team)
// Base visual & Efeitos Tilt 3D integrados do projeto CARDS
// PARTE 1 DE 2
// ============================================================

let subTabJogadores = "temporada"; 

function raridade(overall) {
  if (overall <= 2) return "bronze";
  if (overall === 3) return "prata";
  if (overall === 4) return "ouro";
  return "icon";
}

// Gradientes de fundo da carta extraídos da base do projeto CARDS
const CARD_BG = {
  bronze: "radial-gradient(ellipse at 50% 22%, #e0a862 0%, #8a4f1e 45%, #2c1608 100%)",
  prata:  "radial-gradient(ellipse at 50% 22%, #eef2f7 0%, #8d99ac 45%, #262c36 100%)",
  ouro:   "radial-gradient(ellipse at 50% 22%, #ffe28a 0%, #d8a832 45%, #5c3f05 100%)",
  icon:   "radial-gradient(ellipse at 50% 22%, #e6b9ff 0%, #a53bff 45%, #250a45 100%)",
  lenda:  "radial-gradient(ellipse at 50% 22%, #fffdf3 0%, #e9d9a4 42%, #9c7a2e 100%)",
};

const CARD_COR_TEXTO = {
  bronze: "#f0b26b",
  prata:  "#dfe6ee",
  ouro:   "#ffe9ad",
  icon:   "#e9c8ff",
  lenda:  "#fff6d8",
};

// Helper interno para calcular o campeão de qualquer temporada (Hall of Fame e Títulos)
function descobrirTimeCampeaoObjeto(temp) {
  if (temp.id === "temp_2025" || (temp.nome && temp.nome.includes("2025"))) {
    return { ehTimeACampeao: false, objeto: temp.timeB, vitA: 8, vitB: 8, emp: 3, gpA: 89, gcA: 86, gpB: 86, gcB: 89, derA: 8, derB: 8 };
  }

  let vitA = 0, vitB = 0, emp = 0, gpA = 0, gcA = 0, gpB = 0, gcB = 0;
  const jogosValidos = (temp.jogos || []).filter(j => j.placarA !== null && j.placarA !== undefined && j.placarB !== null && j.placarB !== undefined);
  
  jogosValidos.forEach(j => {
    gpA += j.placarA; gcA += j.placarB; gpB += j.placarB; gcB += j.placarA;
    if (j.placarA > j.placarB) { vitA++; } else if (j.placarB > j.placarA) { vitB++; } else { emp++; }
  });

  const ptsA = (vitA * 3) + emp;
  const ptsB = (vitB * 3) + emp;
  const ehA = ptsA >= ptsB;

  return { ehTimeACampeao: ehA, objeto: ehA ? temp.timeA : temp.timeB, vitA, vitB, emp, gpA, gcA, gpB, gcB, derA: vitB, derB: vitA };
}

function calcularLendasdaPelada() {
  const mapaLendas = {};
  const listaTemporadas = appState.temporadas || [];
  
  listaTemporadas.forEach((temp) => {
    const jogosValidos = (temp.jogos || []).filter(j => j.placarA !== null && j.placarA !== undefined && j.placarB !== null && j.placarB !== undefined);
    const jogosComPlacar = jogosValidos.length;
    const jogadoresTemp = temp.jogadores || [];
    const resultadoCampeao = descobrirTimeCampeaoObjeto(temp);
    
    const tempKey = temp.id || temp.nome || Math.random().toString();

    // 1. Soma gols do histórico estruturado (Temporadas antigas)
    if (temp.historico && temp.historico.gols) {
      temp.historico.gols.forEach((g) => {
        const nomeLimpo = g.jogador ? g.jogador.trim() : "";
        if (!nomeLimpo) return;
        
        const chaveBusca = nomeLimpo.toLowerCase();
        if (!mapaLendas[chaveBusca]) {
          mapaLendas[chaveBusca] = { nome: nomeLimpo, overall: 3, gols: 0, jogosDisputados: 0, titulos: 0, craques: 0, temporadasAtivas: new Set() };
        }
        mapaLendas[chaveBusca].gols += g.quantidade || 1;
        mapaLendas[chaveBusca].temporadasAtivas.add(tempKey);
      });
    }

    // 2. Mapeia elenco e títulos acumulados
    jogadoresTemp.forEach((j) => {
      const nomeLimpo = j.nome ? j.nome.trim() : "";
      if (!nomeLimpo) return;

      const chaveBusca = nomeLimpo.toLowerCase();
      if (!mapaLendas[chaveBusca]) {
        mapaLendas[chaveBusca] = { nome: j.nome, overall: j.overall || 3, gols: 0, jogosDisputados: 0, titulos: 0, craques: 0, temporadasAtivas: new Set() };
      }
      mapaLendas[chaveBusca].overall = Math.max(mapaLendas[chaveBusca].overall, j.overall || 3);
      
      if (jogosComPlacar > 0) {
        mapaLendas[chaveBusca].temporadasAtivas.add(tempKey);
        mapaLendas[chaveBusca].jogosDisputados += jogosComPlacar;
      }

      const tClean = j.time ? j.time.toLowerCase().trim() : "";
      const estavaNoTimeA = tClean === "timea" || tClean === "bra";
      const estavaNoTimeB = tClean === "timeb" || tClean === "ver";

      const temporadaEncerrada = !!(temp.arquivadaEm);
      if (temporadaEncerrada && jogosComPlacar > 0 && ((resultadoCampeao.ehTimeACampeao && estavaNoTimeA) || (!resultadoCampeao.ehTimeACampeao && estavaNoTimeB))) {
        mapaLendas[chaveBusca].titulos += 1;
      }
    });

    // 3. Soma gols das partidas normais de cada temporada + quantas vezes foi craque
    jogosValidos.forEach((jogo) => {
      (jogo.gols || []).forEach((g) => {
        const nomeLimpo = g.jogador ? g.jogador.trim() : "";
        if (!nomeLimpo) return;

        const chaveBusca = nomeLimpo.toLowerCase();
        if (!mapaLendas[chaveBusca]) {
          mapaLendas[chaveBusca] = { nome: g.jogador, overall: 3, gols: 0, jogosDisputados: 0, titulos: 0, craques: 0, temporadasAtivas: new Set() };
        }
        if (!temp.historico) {
          mapaLendas[chaveBusca].gols += g.quantidade || 1;
        }
        if (jogosComPlacar > 0) {
          mapaLendas[chaveBusca].temporadasAtivas.add(tempKey);
        }
      });

      const nomeCraque = jogo.craque ? jogo.craque.trim() : "";
      if (nomeCraque) {
        const chaveCraque = nomeCraque.toLowerCase();
        if (!mapaLendas[chaveCraque]) {
          mapaLendas[chaveCraque] = { nome: nomeCraque, overall: 3, gols: 0, jogosDisputados: 0, titulos: 0, craques: 0, temporadasAtivas: new Set() };
        }
        mapaLendas[chaveCraque].craques += 1;
        mapaLendas[chaveCraque].temporadasAtivas.add(tempKey);
      }
    });
  });

  return Object.values(mapaLendas)
    .filter((jogador) => jogador.temporadasAtivas.size > 1)
    .sort((a, b) => b.gols - a.gols || b.jogosDisputados - a.jogosDisputados);
}

function buscarFotoPorNome(nome) {
  const nomeUpper = (nome || "").trim().toLowerCase();
  if (!nomeUpper) return "";
  
  // CORREÇÃO AQUI: tiramos o "window." para ele ler o banco de dados corretamente
  const temporadas = (typeof appState !== "undefined" ? appState.temporadas : []) || [];
  
  for (const t of temporadas) {
    const achado = (t.jogadores || []).find((j) => j.foto && j.nome && j.nome.trim().toLowerCase() === nomeUpper);
    if (achado) return achado.foto;
  }
  return "";
}

function legendaEhCapitaoAtual(nome) {
  if (typeof capitaoDoTime !== "function" || typeof temporadaEmAndamento !== "function") return false;
  const ativa = temporadaEmAndamento();
  if (!ativa) return false;
  const nomeUpper = (nome || "").trim().toLowerCase();
  if (!nomeUpper) return false;
  const capA = capitaoDoTime(ativa, TIME_A);
  const capB = capitaoDoTime(ativa, TIME_B);
  return !!((capA && capA.nome.trim().toLowerCase() === nomeUpper) || (capB && capB.nome.trim().toLowerCase() === nomeUpper));
}

function gerarHtmlHallOfFameInline(temp) {
  const res = descobrirTimeCampeaoObjeto(temp);
  const jogosValidos = (temp.jogos || []).filter(j => j.placarA !== null && j.placarA !== undefined && j.placarB !== null && j.placarB !== undefined);

  let mapaGols = {}, mapaCraques = {};
  
  if (temp.historico && temp.historico.gols) {
    temp.historico.gols.forEach(g => { 
      mapaGols[g.jogador] = (mapaGols[g.jogador] || 0) + (g.quantidade || 1);
    });
  }
  jogosValidos.forEach(j => {
    if (j.craque) mapaCraques[j.craque] = (mapaCraques[j.craque] || 0) + 1;
    (j.gols || []).forEach(g => { 
      mapaGols[g.jogador] = (mapaGols[g.jogador] || 0) + (g.quantidade || 1);
    });
  });

  const topScorer = Object.entries(mapaGols).sort((a,b) => b[1] - a[1])[0] || ["Nenhum", 0];
  const topMVP = Object.entries(mapaCraques).sort((a,b) => b[1] - a[1])[0] || ["Nenhum", 0];

  const jogadoresCampeoes = (temp.jogadores || []).filter(j => {
    const tClean = j.time ? j.time.toLowerCase().trim() : "";
    return res.ehTimeACampeao ? (tClean === "timea" || tClean === "bra") : (tClean === "timeb" || tClean === "ver");
  });

  const botaoReabrirHtml = window.isAdmin ? `
    <div style="text-align: center; margin-bottom: 25px;">
      <button type="button" class="bl-btn-secondary" id="btnReabrirTemporadaAcao" style="border-color: var(--bl-gold); color: var(--bl-gold-light); font-size: 11px; padding: 6px 14px;">
        🔓 Reabrir Temporada (Voltar a Editar)
      </button>
    </div>` : '';

  return `
    <div class="bl-hall-fame-inline-container">
      ${botaoReabrirHtml}
      
      <h3 class="bl-section-title-fame">👥 Elenco Vitorioso</h3>
      <div class="bl-fifa-cards-grid-fame">
        ${jogadoresCampeoes.map((j, i) => typeof renderFifaCard === "function" ? renderFifaCard(temp, j, false, i) : `<div>${j.nome}</div>`).join("")}
      </div>

      <div class="bl-awards-row">
        <div class="bl-award-badge gold">
          <div class="bl-award-icon">⚽</div>
          <div class="bl-award-info">
            <span class="bl-award-label">ARTILHEIRO</span>
            <span class="bl-award-player">${topScorer[0]}</span>
            <span class="bl-award-stat">${topScorer[1]} Gols</span>
          </div>
        </div>
        <div class="bl-award-badge purple">
          <div class="bl-award-icon">⭐</div>
          <div class="bl-award-info">
            <span class="bl-award-label">CRAQUE DA TEMPORADA</span>
            <span class="bl-award-player">${topMVP[0]}</span>
            <span class="bl-award-stat">${topMVP[1]}× MVP</span>
          </div>
        </div>
      </div>

      ${renderBlocoEstatisticas(temp)}
    </div>
  `;
}

function initFameDragScroll() {
  const slider = document.querySelector('.bl-fifa-cards-grid-fame');
  if (!slider) return;
  
  let isDown = false, startX, scrollLeft;
  slider.style.cursor = 'grab';

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.style.cursor = 'grabbing';
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener('mouseleave', () => { isDown = false; slider.style.cursor = 'grab'; });
  slider.addEventListener('mouseup', () => { isDown = false; slider.style.cursor = 'grab'; });
// ============================================================
// BESTS LEAGUE — aba Jogadores (cards estilo FIFA Ultimate Team)
// PARTE 2 DE 2
// ============================================================

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.5;
    slider.scrollLeft = scrollLeft - walk;
  });
}

function renderJogadoresTab() {
  if (perfilJogadorAberto) return renderPerfilJogador(perfilJogadorAberto);

  const temp = temporadaVisualizada();
  const listaJogadores = temp && temp.jogadores ? temp.jogadores : [];

  const grupos = [
    { key: "timeA", label: temp.timeA.nome },
    { key: "timeB", label: temp.timeB.nome },
    { key: "avulso", label: "Avulso" },
  ];

  const toolbar = `
    <div class="bl-elenco-toolbar">
      <div class="bl-title-group">
        <h2>Elenco — ${escapeHtml(temp.nome)}</h2>
      </div>
      <div class="bl-toggle-group">
        <button type="button" class="bl-btn-toggle ${subTabJogadores === 'temporada' ? 'active' : ''}" id="btnSubTabTemporada">Por Temporada</button>
        <button type="button" class="bl-btn-toggle ${subTabJogadores === 'lendas' ? 'active' : ''}" id="btnSubTabLendas">Lendas</button>
      </div>
      <button type="button" class="bl-btn-primary" id="btnGerenciarElenco">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Gerenciar elenco
      </button>
    </div>
  `;

  if (listaJogadores.length === 0 && subTabJogadores === "temporada") {
    return toolbar + emptyStateHtml(ICONS.users, "Nenhum jogador cadastrado", "Clique em Gerenciar elenco para adicionar");
  }

  if (subTabJogadores === "temporada") {
    const secoes = grupos.map(({ key, label }) => {
      const jogadoresDoTime = [...listaJogadores].filter((j) => {
        if (!j.time) return key === "avulso";
        const tClean = j.time.toLowerCase().trim();
        if (key === "timeA") {
          return tClean === "timea" || tClean === "bra" || (temp.timeA && temp.timeA.nome && temp.timeA.nome.toLowerCase().includes(tClean));
        }
        if (key === "timeB") {
          return tClean === "timeb" || tClean === "ver" || (temp.timeB && temp.timeB.nome && temp.timeB.nome.toLowerCase().includes(tClean));
        }
        return tClean === "avulso" || tClean === "avl";
      }).sort((a, b) => (b.overall || 0) - (a.overall || 0) || a.nome.localeCompare(b.nome));

      if (jogadoresDoTime.length === 0) return "";
      const timeIdCrest = key === "timeA" ? "timeA" : key === "timeB" ? "timeB" : "avulso";

      const timeReal = key === "timeA" ? TIME_A : key === "timeB" ? TIME_B : null;
      const formaTime = timeReal && typeof formaRecenteDoTime === "function" ? formaRecenteDoTime(temp, timeReal, 5) : [];
      const formaHtml = formaTime.length ? `
        <div class="bl-time-forma" title="Últimos resultados do time">
          ${formaTime.map((r) => `<span class="forma-dot forma-${r}"></span>`).join("")}
        </div>
      ` : "";

      return `
        <div class="bl-time-secao">
          <h3 class="bl-time-secao-label">
            ${crestHtml(temp, timeIdCrest, 20)} ${escapeHtml(label)}
            ${formaHtml}
          </h3>
          <div class="bl-fifa-cards-grid">
            ${jogadoresDoTime.map((j, i) => renderFifaCard(temp, j, false, i)).join("")}
          </div>
        </div>
      `;
    }).join("");
    return toolbar + secoes;
  } else {
    const lendas = calcularLendasdaPelada();
    if (lendas.length === 0) {
      return toolbar + emptyStateHtml(ICONS.users, "Nenhuma lenda coroada", "Os jogadores precisam disputar mais de uma temporada para aparecer aqui.");
    }

    const artilheiroLendas = lendas[0];
    const craqueLendas = [...lendas].sort((a, b) => (b.craques || 0) - (a.craques || 0))[0];

    // NOVO: Cria as plaquinhas de premiação histórica usando o estilo já existente
    // NOVO: Cria as plaquinhas de premiação histórica usando o estilo já existente
    const painelHistoricoHtml = `
      <div class="bl-awards-row" style="margin-bottom: 24px;">
        ${artilheiroLendas && artilheiroLendas.gols > 0 ? `
        <div class="bl-award-badge badge-lenda">
          <div class="bl-award-icon">⚽</div>
          <div class="bl-award-info">
            <span class="bl-award-label">ARTILHEIRO HISTÓRICO</span>
            <span class="bl-award-player">${escapeHtml(artilheiroLendas.nome)}</span>
            <span class="bl-award-stat">${artilheiroLendas.gols} GOLS</span>
          </div>
        </div>` : ""}
        ${craqueLendas && craqueLendas.craques > 0 ? `
        <div class="bl-award-badge badge-lenda">
          <div class="bl-award-icon">⭐</div>
          <div class="bl-award-info">
            <span class="bl-award-label">MAIOR CRAQUE DA HISTÓRIA</span>
            <span class="bl-award-player">${escapeHtml(craqueLendas.nome)}</span>
            <span class="bl-award-stat">${craqueLendas.craques}× MVP</span>
          </div>
        </div>` : ""}
      </div>
    `;

    return toolbar + `
      <div class="bl-time-secao">
        <h3 class="bl-time-secao-label">⭐ Histórico Geral da Pelada</h3>
        
        ${painelHistoricoHtml}

        <div class="bl-fifa-cards-grid">
          ${lendas.map((l, i) => {
            return templateFifaCardHtml({
              nome: l.nome,
              overall: l.overall,
              gols: l.gols,
              jogos: l.jogosDisputados,
              craques: l.craques,
              grande: false,
              isLenda: true,
              textoTime: "LNDA",
              titulos: l.titulos,
              souCapitao: legendaEhCapitaoAtual(l.nome),
              foto: buscarFotoPorNome(l.nome),
              souArtilheiro: !!(artilheiroLendas && artilheiroLendas.gols > 0 && l.nome === artilheiroLendas.nome),
              souMaiorCraque: !!(craqueLendas && craqueLendas.craques > 0 && l.nome === craqueLendas.nome),
              indice: i,
            });
          }).join("")}
        </div>
      </div>
    `;
  }
}

function renderFifaCard(temp, j, grande, indice) {
  const stats = 'estatisticasJogador' in window ? window.estatisticasJogador(temp, j.nome) : { gols:0, mediaGolsPorJogo:0, amarelos:0, vermelhos:0, craques:0, jogosDisputados:0 };
  const media = stats.mediaGolsPorJogo.toFixed(2);
  const tClean = j.time ? j.time.toLowerCase().trim() : "";
  const isA = tClean === "timea" || tClean === "bra" || (temp.timeA && temp.timeA.nome && temp.timeA.nome.toLowerCase().includes(tClean));
  const isB = tClean === "timeb" || tClean === "ver" || (temp.timeB && temp.timeB.nome && temp.timeB.nome.toLowerCase().includes(tClean));
  const nomeTime = isA ? temp.timeA.nome : isB ? temp.timeB.nome : "AVL";

  let ehCapitao = false;
  if ((j.time === TIME_A || j.time === TIME_B) && typeof capitaoDoTime === "function") {
    const capitaoTime = capitaoDoTime(temp, j.time);
    ehCapitao = !!(capitaoTime && capitaoTime.id === j.id);
  }

  const artilhariaTemp = typeof calcularArtilharia === "function" ? calcularArtilharia(temp) : [];
  const craquesTemp = typeof calcularCraques === "function" ? calcularCraques(temp) : [];
  const liderArtilheiro = artilhariaTemp[0];
  const liderCraque = craquesTemp[0];
  const souArtilheiro = !!(liderArtilheiro && liderArtilheiro.gols > 0 && liderArtilheiro.jogador === j.nome);
  const souMaiorCraque = !!(liderCraque && liderCraque.vezes > 0 && liderCraque.jogador === j.nome);

  const corTime = isA ? temp.timeA.cor : isB ? temp.timeB.cor : "#5B7DFF";

  const ehGoleiro = /\bGK\b/i.test(j.nome);
  let statSecundarioValor = media;
  let statSecundarioLabel = "Média";
  if (ehGoleiro && (isA || isB) && typeof jogosSemSofrerGolsDoTime === "function") {
    statSecundarioValor = jogosSemSofrerGolsDoTime(temp, isA ? TIME_A : TIME_B);
    statSecundarioLabel = "Sem sofrer";
  }

  return templateFifaCardHtml({
    nome: j.nome,
    overall: j.overall,
    gols: stats.gols,
    media,
    statSecundarioValor,
    statSecundarioLabel,
    amarelos: stats.amarelos,
    vermelhos: stats.vermelhos,
    craques: stats.craques,
    jogos: stats.jogosDisputados,
    grande,
    isLenda: false,
    textoTime: nomeTime,
    corTime,
    souCapitao: ehCapitao,
    foto: j.foto || "",
    souArtilheiro,
    souMaiorCraque,
    indice,
  });
}

function formaRecenteDoTime(temp, time, qtd) {
  qtd = qtd || 5;
  const jogosValidos = (typeof jogosOrdenados === "function" ? jogosOrdenados(temp) : (temp.jogos || []))
    .filter((j) => j.placarA !== null && j.placarA !== undefined && j.placarB !== null && j.placarB !== undefined);
  const ultimos = jogosValidos.slice(-qtd);
  return ultimos.map((j) => {
    const meu = time === TIME_A ? j.placarA : j.placarB;
    const adversario = time === TIME_A ? j.placarB : j.placarA;
    if (meu > adversario) return "V";
    if (meu < adversario) return "D";
    return "E";
  });
}

function jogosSemSofrerGolsDoTime(temp, time) {
  const jogosValidos = (temp.jogos || []).filter((j) => j.placarA !== null && j.placarA !== undefined && j.placarB !== null && j.placarB !== undefined);
  return jogosValidos.filter((j) => (time === TIME_A ? j.placarB : j.placarA) === 0).length;
}

// Template HTML Unificado com carcaça/efeito metálico do CARDS + dados do Bests League
function templateFifaCardHtml(dados) {
  const {
    nome, overall, gols, media = 0, amarelos = 0, vermelhos = 0, craques = 0, jogos = 0,
    grande, isLenda, textoTime, corTime, souCapitao, foto, souArtilheiro, souMaiorCraque,
    titulos = 0, indice,
    statSecundarioValor, statSecundarioLabel,
  } = dados;
  const ov = overall || 3;
  const rar = isLenda ? "lenda" : raridade(ov);
  const cor = CARD_COR_TEXTO[rar];
  const bg = CARD_BG[rar];
  const tam = grande ? "bl-fcard-grande" : "";
  const clicavel = grande ? "" : `data-perfil-jogador="${escapeHtml(nome.trim())}"`;
  const atraso = typeof indice === "number" ? `style="--fcard-cor:${cor}; background:${bg}; --fcard-atraso:${(indice % 8) * 0.06}s;"` : `style="--fcard-cor:${cor}; background:${bg};"`;

  const valorSecundario = statSecundarioValor !== undefined ? statSecundarioValor : media;
  const labelSecundario = statSecundarioLabel || "Média";

  // 1. Zera a badge antiga de texto no meio do card
  const tituloBadgeHtml = ""; 

  // 2. Cria a tag do novo selo circular
  const badgeCampeaoHtml = titulos > 0 ? `
    <span class="fut-card-badge fut-card-campeao" title="${titulos}x Campeão">
      🏆<span class="badge-count">${titulos}</span>
    </span>
  ` : "";

  const AtributosLayoutHtml = isLenda ? `
    <div class="player-features" style="justify-content: center; gap: 8px; margin-top: 8px;">
      <div class="player-features-col" style="border: none; align-items: center; padding: 0;">
        <span style="flex-direction: column; gap: 0px;">
          <span class="player-feature-value" style="font-size: 1.15rem;">${jogos}</span>
          <span class="player-feature-title" style="font-size: 0.65rem; text-align: center;">JOGOS</span>
        </span>
      </div>
      <div class="player-features-col" style="border: none; align-items: center; padding: 0;">
        <span style="flex-direction: column; gap: 0px;">
          <span class="player-feature-value" style="font-size: 1.15rem;">${gols}</span>
          <span class="player-feature-title" style="font-size: 0.65rem; text-align: center;">GOLS</span>
        </span>
      </div>
      <div class="player-features-col" style="border: none; align-items: center; padding: 0;">
        <span style="flex-direction: column; gap: 0px;">
          <span class="player-feature-value" style="font-size: 1.15rem;">${craques}</span>
          <span class="player-feature-title" style="font-size: 0.65rem; text-align: center;">⭐ MVP</span>
        </span>
      </div>
    </div>
  ` : `
    <div class="player-features">
      <div class="player-features-col">
        <span><span class="player-feature-value">${gols}</span><span class="player-feature-title">Gols</span></span>
        <span><span class="player-feature-value">${valorSecundario}</span><span class="player-feature-title">${escapeHtml(labelSecundario)}</span></span>
        <span><span class="player-feature-value">${amarelos}</span><span class="player-feature-title">Amar.</span></span>
      </div>
      <div class="player-features-col">
        <span><span class="player-feature-value">${vermelhos}</span><span class="player-feature-title">Verm.</span></span>
        <span><span class="player-feature-value">${craques}</span><span class="player-feature-title">Craque</span></span>
        <span><span class="player-feature-value">${jogos}</span><span class="player-feature-title">Jogos</span></span>
      </div>
    </div>
  `;

  const fotoHtml = foto
    ? `<img class="player-photo-real" src="${escapeHtml(foto)}" alt="${escapeHtml(nome)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />`
    : "";
  const silhuetaEscondida = foto ? `style="display:none;"` : "";

  return `
    <div class="fut-player-card ${tam}" data-rarity="${rar}" ${clicavel} ${atraso}>
      <div class="fut-card-shine"></div>
      <div class="player-photo-zone">
        ${fotoHtml}
        <div class="player-silhouette" ${silhuetaEscondida}>
          <svg viewBox="0 0 80 90" fill="none">
            <ellipse cx="40" cy="26" rx="16" ry="18" fill="${cor}" opacity="0.5"/>
            <path d="M10 90 C10 60 70 60 70 90" fill="${cor}" opacity="0.5"/>
          </svg>
        </div>
        <div class="player-photo-scrim"></div>
        <div class="player-master-info" style="color:${cor}">
          <div class="player-rating">${ov}</div>
          <div class="player-stars">${starsSmall(ov, cor)}</div>
          <div class="player-team-dot" style="background:${corTime || cor};" title="Cor do time"></div>
        </div>
        <div class="fut-card-badges">
          ${badgeCampeaoHtml}
          ${souMaiorCraque ? `<span class="fut-card-badge fut-card-maiorcraque" title="Maior craque do jogo">🏅</span>` : ""}
          ${souArtilheiro ? `<span class="fut-card-badge fut-card-artilheiro" title="Artilheiro">⚽</span>` : ""}
          ${souCapitao ? `<span class="fut-card-capitao" title="Capitão do time">C</span>` : ""}
        </div>
      </div>
      <div class="player-card-bottom">
        <div class="player-info" style="color:${cor}">
          <div class="player-name"><span>${escapeHtml(nome)}</span></div>
          ${tituloBadgeHtml}
          ${AtributosLayoutHtml}
        </div>
      </div>
    </div>
  `;
}

function starsSmall(overall, cor) {
  let h = "";
  for (let i = 1; i <= 5; i++) { h += `<span style="color:${i <= overall ? cor : "rgba(255,255,255,0.2)"};font-size:10px;">★</span>`; }
  return h;
}

// ============================================================
// EFEITO TILT 3D (EXTRAÍDO DO PROJETO CARDS)
// ============================================================
function initFutCardTilt() {
  return
  if (!window.matchMedia) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest && e.target.closest(".fut-player-card");
    if (!card || card.classList.contains("bl-fcard-grande")) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 16;
    const rx = (0.5 - py) * 16;
    card.style.transition = "transform 0.05s linear, box-shadow 0.2s ease";
    card.style.setProperty("--ry", ry.toFixed(2) + "deg");
    card.style.setProperty("--rx", rx.toFixed(2) + "deg");
  });

  document.addEventListener("mouseout", (e) => {
    const card = e.target.closest && e.target.closest(".fut-player-card");
    if (!card) return;
    const indoPara = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest(".fut-player-card") : null;
    if (indoPara !== card) {
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--rx", "0deg");
    }
  });
}

function renderPerfilJogador(nomeJogador) {
  const temp = temporadaVisualizada();
  const elencoAtual = temp && temp.jogadores ? temp.jogadores : [];
  let j = elencoAtual.find((p) => p.nome === nomeJogador);
  
  if (!j) {
    const lendas = calcularLendasdaPelada();
    const lenda = lendas.find(p => p.nome === nomeJogador);
    if (!lenda) { perfilJogadorAberto = null; return renderJogadoresTab(); }
    j = { nome: lenda.nome, overall: lenda.overall };
  }

  const historicoSeasons = [];
  const listaTemporadas = appState.temporadas || [];
  
  listaTemporadas.forEach((t) => {
    const stats = 'estatisticasJogador' in window ? window.estatisticasJogador(t, nomeJogador) : { gols:0, jogosDisputados:0, craques:0 };
    const tJogadores = t.jogadores || [];
    const noElenco = tJogadores.some(p => p.nome === nomeJogador);
    
    if (noElenco || stats.gols > 0 || stats.craques > 0) {
      historicoSeasons.push({
        nomeTemporada: t.nome,
        time: tJogadores.find(p => p.nome === nomeJogador)?.time || "avulso",
        stats: stats,
        tempObj: t
      });
    }
  });

  let secaoHistoricoHtml = "";
  if (historicoSeasons.length > 1) {
    secaoHistoricoHtml = `
      <div class="bl-profile-history-section">
        <h3 class="bl-profile-history-title">📊 Histórico de Carreira por Temporada</h3>
        <div class="bl-table-wrap">
          <table class="bl-table bl-table-profile">
            <thead>
              <tr>
                <th>Temporada</th>
                <th>Equipe</th>
                <th style="text-align:center;">Partidas</th>
                <th style="text-align:center;">Gols</th>
                <th style="text-align:center;">Média</th>
                <th style="text-align:center;">Craque</th>
              </tr>
            </thead>
            <tbody>
              ${historicoSeasons.map(s => {
                const media = s.stats.jogosDisputados > 0 ? (s.stats.gols / s.stats.jogosDisputados).toFixed(2) : "0.00";
                const tClean = s.time ? s.time.toLowerCase().trim() : "";
                const isA = tClean === "timea" || tClean === "bra" || (s.tempObj.timeA && s.tempObj.timeA.nome && s.tempObj.timeA.nome.toLowerCase().includes(tClean));
                const isB = tClean === "timeb" || tClean === "ver" || (s.tempObj.timeB && s.tempObj.timeB.nome && s.tempObj.timeB.nome.toLowerCase().includes(tClean));
                const timeIdCrest = isA ? "timeA" : isB ? "timeB" : "avulso";
                const timeLabel = isA ? s.tempObj.timeA.nome : isB ? s.tempObj.timeB.nome : "Avulso";

                return `
                  <tr>
                    <td class="bl-td-nome" style="color: var(--bl-text); font-weight: 500;">${escapeHtml(s.nomeTemporada)}</td>
                    <td>${crestHtml(s.tempObj, timeIdCrest, 16)} <span class="bl-td-muted" style="font-size:12px; margin-left:4px;">${escapeHtml(timeLabel)}</span></td>
                    <td style="text-align:center; font-weight:600; color: var(--bl-text);">${s.stats.jogosDisputados}</td>
                    <td style="text-align:center; font-weight:700; color:var(--bl-gold-light);">${s.stats.gols}</td>
                    <td style="text-align:center; color:var(--bl-text-dim); font-size:13px;">${media}</td>
                    <td style="text-align:center; color:var(--bl-gold); font-weight:600;">${s.stats.craques}×</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  const esLendaCard = subTabJogadores === "lendas";
  const lendaEncontrada = esLendaCard ? calcularLendasdaPelada().find(p => p.nome === nomeJogador) : null;
  let cardHtml;
  if (esLendaCard && lendaEncontrada) {
    const lendasOrdenadas = calcularLendasdaPelada();
    const artilheiroLendas = lendasOrdenadas[0];
    const craqueLendas = [...lendasOrdenadas].sort((a, b) => (b.craques || 0) - (a.craques || 0))[0];
    
    cardHtml = templateFifaCardHtml({
      nome: j.nome,
      overall: j.overall,
      gols: lendaEncontrada.gols || 0,
      jogos: lendaEncontrada.jogosDisputados || 0,
      craques: lendaEncontrada.craques || 0,
      grande: true,
      isLenda: true,
      textoTime: "LNDA",
      titulos: lendaEncontrada.titulos || 0,
      souCapitao: legendaEhCapitaoAtual(j.nome),
      foto: buscarFotoPorNome(j.nome),
      souArtilheiro: !!(artilheiroLendas && artilheiroLendas.gols > 0 && j.nome === artilheiroLendas.nome),
      souMaiorCraque: !!(craqueLendas && craqueLendas.craques > 0 && j.nome === craqueLendas.nome),
    });
  } else {
    cardHtml = renderFifaCard(temp, j, true);
  }

  return `
    <button type="button" class="bl-btn-voltar" id="btnVoltarElenco">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 5"></polyline></svg>
      Voltar para o elenco
    </button>
    <div class="bl-perfil-container">
      <div class="bl-perfil-wrap">
        ${cardHtml}
      </div>
      ${secaoHistoricoHtml}
    </div>
  `;
}

function attachTabContentListeners() {
  document.querySelectorAll("[data-edit-jogo]").forEach((el) => {
    el.addEventListener("click", () => {
      const temp = temporadaVisualizada();
      const listJogos = temp && temp.jogos ? temp.jogos : [];
      const jogo = listJogos.find((j) => j.id === el.getAttribute("data-edit-jogo"));
      if (jogo) window.openJogoModal(jogo);
    });
  });
  document.querySelectorAll("[data-delete-jogo]").forEach((el) => {
    el.addEventListener("click", () => { window.openConfirmDelete(el.getAttribute("data-delete-jogo")); });
  });
  document.querySelectorAll("[data-perfil-jogador]").forEach((el) => {
    el.addEventListener("click", () => {
      perfilJogadorAberto = el.getAttribute("data-perfil-jogador");
      renderTabContentOnly();
    });
  });
  const btnVoltar = document.getElementById("btnVoltarElenco");
  if (btnVoltar) btnVoltar.addEventListener("click", () => {
    perfilJogadorAberto = null;
    renderTabContentOnly();
  });
  
  const btnGerenciar = document.getElementById("btnGerenciarElenco");
  if (btnGerenciar) btnGerenciar.addEventListener("click", () => {
    const adminToken = window.localStorage.getItem("bl_admin_token");
    window.isAdmin = adminToken === "PELADA_ADMIN_2026";
    window.openElencoModal();
  });

  const btnSubTemporada = document.getElementById("btnSubTabTemporada");
  const btnSubLendas = document.getElementById("btnSubTabLendas");
  if (btnSubTemporada) btnSubTemporada.addEventListener("click", () => { subTabJogadores = "temporada"; renderTabContentOnly(); });
  if (btnSubLendas) btnSubLendas.addEventListener("click", () => { subTabJogadores = "lendas"; renderTabContentOnly(); });

  document.querySelectorAll("[data-ranking-modo]").forEach((el) => {
    el.addEventListener("click", () => {
      rankingModoAno = el.getAttribute("data-ranking-modo") === "ano";
      if (typeof animarContadoresEm !== "function") { renderTabContentOnly(); return; }
      renderTabContentOnly();
      const container = document.getElementById("tabContent");
      if (container) animarContadoresEm(container);
    });
  });
}

function renderTabContentOnly() {
  const container = document.getElementById("tabContent");
  const temp = temporadaVisualizada();
  const ehArquivada = temp && (temp.arquivadaEm || temp.nome.toLowerCase().includes("arquivada"));

  if (currentTab === "inicio") {
    container.innerHTML = ehArquivada ? gerarHtmlHallOfFameInline(temp) : window.renderInicio();
    if (ehArquivada) initFameDragScroll(); 
    if (typeof animarContadoresEm === "function") animarContadoresEm(container);
  }
  else if (currentTab === "calendario") container.innerHTML = window.renderCalendario();
  else if (currentTab === "artilharia") { container.innerHTML = window.renderArtilharia(); if (typeof animarContadoresEm === "function") animarContadoresEm(container); }
  else if (currentTab === "disciplina") container.innerHTML = window.renderDisciplina();
  else if (currentTab === "craques") { container.innerHTML = window.renderCraques(); if (typeof animarContadoresEm === "function") animarContadoresEm(container); }
  else if (currentTab === "jogadores") container.innerHTML = renderJogadoresTab();
  
  attachTabContentListeners();
}

function renderAll() {
  const adminToken = window.localStorage.getItem("bl_admin_token");
  window.isAdmin = adminToken === "PELADA_ADMIN_2026";
  
  window.renderTemporadaHeader();
  
  const temp = temporadaVisualizada();
  const ehArquivada = temp && (temp.arquivadaEm || temp.nome.toLowerCase().includes("arquivada"));

  window.renderConfrontoBar();

  if (ehArquivada) {
    const heroSec = document.getElementById("heroSection");
    if (heroSec) heroSec.style.display = "none";
    
    const container = document.getElementById("tabContent");
    if (container) {
      container.innerHTML = gerarHtmlHallOfFameInline(temp);
      initFameDragScroll();
      if (typeof animarContadoresEm === "function") animarContadoresEm(container);
    }
    attachTabContentListeners();
  } else {
    const heroSec = document.getElementById("heroSection");
    if (heroSec) heroSec.style.display = "";
    window.renderHero();
    window.renderTabContent();
  }
}