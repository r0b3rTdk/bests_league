// ============================================================
// BESTS LEAGUE — roteamento e conteúdo das abas
// (Início, Calendário, Artilharia, Cartões, Craque do jogo)
// ============================================================

function renderTabContent() {
  const container = document.getElementById("tabContent");
  const temp = temporadaVisualizada();
  perfilJogadorAberto = null; // sair de qualquer perfil aberto ao trocar de aba
  
  // 🔹 CORREÇÃO: Verifica se a temporada está arquivada antes de desenhar
  const ehArquivada = temp && (temp.arquivadaEm || temp.nome.toLowerCase().includes("arquivada"));

  if (currentTab === "inicio") {
    container.innerHTML = ehArquivada ? gerarHtmlHallOfFameInline(temp) : renderInicio();
  }
  else if (currentTab === "calendario") container.innerHTML = renderCalendario();
  else if (currentTab === "artilharia") container.innerHTML = renderArtilharia();
  else if (currentTab === "disciplina") container.innerHTML = renderDisciplina();
  else if (currentTab === "craques") container.innerHTML = renderCraques();
  else if (currentTab === "jogadores") container.innerHTML = renderJogadoresTab();
  
  attachTabContentListeners();
}

function renderInicio() {
  const temp = temporadaVisualizada();
  const artilharia = calcularArtilharia(temp);
  const craques = calcularCraques(temp);
  const lider = artilharia[0];
  const liderCraque = craques[0];

  // Mistura os últimos jogos já disputados com os próximos agendados,
  // em ordem cronológica (passado no topo, futuro embaixo) — assim o
  // card mostra de verdade "próximos E últimos jogos", não só resultado.
  const todosOrdenados = jogosOrdenados(temp);
  const jogados = todosOrdenados.filter((j) => j.placarA !== null && j.placarA !== undefined);
  const agendados = todosOrdenados.filter((j) => j.placarA === null || j.placarA === undefined);
  const listaExibida = [...jogados.slice(-3), ...agendados.slice(0, 2)];

  let html = `
    <div class="bl-grid-2">
      <div class="bl-card">
        <h3 class="bl-card-title">${ICONS.goal.replace('width="32" height="32"', 'width="16" height="16"')} Artilheiro da temporada</h3>
        ${lider ? `
          <div class="bl-destaque-jogador">
            ${crestHtml(temp, lider.time, 36)}
            <div>
              <p class="bl-destaque-nome">${escapeHtml(lider.jogador)}</p>
              <p class="bl-destaque-valor">${lider.gols} gols</p>
            </div>
          </div>
        ` : emptyStateHtml(ICONS.goal, "Sem gols ainda", "Cadastre um jogo para começar a artilharia")}
      </div>
      <div class="bl-card">
        <h3 class="bl-card-title">${ICONS.star.replace('width="32" height="32"', 'width="16" height="16"')} Mais craque do jogo</h3>
        ${liderCraque ? `
          <div class="bl-destaque-jogador">
            <div class="bl-trofeu-icon">${starIcon(20, true)}</div>
            <div>
              <p class="bl-destaque-nome">${escapeHtml(liderCraque.jogador)}</p>
              <p class="bl-destaque-valor">${liderCraque.vezes}× eleito</p>
            </div>
          </div>
        ` : emptyStateHtml(ICONS.star, "Ninguém eleito ainda", "Marque o craque ao cadastrar um jogo")}
      </div>
      <div class="bl-card bl-card-wide">
        <h3 class="bl-card-title">${ICONS.calendar.replace('width="32" height="32"', 'width="16" height="16"')} Próximos e últimos jogos</h3>
        <div class="bl-mini-jogos">
          ${listaExibida.length === 0 ? emptyStateHtml(ICONS.calendar, "Nenhum jogo cadastrado", "Clique em Novo jogo para começar") :
            listaExibida.map((j) => {
              const agendado = j.placarA === null || j.placarA === undefined;
              return `
              <button type="button" class="bl-mini-jogo ${agendado ? 'bl-mini-jogo-agendado' : ''}" data-edit-jogo="${j.id}">
                <span class="bl-mini-jogo-data">${formatDateBR(j.date)}</span>
                ${agendado ? `
                  <span class="bl-mini-jogo-placar"><span class="bl-tag-agendado">AGENDADO</span></span>
                ` : `
                  <span class="bl-mini-jogo-placar">
                    <strong style="color:var(--bl-timeA)">${j.placarA}</strong>
                    <span class="bl-mini-x">×</span>
                    <strong style="color:#cfcfcf">${j.placarB}</strong>
                  </span>
                `}
                ${j.craque ? `<span class="bl-mini-jogo-craque">${starIcon(10, true)} ${escapeHtml(j.craque)}</span>` : ""}
              </button>
            `;
            }).join("")
          }
        </div>
      </div>
    </div>
  `;
    
  return html;
  
}

function renderCalendario() {
  const temp = temporadaVisualizada();
  const jogos = jogosOrdenados(temp).filter(j => j.placarA !== null && j.placarA !== undefined);  
  // Sincroniza se é admin
  const adminToken = window.localStorage.getItem("bl_admin_token");
  const isAdmin = adminToken === "PELADA_ADMIN_2026";

  if (jogos.length === 0) {
    return `<div class="bl-card">${emptyStateHtml(ICONS.calendar, "Nenhum jogo cadastrado", "Clique em Novo jogo para começar a montar o calendário")}</div>`;
  }
  return `
    <div class="bl-card">
      <div class="bl-table-wrap">
        <table class="bl-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Horário</th>
              <th style="text-align:right;">${escapeHtml(temp.timeA.nome)}</th>
              <th style="text-align:center; width:100px;">Placar</th>
              <th style="text-align:left;">${escapeHtml(temp.timeB.nome)}</th>
              <th>Craque do jogo</th>
              ${isAdmin ? `<th>Ações</th>` : ""}
            </tr>
          </thead>
          <tbody>
            ${jogos.map((j) => {
              const semPlacar = j.placarA === null || j.placarA === undefined;
              const vitoriaA = !semPlacar && j.placarA > j.placarB;
              const vitoriaB = !semPlacar && j.placarB > j.placarA;
              return `
              <tr class="${semPlacar ? 'bl-row-agendado' : ''}">
                <td>${formatDateBR(j.date)}</td>
                <td class="bl-td-muted">${escapeHtml(j.time || "")}</td>
                <td style="text-align:right;" class="bl-td-time bl-td-timeA ${vitoriaA ? 'bl-row-vencedor' : ''}">
                  ${vitoriaA ? '🏆 ' : ''}${escapeHtml(temp.timeA.nome)}
                </td>
                <td class="bl-td-placar" style="font-weight:${semPlacar ? '400' : '700'};">
                  ${semPlacar ? `<span class="bl-tag-agendado">AGENDADO</span>` : `${j.placarA} <span class="bl-td-x">×</span> ${j.placarB}`}
                </td>
                <td style="text-align:left;" class="bl-td-time bl-td-timeB ${vitoriaB ? 'bl-row-vencedor' : ''}">
                  ${escapeHtml(temp.timeB.nome)}${vitoriaB ? ' 🏆' : ''}
                </td>
                <td>${j.craque ? `<span class="bl-craque-tag">${starIcon(11, true)}${escapeHtml(j.craque)}</span>` : `<span class="bl-td-muted">—</span>`}</td>
                
                ${isAdmin ? `
                <td>
                  <div class="bl-row-actions">
                    <button type="button" class="bl-iconbtn" data-edit-jogo="${j.id}" aria-label="Editar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button type="button" class="bl-iconbtn bl-iconbtn-danger" data-delete-jogo="${j.id}" aria-label="Excluir">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
                ` : ""}
              </tr>
            `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Monta o pódio (top 3) de qualquer ranking já ordenado (artilharia ou craques).
// entradas: [{ jogador, time, valor }] já em ordem decrescente.
function podiumHtml(entradas, temp, sufixoValor) {
  const medalhas = ["🥇", "🥈", "🥉"];
  const top3 = entradas.slice(0, 3).filter((e) => e && e.valor > 0);
  if (top3.length === 0) return "";
  const jogadores = temp && temp.jogadores ? temp.jogadores : [];

  return `
    <div class="bl-podium">
      ${top3.map((e, i) => {
        const jogadorObj = jogadores.find((p) => p.nome === e.jogador) || { nome: e.jogador };
        const cor = e.time === TIME_A ? ((temp.timeA && temp.timeA.cor) || "#F2EFE6")
          : e.time === TIME_B ? ((temp.timeB && temp.timeB.cor) || "#1a1a1a")
          : "#5B7DFF";
        return `
          <div class="bl-podium-step bl-podium-${i + 1}">
            <div class="bl-podium-medal">${medalhas[i]}</div>
            <div class="bl-podium-avatar">${avatarHtml(jogadorObj, i === 0 ? 68 : 54, cor)}</div>
            <div class="bl-podium-nome">${escapeHtml(e.jogador)}</div>
            <div class="bl-podium-valor"><span data-count-final="${e.valor}">${e.valor}</span>${sufixoValor || ""}</div>
            <div class="bl-podium-bloco">${i + 1}</div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

let rankingModoAno = false; // false = só este turno, true = ano inteiro (todos os turnos)

// Toolbar "Este turno / Ano inteiro" — só aparece quando faz sentido
// (quando já existe mais de um turno cadastrado pro mesmo ano).
function toggleRankingAnoHtml(tempOriginal) {
  const todas = typeof temporadasDoMesmoAno === "function" ? temporadasDoMesmoAno(tempOriginal) : [tempOriginal];
  if (todas.length <= 1) return "";
  return `
    <div class="bl-toggle-group" style="margin-bottom: 16px;">
      <button type="button" class="bl-btn-toggle ${!rankingModoAno ? 'active' : ''}" data-ranking-modo="turno">Este turno</button>
      <button type="button" class="bl-btn-toggle ${rankingModoAno ? 'active' : ''}" data-ranking-modo="ano">Ano inteiro</button>
    </div>
  `;
}

function renderArtilharia() {
  const tempOriginal = temporadaVisualizada();
  const temp = rankingModoAno && typeof mesclarTemporadasDoAno === "function" ? mesclarTemporadasDoAno(tempOriginal) : tempOriginal;
  const toggle = toggleRankingAnoHtml(tempOriginal);
  const artilharia = calcularArtilharia(temp);
  if (artilharia.length === 0) {
    return `${toggle}<div class="bl-card">${emptyStateHtml(ICONS.goal, "Nenhum gol registrado", "Cadastre jogos com os gols de cada jogador")}</div>`;
  }
  const podio = podiumHtml(artilharia.map((a) => ({ jogador: a.jogador, time: a.time, valor: a.gols })), temp, "");
  return `
    ${toggle}
    ${podio}
    <div class="bl-card">
      <div class="bl-table-wrap">
        <table class="bl-table">
          <thead><tr><th style="width:48px;">#</th><th>Time</th><th>Artilheiro</th><th style="text-align:right;">Gols</th></tr></thead>
          <tbody>
            ${artilharia.map((a, i) => `
              <tr class="${i === 0 ? "bl-row-lider" : ""}">
                <td class="bl-td-rank">${i + 1}</td>
                <td>${crestHtml(temp, a.time, 20)}</td>
                <td class="bl-td-nome">${escapeHtml(a.jogador)}</td>
                <td class="bl-td-gols">${a.gols}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderDisciplina() {
  const temp = temporadaVisualizada();
  const cartoes = calcularCartoes(temp);
  return `
    <div class="bl-card">
      <h3 class="bl-card-title">${ICONS.cards.replace('width="32" height="32"', 'width="14" height="14"')} Cartões</h3>
      <div class="bl-table-wrap">
        ${cartoes.length === 0 ? emptyStateHtml(ICONS.cards, "Sem cartões registrados", "A galera está se comportando") : `
          <table class="bl-table">
            <thead><tr><th>Time</th><th>Jogador</th><th style="text-align:center;">🟨</th><th style="text-align:center;">🟥</th></tr></thead>
            <tbody>
              ${cartoes.map((c) => `
                <tr>
                  <td>${crestHtml(temp, c.time, 18)}</td>
                  <td class="bl-td-nome">${escapeHtml(c.jogador)}</td>
                  <td class="bl-td-cartao-num">${c.amarelos || ""}</td>
                  <td class="bl-td-cartao-num bl-td-cartao-vermelho">${c.vermelhos || ""}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;
}

function renderCraques() {
  const tempOriginal = temporadaVisualizada();
  const temp = rankingModoAno && typeof mesclarTemporadasDoAno === "function" ? mesclarTemporadasDoAno(tempOriginal) : tempOriginal;
  const toggle = toggleRankingAnoHtml(tempOriginal);
  const craques = calcularCraques(temp);
  if (craques.length === 0) {
    return `${toggle}<div class="bl-card">${emptyStateHtml(ICONS.star, "Nenhum craque eleito ainda", "Marque o destaque ao cadastrar cada jogo")}</div>`;
  }
  const jogadores = temp && temp.jogadores ? temp.jogadores : [];
  const podio = podiumHtml(craques.map((c) => {
    const jog = jogadores.find((p) => p.nome === c.jogador);
    return { jogador: c.jogador, time: jog ? jog.time : null, valor: c.vezes };
  }), temp, "×");
  return `
    ${toggle}
    ${podio}
    <div class="bl-card">
      <div class="bl-table-wrap">
        <table class="bl-table">
          <thead><tr><th style="width:48px;">#</th><th>Jogador</th><th style="text-align:right;">Vezes eleito</th></tr></thead>
          <tbody>
            ${craques.map((c, i) => `
              <tr class="${i === 0 ? "bl-row-lider" : ""}">
                <td class="bl-td-rank">${i + 1}</td>
                <td class="bl-td-nome"><span class="bl-craque-tag">${starIcon(12, true)}${escapeHtml(c.jogador)}</span></td>
                <td class="bl-td-gols">${c.vezes}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
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
    el.addEventListener("click", () => {
      openConfirmDelete(el.getAttribute("data-delete-jogo"));
    });
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
}

function renderTabContentOnly() {
  renderTabContent(); // Unifica o fluxo para evitar duplicidade de bugs
}