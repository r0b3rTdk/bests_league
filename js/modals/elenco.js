// ============================================================
// BESTS LEAGUE — modal de Gerenciar elenco (CRUD de jogadores)
// ============================================================

// ---------- MODAL: GERENCIAR ELENCO ----------

let novoJogadorOverall = 3;

function renderElencoListHtml() {
  const temp = temporadaVisualizada();
  const ordenados = [...temp.jogadores].sort((a, b) => a.nome.localeCompare(b.nome));
  return ordenados.map((j) => {
    const ov = j.overall || 3;
    let starsHtml = '<div class="bl-stars-edit" data-jogador-id="' + j.id + '">';
    for (let i = 1; i <= 5; i++) {
      starsHtml += `<span data-star="${i}" style="color:${i <= ov ? '#D4AF37' : 'rgba(255,255,255,0.2)'};">★</span>`;
    }
    starsHtml += '</div>';
    
    return `
      <div class="bl-jogador-row" data-id="${j.id}">
        <select class="bl-select-inline-time" title="Mudar time">
          <option value="${TIME_A}" ${j.time === TIME_A ? 'selected' : ''}>${escapeHtml(temp.timeA.nome.substring(0,3))}</option>
          <option value="${TIME_B}" ${j.time === TIME_B ? 'selected' : ''}>${escapeHtml(temp.timeB.nome.substring(0,3))}</option>
          <option value="${TIME_AVULSO}" ${j.time === TIME_AVULSO ? 'selected' : ''}>AVL</option>
        </select>
        <input type="text" class="bl-input-inline-nome" value="${escapeHtml(j.nome)}" placeholder="Nome" />
        ${starsHtml}
        <button type="button" class="bl-iconbtn bl-iconbtn-danger" data-remove-jogador="${j.id}" aria-label="Remover ${escapeHtml(j.nome)}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    `;
  }).join("");
}

function openElencoModal() {

  console.log("Testando Admin no clique:", window.isAdmin);
  if (!window.isAdmin) { 
    showToast("Acesso negado: apenas administradores podem gerenciar o elenco.", true);
    return; 
  }

  const temp = temporadaVisualizada();
  novoJogadorOverall = 3;
  const html = `
    <div class="bl-modal-overlay" id="elencoModalOverlay">
      <div class="bl-modal bl-modal-sm">
        <div class="bl-modal-header">
          <h2>Elenco — ${escapeHtml(temp.nome)}</h2>
          <button type="button" class="bl-iconbtn" id="elencoModalClose" aria-label="Fechar">${iconX().replace('width="11" height="11"', 'width="20" height="20"')}</button>
        </div>
        <div class="bl-modal-body">
          <form id="formAddJogador">
            <div class="bl-add-row bl-form-add-jogador">
              <input type="text" placeholder="Nome do novo jogador" id="fNovoJogadorNome" class="bl-input-nome" />
              <select id="fNovoJogadorTime" class="bl-select-time-novo">
                <option value="${TIME_A}">${escapeHtml(temp.timeA.nome)}</option>
                <option value="${TIME_B}">${escapeHtml(temp.timeB.nome)}</option>
                <option value="${TIME_AVULSO}">Avulso</option>
              </select>
              <button type="submit" class="bl-btn-add">${iconPlus()}</button>
            </div>
            <div style="display:flex; align-items:center; gap:10px; margin: 10px 0 4px;">
              <span style="font-size:12px; color:var(--bl-text-dim);">Overall Inicial:</span>
              ${starsInputHtml(novoJogadorOverall, "novoOverallStars")}
            </div>
          </form>
          <div class="bl-jogadores-list" id="jogadoresList">${renderElencoListHtml()}</div>
        </div>
      </div>
    </div>
  `;
  document.getElementById("modalRoot").innerHTML = html;

  const overlay = document.getElementById("elencoModalOverlay");
  overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) closeGenericModal(); });
  document.getElementById("elencoModalClose").addEventListener("click", () => {
    closeGenericModal();
    renderTabContentOnly();
  });

  attachStarsInputListener("novoOverallStars", (v) => { novoJogadorOverall = v; });

  document.getElementById("formAddJogador").addEventListener("submit", (e) => {
    e.preventDefault();
    const nomeInput = document.getElementById("fNovoJogadorNome");
    const nome = nomeInput.value.trim().toUpperCase();
    if (!nome) return;
    const time = document.getElementById("fNovoJogadorTime").value;
    handleAddJogador({ id: uid("j"), nome, time, overall: novoJogadorOverall });
    document.getElementById("jogadoresList").innerHTML = renderElencoListHtml();
    attachElencoListListeners();
    nomeInput.value = "";
    novoJogadorOverall = 3;
    document.getElementById("novoOverallStars").outerHTML = starsInputHtml(3, "novoOverallStars");
    attachStarsInputListener("novoOverallStars", (v) => { novoJogadorOverall = v; });
  });

  attachElencoListListeners();
}

function attachStarsInputListener(elId, onChange) {
  const container = document.getElementById(elId);
  if (!container) return;
  container.querySelectorAll("svg[data-star]").forEach((svg) => {
    svg.addEventListener("click", () => {
      const val = Number(svg.getAttribute("data-star"));
      onChange(val);
      container.setAttribute("data-value", val);
      container.querySelectorAll("svg[data-star]").forEach((s) => {
        const sv = Number(s.getAttribute("data-star"));
        s.classList.toggle("filled", sv <= val);
        s.setAttribute("fill", sv <= val ? "currentColor" : "none");
        s.style.color = sv <= val ? "var(--bl-gold)" : "var(--bl-line-strong)";
      });
    });
  });
}

function attachElencoListListeners() {
  const temp = temporadaVisualizada();

  // 1. Remover jogador da lista
  document.querySelectorAll("[data-remove-jogador]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-remove-jogador");
      handleRemoveJogador(id);
      document.getElementById("jogadoresList").innerHTML = renderElencoListHtml();
      attachElencoListListeners();
    });
  });

  // 2. Mudar estrelas (Overall) dinamicamente clicando nelas
  document.querySelectorAll(".bl-stars-edit").forEach((container) => {
    container.querySelectorAll("span[data-star]").forEach((star) => {
      star.addEventListener("click", () => {
        const jogadorId = container.getAttribute("data-jogador-id");
        const novoOverall = Number(star.getAttribute("data-star"));
        const jogador = temp.jogadores.find((j) => j.id === jogadorId);
        if (!jogador) return;
        jogador.overall = novoOverall;
        saveAppState();
        container.querySelectorAll("span[data-star]").forEach((s) => {
          const v = Number(s.getAttribute("data-star"));
          s.style.color = v <= novoOverall ? "#D4AF37" : "rgba(255,255,255,0.2)";
        });
        showToast(`${jogador.nome} → ${novoOverall}★`);
      });
    });
  });

  // 3. Alterar NOME do jogador com migração histórica de dados
  document.querySelectorAll(".bl-input-inline-nome").forEach((input) => {
    input.addEventListener("change", (e) => {
      const row = input.closest(".bl-jogador-row");
      const id = row.getAttribute("data-id");
      const jogador = temp.jogadores.find((j) => j.id === id);
      if (!jogador) return;
      
      const velhoNome = jogador.nome;
      const novoNome = e.target.value.trim().toUpperCase();
      
      if (!novoNome) {
        e.target.value = velhoNome;
        return;
      }

      if (velhoNome !== novoNome) {
        jogador.nome = novoNome;

        // Altera dados no histórico antigo (1º turno) se houver
        if (temp.historico && temp.historico.gols) {
          temp.historico.gols.forEach(g => { if (g.jogador === velhoNome) g.jogador = novoNome; });
        }
        // Migra gols, cartões e craques nas partidas manuais da temporada
        temp.jogos.forEach(jogo => {
          if (jogo.craque === velhoNome) jogo.craque = novoNome;
          if (jogo.gols) {
            jogo.gols.forEach(g => { if (g.jogador === velhoNome) g.jogador = novoNome; });
          }
          if (jogo.cartoes) {
            jogo.cartoes.forEach(c => { if (c.jogador === velhoNome) c.jogador = novoNome; });
          }
        });

        saveAppState();
        showToast(`Mudou: ${velhoNome} → ${novoNome}`);
      }
    });
  });

  // 4. Alterar TIME do jogador instantaneamente
  document.querySelectorAll(".bl-select-inline-time").forEach((select) => {
    select.addEventListener("change", (e) => {
      const row = select.closest(".bl-jogador-row");
      const id = row.getAttribute("data-id");
      const jogador = temp.jogadores.find((j) => j.id === id);
      if (!jogador) return;

      jogador.time = e.target.value;
      saveAppState();
      showToast(`${jogador.nome} movido de time`);
    });
  });
}

function handleAddJogador(jogador) {
  const temp = temporadaVisualizada();
  temp.jogadores.push(jogador);
  saveAppState();
}

function handleRemoveJogador(id) {
  const temp = temporadaVisualizada();
  temp.jogadores = temp.jogadores.filter((j) => j.id !== id);
  saveAppState();
}