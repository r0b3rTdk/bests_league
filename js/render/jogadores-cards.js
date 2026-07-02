// ============================================================
// BESTS LEAGUE — aba Jogadores (cards estilo FIFA Ultimate Team)
// ============================================================

let subTabJogadores = "temporada"; 

function raridade(overall) {
  if (overall <= 2) return "bronze";
  if (overall === 3) return "prata";
  if (overall === 4) return "ouro";
  return "icon";
}

const CARD_BG = {
  bronze: "radial-gradient(ellipse at 50% 30%, #c8893a 0%, #7a4010 40%, #3d1f00 100%)",
  prata:  "radial-gradient(ellipse at 50% 30%, #9aa8c0 0%, #4a5568 40%, #1e2433 100%)",
  ouro:   "radial-gradient(ellipse at 50% 30%, #f0d060 0%, #c8a020 40%, #6b5000 100%)",
  icon:   "radial-gradient(ellipse at 50% 30%, #b090e8 0%, #6030b0 40%, #1a0840 100%)",
};

const CARD_COR_TEXTO = {
  bronze: "#d4a017",
  prata:  "#a8b8c8",
  ouro:   "#e9cc74",
  icon:   "#c8a8ff",
};

// Helper interno para calcular o campeão de qualquer temporada (Usado no Hall of Fame e nos Títulos)
function descobrirTimeCampeaoObjeto(temp) {
  // Força o Time Azul (Time B) como campeão legítimo de 2025 (Pênaltis: 1x3)
  if (temp.id === "temp_2025" || (temp.nome && temp.nome.includes("2025"))) {
    return { ehTimeACampeao: false, objeto: temp.timeB, vitA: 8, vitB: 8, emp: 3, gpA: 89, gcA: 86, gpB: 86, gcB: 89, derA: 8, derB: 8 };
  }

  let vitA = 0, vitB = 0, emp = 0, gpA = 0, gcA = 0, gpB = 0, gcB = 0;
  const jogosValidos = (temp.jogos || []).filter(j => j.placarA !== null && j.placarB !== null);
  
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
    const jogosValidos = (temp.jogos || []).filter(j => j.placarA !== null && j.placarB !== null);
    const jogosComPlacar = jogosValidos.length;
    const jogadoresTemp = temp.jogadores || [];
    const resultadoCampeao = descobrirTimeCampeaoObjeto(temp);
    
    // 🌟 VOLTOU AO ID ÚNICO: Permite que o 1º e 2º turno somem os dados juntos (ex: 19 + 23 = 42 jogos)
    const tempKey = temp.id || temp.nome || Math.random().toString();

    // 1. Soma gols do histórico estruturado (Temporadas antigas)
    if (temp.historico && temp.historico.gols) {
      temp.historico.gols.forEach((g) => {
        const nomeLimpo = g.jogador ? g.jogador.trim() : "";
        if (!nomeLimpo) return;
        
        const chaveBusca = nomeLimpo.toLowerCase();
        if (!mapaLendas[chaveBusca]) {
          mapaLendas[chaveBusca] = { nome: nomeLimpo, overall: 3, gols: 0, jogosDisputados: 0, titulos: 0, temporadasAtivas: new Set() };
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
        mapaLendas[chaveBusca] = { nome: j.nome, overall: j.overall || 3, gols: 0, jogosDisputados: 0, titulos: 0, temporadasAtivas: new Set() };
      }
      mapaLendas[chaveBusca].overall = Math.max(mapaLendas[chaveBusca].overall, j.overall || 3);
      
      // 🌟 TRAVA DE SEGURANÇA: Só adiciona a temporada e os jogos se o turno realmente teve partidas jogadas (> 0)
      // Isso elimina na hora os rascunhos vazios que faziam os jogadores de 23 jogos aparecerem!
      if (jogosComPlacar > 0) {
        mapaLendas[chaveBusca].temporadasAtivas.add(tempKey);
        mapaLendas[chaveBusca].jogosDisputados += jogosComPlacar;
      }

      const tClean = j.time ? j.time.toLowerCase().trim() : "";
      const estavaNoTimeA = tClean === "timea" || tClean === "bra";
      const estavaNoTimeB = tClean === "timeb" || tClean === "ver";
      
      if (jogosComPlacar > 0 && ((resultadoCampeao.ehTimeACampeao && estavaNoTimeA) || (!resultadoCampeao.ehTimeACampeao && estavaNoTimeB))) {
        mapaLendas[chaveBusca].titulos += 1;
      }
    });

    // 3. Soma gols das partidas normais de cada temporada
    jogosValidos.forEach((jogo) => {
      (jogo.gols || []).forEach((g) => {
        const nomeLimpo = g.jogador ? g.jogador.trim() : "";
        if (!nomeLimpo) return;

        const chaveBusca = nomeLimpo.toLowerCase();
        if (!mapaLendas[chaveBusca]) {
          mapaLendas[chaveBusca] = { nome: g.jogador, overall: 3, gols: 0, jogosDisputados: 0, titulos: 0, temporadasAtivas: new Set() };
        }
        if (!temp.historico) {
          mapaLendas[chaveBusca].gols += g.quantidade || 1;
        }
        if (jogosComPlacar > 0) {
          mapaLendas[chaveBusca].temporadasAtivas.add(tempKey);
        }
      });
    });
  });

  // Filtra estritamente quem jogou em mais de uma temporada ou turno real com jogos (> 1)
  return Object.values(mapaLendas)
    .filter((jogador) => jogador.temporadasAtivas.size > 1)
    .sort((a, b) => b.gols - a.gols || b.jogosDisputados - a.jogosDisputados);
}

function gerarHtmlHallOfFameInline(temp) {
  const res = descobrirTimeCampeaoObjeto(temp);
  const timeCampeao = res.objeto;
  const jogosValidos = (temp.jogos || []).filter(j => j.placarA !== null && j.placarB !== null);
  const totalJogos = jogosValidos.length;

  const cVitorias = res.ehTimeACampeao ? res.vitA : res.vitB;
  const cDerrotas = res.ehTimeACampeao ? res.vitB : res.vitA; 
  const cGolsPro = res.ehTimeACampeao ? res.gpA : res.gpB;
  const cGolsContra = res.ehTimeACampeao ? res.gcA : res.gcB;
  const cAproveitamento = totalJogos > 0 ? (((cVitorias * 3 + res.emp) / (totalJogos * 3)) * 100).toFixed(1) : "0.0";

  let mapaGols = {}, mapaCraques = {};
  
  if (temp.historico && temp.historico.gols) {
  temp.historico.gols.forEach(g => { 
    mapaGols[g.jogador] = (mapaGols[g.jogador] || 0) + (g.quantidade || 1); // 🌟 Mudado de 0 para 1
  });
  }
  jogosValidos.forEach(j => {
    if (j.craque) mapaCraques[j.craque] = (mapaCraques[j.craque] || 0) + 1;
    (j.gols || []).forEach(g => { 
      mapaGols[g.jogador] = (mapaGols[g.jogador] || 0) + (g.quantidade || 1); // 🌟 Mudado de 0 para 1
    });
  });

  const topScorer = Object.entries(mapaGols).sort((a,b) => b[1] - a[1])[0] || ["Nenhum", 0];
  const topMVP = Object.entries(mapaCraques).sort((a,b) => b[1] - a[1])[0] || ["Nenhum", 0];

  const jogadoresCampeoes = (temp.jogadores || []).filter(j => {
    const tClean = j.time ? j.time.toLowerCase().trim() : "";
    return res.ehTimeACampeao ? (tClean === "timea" || tClean === "bra") : (tClean === "timeb" || tClean === "ver");
  });

  // Definindo o botão de reabertura (código seguro)
  const botaoReabrirHtml = window.isAdmin ? `
    <div style="text-align: center; margin-bottom: 25px;">
      <button type="button" class="bl-btn-secondary" id="btnReabrirTemporadaAcao" style="border-color: var(--bl-gold); color: var(--bl-gold-light); font-size: 11px; padding: 6px 14px;">
        🔓 Reabrir Temporada (Voltar a Editar)
      </button>
    </div>` : '';

  // Retornando a soma de tudo (Elenco + Prêmios + Estatísticas)
  return `
    <div class="bl-hall-fame-inline-container">
      ${botaoReabrirHtml}
      
      <h3 class="bl-section-title-fame">👥 Elenco Vitorioso</h3>
      <div class="bl-fifa-cards-grid-fame">
        ${jogadoresCampeoes.map(j => typeof renderFifaCard === "function" ? renderFifaCard(temp, j, false) : `<div>${j.nome}</div>`).join("")}
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
  slider.addEventListener('mousemove', (e) => {
    if(!isDown) return;
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

      return `
        <div class="bl-time-secao">
          <h3 class="bl-time-secao-label">${crestHtml(temp, timeIdCrest, 20)} ${escapeHtml(label)}</h3>
          <div class="bl-fifa-cards-grid">
            ${jogadoresDoTime.map((j) => renderFifaCard(temp, j, false)).join("")}
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
    return toolbar + `
      <div class="bl-time-secao">
        <h3 class="bl-time-secao-label">⭐ Histórico Geral da Pelada</h3>
        <div class="bl-fifa-cards-grid">
          ${lendas.map((l) => {
            const sufixoTitulo = l.titulos > 0 ? ` 🏆${l.titulos > 1 ? `x${l.titulos}` : ''}` : '';
            return templateFifaCardHtml(l.nome + sufixoTitulo, l.overall, l.gols, 0, 0, 0, 0, l.jogosDisputados, false, true, "LNDA");
          }).join("")}
        </div>
      </div>
    `;
  }
}

function renderFifaCard(temp, j, grande) {
  const stats = 'estatisticasJogador' in window ? window.estatisticasJogador(temp, j.nome) : { gols:0, mediaGolsPorJogo:0, amarelos:0, vermelhos:0, craques:0, jogosDisputados:0 };
  const media = stats.mediaGolsPorJogo.toFixed(2);
  const tClean = j.time ? j.time.toLowerCase().trim() : "";
  const isA = tClean === "timea" || tClean === "bra" || (temp.timeA && temp.timeA.nome && temp.timeA.nome.toLowerCase().includes(tClean));
  const isB = tClean === "timeb" || tClean === "ver" || (temp.timeB && temp.timeB.nome && temp.timeB.nome.toLowerCase().includes(tClean));
  const nomeTime = isA ? temp.timeA.nome : isB ? temp.timeB.nome : "AVL";
  return templateFifaCardHtml(j.nome, j.overall, stats.gols, media, stats.amarelos, stats.vermelhos, stats.craques, stats.jogosDisputados, grande, false, nomeTime);
}

function templateFifaCardHtml(nome, overall, gols, media, amarelos, vermelhos, craques, jogos, grande, isLenda, textoTime) {
  const ov = overall || 3;
  const rar = raridade(ov);
  const cor = CARD_COR_TEXTO[rar];
  const bg = CARD_BG[rar];
  const tam = grande ? "bl-fcard-grande" : "";
  const clicavel = grande ? "" : `data-perfil-jogador="${escapeHtml(nome.replace(/🏆.*/, '').trim())}"`;

  const AtributosLayoutHtml = isLenda ? `
    <div class="player-features" style="justify-content: center; gap: 24px; margin-top: 6px;">
      <div class="player-features-col" style="border: none; align-items: center;">
        <span style="flex-direction: column; gap: 1px;">
          <span class="player-feature-value" style="font-size: 1.15rem; color: #FFF;">${gols}</span>
          <span class="player-feature-title" style="font-size: 0.65rem; text-align: center; color: var(--bl-gold-light);">GOLS</span>
        </span>
      </div>
      <div class="player-features-col" style="border: none; align-items: center; padding: 0;">
        <span style="flex-direction: column; gap: 1px;">
          <span class="player-feature-value" style="font-size: 1.15rem; color: #FFF;">${jogos}</span>
          <span class="player-feature-title" style="font-size: 0.65rem; text-align: center; color: #A0AEC0;">JOGOS</span>
        </span>
      </div>
    </div>
  ` : `
    <div class="player-features">
      <div class="player-features-col">
        <span><span class="player-feature-value">${gols}</span><span class="player-feature-title">Gols</span></span>
        <span><span class="player-feature-value">${media}</span><span class="player-feature-title">Média</span></span>
        <span><span class="player-feature-value">${amarelos}</span><span class="player-feature-title">Amar.</span></span>
      </div>
      <div class="player-features-col">
        <span><span class="player-feature-value">${vermelhos}</span><span class="player-feature-title">Verm.</span></span>
        <span><span class="player-feature-value">${craques}</span><span class="player-feature-title">Craque</span></span>
        <span><span class="player-feature-value">${jogos}</span><span class="player-feature-title">Jogos</span></span>
      </div>
    </div>
  `;

  return `
    <div class="fut-player-card ${tam}" ${clicavel} style="--fcard-cor:${cor}; background:${bg};">
      <div class="player-card-top">
        <div class="player-master-info" style="color:${cor}">
          <div class="player-rating">${ov}</div>
          <div class="player-position">${escapeHtml(textoTime.substring(0, 5))}</div>
          <div class="player-stars">${starsSmall(ov, cor)}</div>
        </div>
        <div class="player-picture">
          <div class="player-silhouette">
            <svg viewBox="0 0 80 90" fill="none">
              <ellipse cx="40" cy="26" rx="16" ry="18" fill="${cor}" opacity="0.5"/>
              <path d="M10 90 C10 60 70 60 70 90" fill="${cor}" opacity="0.5"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="player-card-top-glow"></div>
      <div class="player-card-bottom">
        <div class="player-info" style="color:${cor}">
          <div class="player-name"><span>${escapeHtml(nome)}</span></div>
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
    
    // 🌟 CORRIGIDO: Só entra no histórico se ele estiver no elenco, ou tiver gols, ou tiver sido craque!
    // Se ele foi apagado e está zerado, o sistema ignora esse turno automaticamente.
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
  return `
    <button type="button" class="bl-btn-voltar" id="btnVoltarElenco">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      Voltar para o elenco
    </button>
    <div class="bl-perfil-container">
      <div class="bl-perfil-wrap">
        ${esLendaCard ? templateFifaCardHtml(j.nome, j.overall, calcularLendasdaPelada().find(p => p.nome === nomeJogador)?.gols || 0, 0, 0, 0, 0, calcularLendasdaPelada().find(p => p.nome === nomeJogador)?.jogosDisputados || 0, true, true, "LNDA") : renderFifaCard(temp, j, true)}
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
}

function renderTabContentOnly() {
  const container = document.getElementById("tabContent");
  const temp = temporadaVisualizada();
  const ehArquivada = temp && (temp.arquivadaEm || temp.nome.toLowerCase().includes("arquivada"));

  if (currentTab === "inicio") {
    container.innerHTML = ehArquivada ? gerarHtmlHallOfFameInline(temp) : window.renderInicio();
    if (ehArquivada) initFameDragScroll(); 
  }
  else if (currentTab === "calendario") container.innerHTML = window.renderCalendario();
  else if (currentTab === "artilharia") container.innerHTML = window.renderArtilharia();
  else if (currentTab === "disciplina") container.innerHTML = window.renderDisciplina();
  else if (currentTab === "craques") container.innerHTML = window.renderCraques();
  else if (currentTab === "jogadores") container.innerHTML = renderJogadoresTab();
  
  attachTabContentListeners();
}

function renderAll() {
  const adminToken = window.localStorage.getItem("bl_admin_token");
  window.isAdmin = adminToken === "PELADA_ADMIN_2026";
  
  window.renderTemporadaHeader();
  
  const temp = temporadaVisualizada();
  const ehArquivada = temp && (temp.arquivadaEm || temp.nome.toLowerCase().includes("arquivada"));

  // Garante o cálculo e a pintura dos dados corretos no painel superior
  window.renderConfrontoBar();

  if (ehArquivada) {
    const heroSec = document.getElementById("heroSection");
    if (heroSec) heroSec.style.display = "none";
    
    const container = document.getElementById("tabContent");
    if (container) {
      container.innerHTML = gerarHtmlHallOfFameInline(temp);
      initFameDragScroll();
    }
    attachTabContentListeners();
  } else {
    const heroSec = document.getElementById("heroSection");
    if (heroSec) heroSec.style.display = "";
    window.renderHero();
    window.renderTabContent();
  }
}