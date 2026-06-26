// ============================================================
// BESTS LEAGUE — modal de Nova temporada
// ============================================================

// ---------- MODAL: NOVA TEMPORADA ----------

function openNovaTemporadaModal() {
  const temp = temporadaEmAndamento();
  const html = `
    <div class="bl-modal-overlay" id="novaTempOverlay">
      <div class="bl-modal bl-modal-sm">
        <div class="bl-modal-header">
          <h2>Nova temporada</h2>
          <button type="button" class="bl-iconbtn" id="novaTempClose" aria-label="Fechar">${iconX().replace('width="11" height="11"', 'width="20" height="20"')}</button>
        </div>
        <form id="formNovaTemp" class="bl-modal-body">
          <p class="bl-hint" style="text-align:left; margin-bottom:18px;">
            A temporada atual (<strong>${escapeHtml(temp.nome)}</strong>) será arquivada com todos os jogos e estatísticas — você poderá consultá-la depois pelo seletor de temporada no topo. O elenco será copiado para a nova temporada, mas pode ser editado livremente.
          </p>
          <label class="bl-field" style="margin-bottom:14px;">
            <span>Nome da nova temporada</span>
            <input type="text" id="fNomeTemp" placeholder="Ex: Temporada 2026 — 2º turno" required />
          </label>
          <div class="bl-form-row">
            <label class="bl-field">
              <span>Nome do Time A</span>
              <input type="text" id="fNomeTimeA" value="${escapeHtml(temp.timeA.nome)}" />
            </label>
            <label class="bl-field">
              <span>Nome do Time B</span>
              <input type="text" id="fNomeTimeB" value="${escapeHtml(temp.timeB.nome)}" />
            </label>
          </div>
          <div class="bl-modal-footer">
            <button type="button" class="bl-btn-secondary" id="novaTempCancel">Cancelar</button>
            <button type="submit" class="bl-btn-primary">Criar temporada</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.getElementById("modalRoot").innerHTML = html;
  const overlay = document.getElementById("novaTempOverlay");
  overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) closeGenericModal(); });
  document.getElementById("novaTempClose").addEventListener("click", closeGenericModal);
  document.getElementById("novaTempCancel").addEventListener("click", closeGenericModal);
  document.getElementById("formNovaTemp").addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("fNomeTemp").value.trim();
    const timeA = document.getElementById("fNomeTimeA").value.trim();
    const timeB = document.getElementById("fNomeTimeB").value.trim();
    if (!nome) return;
    criarNovaTemporada(nome, timeA, timeB);
    closeGenericModal();
    renderAll();
    showToast("Nova temporada criada");
  });
}