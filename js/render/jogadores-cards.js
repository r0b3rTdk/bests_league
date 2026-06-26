// ============================================================
// BESTS LEAGUE — aba Jogadores (cards estilo FIFA Ultimate Team)
// ============================================================

// ---------- PÁGINA DE JOGADORES — cards estilo FIFA Ultimate Team ----------

// Variable de controle para alternar o modo de visualização do elenco
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

function calcularLendasdaPelada() {
  const mapaLendas = {};
  
  appState.temporadas.forEach((temp) => {
    const jogosComPlacar = temp.jogos.filter(j => j.placarA !== null && j.placarA !== undefined).length;
    
    temp.jogadores.forEach((j) => {
      if (!mapaLendas[j.nome]) {
        mapaLendas[j.nome] = { nome: j.nome, overall: j.overall || 3, gols: 0, jogosDisputados: 0, temporadasAtivas: new Set() };
      }
      mapaLendas[j.nome].overall = Math.max(mapaLendas[j.nome].overall, j.overall || 3);
      mapaLendas[j.nome].temporadasAtivas.add(temp.id);
      mapaLendas[j.nome].jogosDisputados += jogosComPlacar;
    });

    if (temp.historico && temp.historico.gols) {
      temp.historico.gols.forEach((g) => {
        if (!mapaLendas[g.jogador]) {
          mapaLendas[g.jogador] = { nome: g.jogador, overall: 3, gols: 0, jogosDisputados: 0, temporadasAtivas: new Set() };
        }
        mapaLendas[g.jogador].gols += g.quantidade || 0;
        mapaLendas[g.jogador].temporadasAtivas.add(temp.id);
      });
    }

    temp.jogos.forEach((jogo) => {
      (jogo.gols || []).forEach((g) => {
        if (!mapaLendas[g.jogador]) {
          mapaLendas[g.jogador] = { nome: g.jogador, overall: 3, gols: 0, jogosDisputados: 0, temporadasAtivas: new Set() };
        }
        mapaLendas[g.jogador].gols += g.quantidade || 0;
        mapaLendas[g.jogador].temporadasAtivas.add(temp.id);
      });

      (jogo.cartoes || []).forEach((c) => { if (mapaLendas[c.jogador]) mapaLendas[c.jogador].temporadasAtivas.add(temp.id); });
      if (jogo.craque && mapaLendas[jogo.craque]) { mapaLendas[jogo.craque].temporadasAtivas.add(temp.id); }
    });
  });

  return Object.values(mapaLendas)
    .filter((jogador) => jogador.temporadasAtivas.size >= 2)
    .sort((a, b) => b.gols - a.gols || b.jogosDisputados - a.jogosDisputados);
}

function renderJogadoresTab() {
  if (perfilJogadorAberto) return renderPerfilJogador(perfilJogadorAberto);

  const temp = temporadaVisualizada();
  const grupos = [
    { time: TIME_A, label: temp.timeA.nome },
    { time: TIME_B, label: temp.timeB.nome },
    { time: TIME_AVULSO, label: "Avulso" },
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

  if (temp.jogadores.length === 0 && subTabJogadores === "temporada") {
    return toolbar + emptyStateHtml(ICONS.users, "Nenhum jogador cadastrado", "Clique em Gerenciar elenco para adicionar");
  }

  if (subTabJogadores === "temporada") {
    const secoes = grupos.map(({ time, label }) => {
      const jogadoresDoTime = [...temp.jogadores]
        .filter((j) => j.time === time)
        .sort((a, b) => (b.overall || 0) - (a.overall || 0) || a.nome.localeCompare(b.nome));
      if (jogadoresDoTime.length === 0) return "";
      return `
        <div class="bl-time-secao">
          <h3 class="bl-time-secao-label">
            ${crestHtml(temp, time, 20)}
            ${escapeHtml(label)}
          </h3>
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
        <h3 class="bl-time-secao-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--bl-gold);margin-right:4px;"><polygon points="12 2 15 9 22 9 16 14 18 21 12 17 6 21 8 14 2 9 9 9"/></svg>
          Histórico Geral (Mínimo de 2 Temporadas Disputadas)
        </h3>
        <div class="bl-fifa-cards-grid">
          ${lendas.map((l) => templateFifaCardHtml(l.nome, l.overall, l.gols, 0, 0, 0, 0, l.jogosDisputados, false, true, "LNDA")).join("")}
        </div>
      </div>
    `;
  }
}

function renderFifaCard(temp, j, grande) {
  const stats = estatisticasJogador(temp, j.nome);
  const media = stats.mediaGolsPorJogo.toFixed(2);
  const nomeTime = j.time === TIME_A ? temp.timeA.nome : j.time === TIME_B ? temp.timeB.nome : "AVL";
  return templateFifaCardHtml(j.nome, j.overall, stats.gols, media, stats.amarelos, stats.vermelhos, stats.craques, stats.jogosDisputados, grande, false, nomeTime);
}

function templateFifaCardHtml(nome, overall, gols, media, amarelos, vermelhos, craques, jogos, grande, isLenda, textoTime) {
  const ov = overall || 3;
  const rar = raridade(ov);
  const cor = CARD_COR_TEXTO[rar];
  const bg = CARD_BG[rar];
  const tam = grande ? "bl-fcard-grande" : "";
  const clicavel = grande ? "" : `data-perfil-jogador="${escapeHtml(nome)}"`;

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
  let j = temp.jogadores.find((p) => p.nome === nomeJogador);
  
  if (!j) {
    const lendas = calcularLendasdaPelada();
    const lenda = lendas.find(p => p.nome === nomeJogador);
    if (!lenda) { perfilJogadorAberto = null; return renderJogadoresTab(); }
    j = { nome: lenda.nome, overall: lenda.overall };
  }

  const historicoSeasons = [];
  appState.temporadas.forEach((t) => {
    const stats = estatisticasJogador(t, nomeJogador);
    const noElenco = t.jogadores.some(p => p.nome === nomeJogador);
    
    if (noElenco || stats.gols > 0 || stats.jogosDisputados > 0 || stats.craques > 0) {
      historicoSeasons.push({
        nomeTemporada: t.nome,
        time: t.jogadores.find(p => p.nome === nomeJogador)?.time || "avulso",
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
                const timeLabel = s.time === "timeA" ? s.tempObj.timeA.nome : s.time === "timeB" ? s.tempObj.timeB.nome : "Avulso";
                return `
                  <tr>
                    <td class="bl-td-nome" style="color: var(--bl-text); font-weight: 500;">${escapeHtml(s.nomeTemporada)}</td>
                    <td>${crestHtml(s.tempObj, s.time, 16)} <span class="bl-td-muted" style="font-size:12px; margin-left:4px;">${escapeHtml(timeLabel)}</span></td>
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
      const jogo = temp.jogos.find((j) => j.id === el.getAttribute("data-edit-jogo"));
      if (jogo) openJogoModal(jogo);
    });
  });
  document.querySelectorAll("[data-delete-jogo]").forEach((el) => {
    el.addEventListener("click", () => { openConfirmDelete(el.getAttribute("data-delete-jogo")); });
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
  if (btnGerenciar) btnGerenciar.addEventListener("click", () => openElencoModal());

  const btnSubTemporada = document.getElementById("btnSubTabTemporada");
  const btnSubLendas = document.getElementById("btnSubTabLendas");
  if (btnSubTemporada) btnSubTemporada.addEventListener("click", () => { subTabJogadores = "temporada"; renderTabContentOnly(); });
  if (btnSubLendas) btnSubLendas.addEventListener("click", () => { subTabJogadores = "lendas"; renderTabContentOnly(); });
}

function renderTabContentOnly() {
  const container = document.getElementById("tabContent");
  if (currentTab === "inicio") container.innerHTML = renderInicio();
  else if (currentTab === "calendario") container.innerHTML = renderCalendario();
  else if (currentTab === "artilharia") container.innerHTML = renderArtilharia();
  else if (currentTab === "disciplina") container.innerHTML = renderDisciplina();
  else if (currentTab === "craques") container.innerHTML = renderCraques();
  else if (currentTab === "jogadores") container.innerHTML = renderJogadoresTab();
  attachTabContentListeners();
}

function renderAll() {
  renderTemporadaHeader();
  renderHero();
  renderConfrontoBar();
  renderTabContent();
}

function checkIcon() {
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
}