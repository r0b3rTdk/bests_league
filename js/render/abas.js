// ============================================================
// BESTS LEAGUE — roteamento e conteúdo das abas
// (Início, Calendário, Artilharia, Cartões, Craque do jogo)
// ============================================================

// ---------- ABAS ----------

function renderTabContent() {
  const container = document.getElementById("tabContent");
  perfilJogadorAberto = null; // sair de qualquer perfil aberto ao trocar de aba
  if (currentTab === "inicio") container.innerHTML = renderInicio();
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
  const ultimos5 = jogosOrdenados(temp).slice(-5).reverse();

  return `
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
          ${ultimos5.length === 0 ? emptyStateHtml(ICONS.calendar, "Nenhum jogo cadastrado", "Clique em Novo jogo para começar") :
            ultimos5.map((j) => `
              <button type="button" class="bl-mini-jogo" data-edit-jogo="${j.id}">
                <span class="bl-mini-jogo-data">${formatDateBR(j.date)}</span>
                <span class="bl-mini-jogo-placar">
                  <strong style="color:var(--bl-timeA)">${j.placarA}</strong>
                  <span class="bl-mini-x">×</span>
                  <strong style="color:#cfcfcf">${j.placarB}</strong>
                </span>
                ${j.craque ? `<span class="bl-mini-jogo-craque">${starIcon(10, true)} ${escapeHtml(j.craque)}</span>` : ""}
              </button>
            `).join("")
          }
        </div>
      </div>
    </div>
  `;
}

function renderCalendario() {
  const temp = temporadaVisualizada();
  const jogos = jogosOrdenados(temp);
  
  // Checagem de privilégios para exibição da coluna de modificação
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
              <tr>
                <td>${formatDateBR(j.date)}</td>
                <td class="bl-td-muted">${escapeHtml(j.time || "")}</td>
                <td style="text-align:right;" class="bl-td-time bl-td-timeA ${vitoriaA ? 'bl-row-vencedor' : ''}">
                  ${vitoriaA ? '🏆 ' : ''}${escapeHtml(temp.timeA.nome)}
                </td>
                <td class="bl-td-placar" style="font-weight:${semPlacar ? '400' : '700'}; color:${semPlacar ? 'var(--bl-text)' : 'var(--bl-text)'};">
                  ${j.placarA} <span class="bl-td-x">×</span> ${j.placarB}
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

function renderArtilharia() {
  const temp = temporadaVisualizada();
  const artilharia = calcularArtilharia(temp);
  if (artilharia.length === 0) {
    return `<div class="bl-card">${emptyStateHtml(ICONS.goal, "Nenhum gol registrado", "Cadastre jogos com os gols de cada jogador")}</div>`;
  }
  return `
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
  const temp = temporadaVisualizada();
  const craques = calcularCraques(temp);
  if (craques.length === 0) {
    return `<div class="bl-card">${emptyStateHtml(ICONS.star, "Nenhum craque eleito ainda", "Marque o destaque ao cadastrar cada jogo")}</div>`;
  }
  return `
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

// Atualiza só o conteúdo da aba atual, sem resetar o perfil aberto
// (diferente de renderTabContent, que é chamado ao trocar de aba de fato).
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
