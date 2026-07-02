// ============================================================
// BESTS LEAGUE — modal de Novo/Editar jogo (gols, cartões, craque)
// e confirmação de exclusão de jogo
// ============================================================

// ---------- MODAL: NOVO / EDITAR JOGO ----------

let jogoFormState = null;

function blankJogoForm() {
  return { id: null, date: "", time: "21:00", placarA: 0, placarB: 0, craque: "", gols: [], cartoes: [] };
}

function optionsJogadoresHtml(temp, selected) {
  const porTime = (t) => temp.jogadores.filter((j) => j.time === t).sort((a, b) => a.nome.localeCompare(b.nome));
  const a = porTime(TIME_A);
  const b = porTime(TIME_B);
  const avulso = porTime(TIME_AVULSO);
  let html = "";
  if (a.length) html += `<optgroup label="${escapeHtml(temp.timeA.nome)}">${a.map((j) => `<option value="${escapeHtml(j.nome)}" ${j.nome === selected ? "selected" : ""}>${escapeHtml(j.nome)}</option>`).join("")}</optgroup>`;
  if (b.length) html += `<optgroup label="${escapeHtml(temp.timeB.nome)}">${b.map((j) => `<option value="${escapeHtml(j.nome)}" ${j.nome === selected ? "selected" : ""}>${escapeHtml(j.nome)}</option>`).join("")}</optgroup>`;
  if (avulso.length) html += `<optgroup label="Avulso">${avulso.map((j) => `<option value="${escapeHtml(j.nome)}" ${j.nome === selected ? "selected" : ""}>${escapeHtml(j.nome)}</option>`).join("")}</optgroup>`;
  return html;
}

function openJogoModal(jogoEditando) {
  if (temporadaVisualizada().id !== temporadaEmAndamento().id) {
    // Cadastrar jogo só vale na temporada em andamento — evita registrar
    // um jogo "no passado" de uma temporada já arquivada por engano.
    appState.temporadaVisualizadaId = temporadaEmAndamento().id;
    saveAppState();
    renderAll();
    showToast("Você estava vendo uma temporada arquivada. Voltei para a temporada atual.");
  }
  jogoFormState = jogoEditando ? { ...blankJogoForm(), ...jogoEditando } : blankJogoForm();
  renderJogoModal(!jogoEditando);
}

function golsTotal(time) {
  const temp = temporadaVisualizada();
  return jogoFormState.gols
    .filter((g) => temp.jogadores.find((p) => p.nome === g.jogador)?.time === time)
    .reduce((a, g) => a + g.quantidade, 0);
}

function renderJogoModal(isNew) {
  const temp = temporadaVisualizada();
  const f = jogoFormState;
  const ga = golsTotal(TIME_A);
  const gb = golsTotal(TIME_B);
  const mostraAviso = (ga + gb > 0) && (Number(f.placarA) !== ga || Number(f.placarB) !== gb);
  const sexta = ehSextaFeira(f.date);

  const html = `
    <div class="bl-modal-overlay" id="jogoModalOverlay">
      <div class="bl-modal">
        <div class="bl-modal-header">
          <h2>${isNew ? "Novo jogo" : "Editar jogo"}</h2>
          <button type="button" class="bl-iconbtn" id="jogoModalClose" aria-label="Fechar">${iconX().replace('width="11" height="11"', 'width="20" height="20"')}</button>
        </div>
        <form id="jogoForm" class="bl-modal-body">
          <div class="bl-form-row">
            <label class="bl-field">
              <span>Data</span>
              <input type="date" id="fJogoData" required value="${f.date || ""}" />
              <span class="bl-field-hint ${sexta === false ? "bl-field-hint-warn" : ""}" id="hintSexta">${f.date ? (sexta ? "✓ cai numa sexta-feira" : "atenção: a pelada costuma ser nas sextas") : "a pelada acontece sempre nas sextas do mês"}</span>
            </label>
            <label class="bl-field">
              <span>Horário</span>
              <input type="time" id="fJogoHorario" value="${f.time || ""}" />
            </label>
          </div>

          <div class="bl-placar-edit">
            <div class="bl-placar-edit-team">${crestHtml(temp, TIME_A, 26)}<span>${escapeHtml(temp.timeA.nome)}</span></div>
            <input type="number" min="0" class="bl-placar-input" id="fPlacarA" value="${f.placarA}" />
            <span class="bl-placar-edit-x">×</span>
            <input type="number" min="0" class="bl-placar-input" id="fPlacarB" value="${f.placarB}" />
            <div class="bl-placar-edit-team">${crestHtml(temp, TIME_B, 26)}<span>${escapeHtml(temp.timeB.nome)}</span></div>
          </div>
          <div id="avisoGols">${mostraAviso ? `<p class="bl-hint bl-hint-warn">Gols lançados: ${ga} × ${gb} — confira se bate com o placar acima.</p>` : ""}</div>

          <div class="bl-section-divider">${iconGoalSmall()} Gols da partida</div>
          <div class="bl-add-row">
            <select id="fGolJogador"><option value="">Selecionar jogador...</option>${optionsJogadoresHtml(temp, "")}</select>
            <input type="number" min="1" class="bl-qtd-input" id="fGolQtd" value="1" />
            <button type="button" class="bl-btn-add" id="btnAddGol">${iconPlus()}</button>
          </div>
          <div class="bl-pills" id="pillsGols">${renderPillsGols(temp)}</div>

          <div class="bl-section-divider">${iconCardSmall()} Cartões</div>
          <div class="bl-add-row">
            <select id="fCartaoJogador"><option value="">Selecionar jogador...</option>${optionsJogadoresHtml(temp, "")}</select>
            <select id="fCartaoTipo" class="bl-cartao-select">
              <option value="amarelo">Amarelo</option>
              <option value="vermelho">Vermelho</option>
            </select>
            <button type="button" class="bl-btn-add" id="btnAddCartao">${iconPlus()}</button>
          </div>
          <div class="bl-pills" id="pillsCartoes">${renderPillsCartoes()}</div>

          <div class="bl-section-divider">${iconStarSmall()} Craque do jogo</div>
          <select class="bl-craque-select" id="fCraque">
            <option value="">Nenhum selecionado</option>
            ${optionsJogadoresHtml(temp, f.craque || "")}
          </select>

          <div class="bl-modal-footer">
            <button type="button" class="bl-btn-secondary" id="jogoModalCancel">Cancelar</button>
            <button type="submit" class="bl-btn-primary">${isNew ? "Adicionar jogo" : "Salvar alterações"}</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.getElementById("modalRoot").innerHTML = html;
  attachJogoModalListeners(isNew);
}

function renderPillsGols(temp) {
  return jogoFormState.gols.map((g) => {
    const time = temp.jogadores.find((p) => p.nome === g.jogador)?.time || null;
    return `<span class="bl-pill bl-pill-${timeClasse(time)}">${escapeHtml(g.jogador)} (${g.quantidade})<button type="button" class="bl-pill-x" data-remove-gol="${escapeHtml(g.jogador)}" aria-label="Remover">${iconX()}</button></span>`;
  }).join("");
}
function renderPillsCartoes() {
  return jogoFormState.cartoes.map((c) => {
    return `<span class="bl-pill bl-cartao-pill-${c.tipo}"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>${escapeHtml(c.jogador)}<button type="button" class="bl-pill-x" data-remove-cartao="${c.id}" aria-label="Remover">${iconX()}</button></span>`;
  }).join("");
}

function refreshAvisoGols() {
  const ga = golsTotal(TIME_A);
  const gb = golsTotal(TIME_B);
  const placarA = Number(document.getElementById("fPlacarA").value);
  const placarB = Number(document.getElementById("fPlacarB").value);
  const mostraAviso = (ga + gb > 0) && (placarA !== ga || placarB !== gb);
  document.getElementById("avisoGols").innerHTML = mostraAviso ? `<p class="bl-hint bl-hint-warn">Gols lançados: ${ga} × ${gb} — confira se bate com o placar acima.</p>` : "";
}

function attachJogoModalListeners(isNew) {
  const temp = temporadaVisualizada();
  const overlay = document.getElementById("jogoModalOverlay");
  overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) closeJogoModal(); });
  document.getElementById("jogoModalClose").addEventListener("click", closeJogoModal);
  document.getElementById("jogoModalCancel").addEventListener("click", closeJogoModal);

  document.getElementById("fPlacarA").addEventListener("input", refreshAvisoGols);
  document.getElementById("fPlacarB").addEventListener("input", refreshAvisoGols);

  document.getElementById("fJogoData").addEventListener("input", (e) => {
    const sexta = ehSextaFeira(e.target.value);
    const hint = document.getElementById("hintSexta");
    hint.textContent = e.target.value ? (sexta ? "✓ cai numa sexta-feira" : "atenção: a pelada costuma ser nas sextas") : "a pelada acontece sempre nas sextas do mês";
    hint.classList.toggle("bl-field-hint-warn", sexta === false);
  });

  document.getElementById("btnAddGol").addEventListener("click", () => {
    const jogador = document.getElementById("fGolJogador").value;
    const qtd = Number(document.getElementById("fGolQtd").value) || 1;
    if (!jogador) return;
    const existente = jogoFormState.gols.find((g) => g.jogador === jogador);
    if (existente) existente.quantidade += qtd;
    else jogoFormState.gols.push({ jogador, quantidade: qtd });
    document.getElementById("pillsGols").innerHTML = renderPillsGols(temp);
    attachPillRemoveListeners();
    document.getElementById("fGolJogador").value = "";
    document.getElementById("fGolQtd").value = "1";
    refreshAvisoGols();
  });

  document.getElementById("btnAddCartao").addEventListener("click", () => {
    const jogador = document.getElementById("fCartaoJogador").value;
    const tipo = document.getElementById("fCartaoTipo").value;
    if (!jogador) return;
    jogoFormState.cartoes.push({ jogador, tipo, id: uid("c") });
    document.getElementById("pillsCartoes").innerHTML = renderPillsCartoes();
    attachPillRemoveListeners();
    document.getElementById("fCartaoJogador").value = "";
  });

  attachPillRemoveListeners();

  document.getElementById("jogoForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("fJogoData").value;
    if (!date) return;
    const jogo = {
      id: jogoFormState.id || uid("g"),
      date,
      time: document.getElementById("fJogoHorario").value,
      placarA: Number(document.getElementById("fPlacarA").value),
      placarB: Number(document.getElementById("fPlacarB").value),
      craque: document.getElementById("fCraque").value,
      gols: jogoFormState.gols,
      cartoes: jogoFormState.cartoes,
    };
    closeJogoModal();
    handleSaveJogo(jogo, isNew);
  });
}

function attachPillRemoveListeners() {
  const temp = temporadaVisualizada();
  document.querySelectorAll("[data-remove-gol]").forEach((el) => {
    el.addEventListener("click", () => {
      const nome = el.getAttribute("data-remove-gol");
      jogoFormState.gols = jogoFormState.gols.filter((g) => g.jogador !== nome);
      document.getElementById("pillsGols").innerHTML = renderPillsGols(temp);
      attachPillRemoveListeners();
      refreshAvisoGols();
    });
  });
  document.querySelectorAll("[data-remove-cartao]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-remove-cartao");
      jogoFormState.cartoes = jogoFormState.cartoes.filter((c) => c.id !== id);
      document.getElementById("pillsCartoes").innerHTML = renderPillsCartoes();
      attachPillRemoveListeners();
    });
  });
}

function closeJogoModal() {
  document.getElementById("modalRoot").innerHTML = "";
  jogoFormState = null;
}

function handleSaveJogo(jogo, isNew) {
  const temp = temporadaVisualizada(); 
  
  if (!temp.jogos) temp.jogos = []; 
  
  const existe = temp.jogos.some((j) => j.id === jogo.id);
  if (existe) temp.jogos = temp.jogos.map((j) => (j.id === jogo.id ? jogo : j));
  else temp.jogos.push(jogo);
  
  saveAppState(); 
  renderAll();
  showToast(isNew ? "Jogo adicionado" : "Jogo atualizado");
}

function handleDeleteJogo(id) {
  const temp = temporadaVisualizada();
  
  if (!temp.jogos) temp.jogos = [];
  
  temp.jogos = temp.jogos.filter((j) => j.id !== id);
  saveAppState();
  renderAll();
  showToast("Jogo removido");
}

function openConfirmDelete(jogoId) {
  const html = `
    <div class="bl-modal-overlay" id="confirmDeleteOverlay">
      <div class="bl-modal bl-modal-confirm">
        <p class="bl-confirm-text">Excluir este jogo? Essa ação não pode ser desfeita.</p>
        <div class="bl-modal-footer">
          <button type="button" class="bl-btn-secondary" id="confirmDeleteCancel">Cancelar</button>
          <button type="button" class="bl-btn-danger" id="confirmDeleteOk">Excluir</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById("modalRoot").innerHTML = html;
  const overlay = document.getElementById("confirmDeleteOverlay");
  overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) closeGenericModal(); });
  document.getElementById("confirmDeleteCancel").addEventListener("click", closeGenericModal);
  document.getElementById("confirmDeleteOk").addEventListener("click", () => {
    closeGenericModal();
    handleDeleteJogo(jogoId);
  });
}
