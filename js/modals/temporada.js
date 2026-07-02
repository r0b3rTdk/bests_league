// ============================================================
// BESTS LEAGUE — MODAL DE NOVA TEMPORADA COM HALL OF FAME
// ============================================================

function openNovaTemporadaModal() {
  if (!window.isAdmin) {
    showToast("Acesso negado: apenas administradores.", true);
    return;
  }

  const tempAtual = typeof temporadaEmAndamento === "function" ? temporadaEmAndamento() : null;

  // 🔹 SE HOUVER UMA TEMPORADA ATIVA COM JOGOS, MOSTRA O HALL OF FAME PRIMEIRO!
  if (tempAtual && tempAtual.jogos && tempAtual.jogos.filter(j => j.placarA !== null).length > 0) {
    renderHallOfFameModal(tempAtual);
  } else {
    // Se não tiver temporada anterior ou não tiver jogos nela, vai direto pro form
    renderFormNovaTemporadaHtml();
  }
}

// 👑 TELA 1: O HALL OF FAME DA BANCA (O FECHAMENTO)
function renderHallOfFameModal(temp) {
  // --- CÁLCULO MATEMÁTICO DOS DADOS DA TEMPORADA ---
  let vitA = 0, vitB = 0, emp = 0, derA = 0, derB = 0;
  let gpA = 0, gcA = 0, gpB = 0, gcB = 0;
  let mapaGols = {}, mapaCraques = {};

  const jogosValidos = temp.jogos.filter(j => j.placarA !== null && j.placarB !== null);
  const totalJogos = jogosValidos.length;

  jogosValidos.forEach(j => {
    // Gols Pro e Contra
    gpA += j.placarA; gcA += j.placarB;
    gpB += j.placarB; gcB += j.placarA;

    // Vitórias, Derrotas e Empates
    if (j.placarA > j.placarB) { vitA++; derB++; }
    else if (j.placarB > j.placarA) { vitB++; derA++; }
    else { emp++; }

    // Craque do Jogo
    if (j.craque) mapaCraques[j.craque] = (mapaCraques[j.craque] || 0) + 1;

    // Gols Individuais
    (j.gols || []).forEach(g => {
      mapaGols[g.jogador] = (mapaGols[g.jogador] || 0) + (g.quantidade || 0);
    });
  });

  // Pontuação e Definição do Campeão (Critério: Pontos -> Vitórias -> Saldo de Gols)
  const ptsA = (vitA * 3) + emp;
  const ptsB = (vitB * 3) + emp;
  const sgA = gpA - gcA;
  const sgB = gpB - gcB;

  let campeaoId = "timeA";
  if (ptsB > ptsA) campeaoId = "timeB";
  else if (ptsA === ptsB) {
    if (vitB > vitA) campeaoId = "timeB";
    else if (vitA === vitB && sgB > sgA) campeaoId = "timeB";
  }

  const ehTimeACampeao = campeaoId === "timeA";
  const timeCampeao = ehTimeACampeao ? temp.timeA : temp.timeB;
  
  // Dados estatísticos do campeão para exibir
  const cVitorias = ehTimeACampeao ? vitA : vitB;
  const cEmpates = emp;
  const cDerrotas = ehTimeACampeao ? derA : derB;
  const cGolsPro = ehTimeACampeao ? gpA : gpB;
  const cGolsContra = ehTimeACampeao ? gcA : gcB;
  const cAproveitamento = totalJogos > 0 ? (((cVitorias * 3 + cEmpates) / (totalJogos * 3)) * 100).toFixed(1) : "0.0";

  // Descobre o Artilheiro e o Craque Maximo da Temporada
  const topScorer = Object.entries(mapaGols).sort((a,b) => b[1] - a[1])[0] || ["Nenhum", 0];
  const topMVP = Object.entries(mapaCraques).sort((a,b) => b[1] - a[1])[0] || ["Nenhum", 0];

  // Filtra os jogadores pertencentes ao time campeão
  const jogadoresCampeoes = (temp.jogadores || []).filter(j => {
    const tClean = j.time ? j.time.toLowerCase().trim() : "";
    return ehTimeACampeao ? (tClean === "timea" || tClean === "bra") : (tClean === "timeb" || tClean === "ver");
  });

  const html = `
    <div class="bl-modal-overlay" id="tempModalOverlay">
      <div class="bl-modal bl-modal-lg bl-hall-fame-theme">
        <div class="bl-modal-header text-center">
          <h1 class="bl-gold-glow-title">👑 FIM DA TEMPORADA 👑</h1>
          <button type="button" class="bl-iconbtn" id="tempModalClose">❌</button>
        </div>
        
        <div class="bl-modal-body">
          
          <!-- BANNER DO CAMPEÃO -->
          <div class="bl-champion-banner" style="--team-color: ${timeCampeao.cor || '#ffd700'}">
            <div class="bl-trophy-sticker">🏆</div>
            <p class="bl-champ-sub">CAMPEÃO INCONTESTÁVEL</p>
            <h2 class="bl-champ-name">${timeCampeao.nome}</h2>
          </div>

          <!-- DASHBOARD DE ESTATÍSTICAS DO CAMPEÃO -->
          <div class="bl-champ-stats-grid">
            <div class="bl-stat-card"><span>${cAproveitamento}%</span><label>Aproveitamento</label></div>
            <div class="bl-stat-card"><span>${cVitorias}V - ${cEmpates}E - ${cDerrotas}D</span><label>Campanha</label></div>
            <div class="bl-stat-card"><span>${cGolsPro}</span><label>Gols Pró</label></div>
            <div class="bl-stat-card"><span>${cGolsContra}</span><label>Gols Contra</label></div>
          </div>

          <!-- INDIVIDUAL PREMIUM AWARDS -->
          <div class="bl-awards-row">
            <div class="bl-award-badge gold">
              <div class="bl-award-icon">⚽</div>
              <div class="bl-award-info">
                <span class="bl-award-label">ARTILHEIRO DA LIGA</span>
                <span class="bl-award-player">${topScorer[0]}</span>
                <span class="bl-award-stat">${topScorer[1]} Gols</span>
              </div>
            </div>

            <div class="bl-award-badge purple">
              <div class="bl-award-icon">⭐</div>
              <div class="bl-award-info">
                <span class="bl-award-label">CRAQUE DA TEMPORADA</span>
                <span class="bl-award-player">${topMVP[0]}</span>
                <span class="bl-award-stat">${topMVP[1]}× Melhor em Campo</span>
              </div>
            </div>
          </div>

          <!-- GRID DE CARDS DOS JOGADORES CAMPEÕES -->
          <h3 class="bl-section-title-fame">👥 Elenco Vitorioso</h3>
          <div class="bl-fifa-cards-grid-fame">
            ${jogadoresCampeoes.map(j => {
              if (typeof renderFifaCard === "function") return renderFifaCard(temp, j, false);
              return `<div class="mini-player-name-fallback">${j.nome}</div>`;
            }).join("")}
          </div>

          <!-- AÇÃO PARA AVANÇAR -->
          <div class="bl-modal-actions-fame">
            <button type="button" class="bl-btn-next-season" id="btnAvancarNovaTemp">
              Arquivar e Iniciar Próxima Temporada ➔
            </button>
          </div>

        </div>
      </div>
    </div>
  `;

  document.getElementById("modalRoot").innerHTML = html;

  // Listeners de fechar
  document.getElementById("tempModalClose").addEventListener("click", closeGenericModal);
  
  // Botão mágico para avançar para o formulário real
  document.getElementById("btnAvancarNovaTemp").addEventListener("click", () => {
    renderFormNovaTemporadaHtml();
  });
}

// 📝 TELA 2: FORMULÁRIO DE CRIAÇÃO (O CÓDIGO ATUAL QUE JÁ FUNCIONA)
function renderFormNovaTemporadaHtml() {
  const tempAtual = typeof temporadaVisualizada === "function" ? temporadaVisualizada() : null;
  const temJogadoresParaMigrar = tempAtual && tempAtual.jogadores && tempAtual.jogadores.length > 0;

  const html = `
    <div class="bl-modal-overlay" id="tempModalOverlay">
      <div class="bl-modal bl-modal-md">
        <div class="bl-modal-header">
          <h2>⚡ Configurar Nova Temporada</h2>
          <button type="button" class="bl-iconbtn" id="tempModalClose">❌</button>
        </div>
        <div class="bl-modal-body">
          <form id="formNovaTemporada" class="bl-form-layout">
            
            <div class="bl-form-group">
              <label>Nome da Temporada</label>
              <input type="text" id="newTempNome" placeholder="Ex: TEMPORADA 2027" required class="bl-input-grande" />
            </div>

            <div class="bl-form-row-2col">
              <div class="bl-form-group-time">
                <label>Nome do Time A</label>
                <div class="bl-input-color-group">
                  <input type="text" id="newTimeANome" placeholder="Ex: TIME A" required />
                  <input type="color" id="newTimeACor" value="#ffd700" />
                </div>
              </div>

              <div class="bl-form-group-time">
                <label>Nome do Time B</label>
                <div class="bl-input-color-group">
                  <input type="text" id="newTimeBNome" placeholder="Ex: TIME B" required />
                  <input type="color" id="newTimeBCor" value="#ff4500" />
                </div>
              </div>
            </div>

            <hr class="bl-modal-divider" />

            <div class="bl-form-group">
              <label class="bl-label-secao">📦 Regras de Transição de Elenco</label>
              <div class="bl-radio-box-group">
                <label class="bl-radio-tile">
                  <input type="radio" name="regraElenco" value="zerar" ${!temJogadoresParaMigrar ? 'checked' : ''} />
                  <div class="bl-radio-content">
                    <span class="bl-radio-title">❌ Reset Total (Do Zero)</span>
                    <span class="bl-radio-desc">A nova temporada começará sem nenhum jogador cadastrado.</span>
                  </div>
                </label>

                <label class="bl-radio-tile ${!temJogadoresParaMigrar ? 'bl-disabled' : ''}">
                  <input type="radio" name="regraElenco" value="manter" ${temJogadoresParaMigrar ? 'checked' : ''} ${!temJogadoresParaMigrar ? 'disabled' : ''} />
                  <div class="bl-radio-content">
                    <span class="bl-radio-title">👥 Importar Jogadores Atuais</span>
                    <span class="bl-radio-desc">Traz os jogadores da temporada anterior para esta nova.</span>
                  </div>
                </label>
              </div>
            </div>

            <div class="bl-form-group" id="subConfigEstrelas" style="display: ${temJogadoresParaMigrar ? 'block' : 'none'};">
              <label class="bl-label-secao">⭐ Tratamento de Habilidade (Overall)</label>
              <div class="bl-radio-box-group-sub">
                <label class="bl-radio-inline">
                  <input type="radio" name="regraEstrelas" value="manter" checked />
                  <span>Manter as estrelas atuais de cada jogador</span>
                </label>
                <label class="bl-radio-inline">
                  <input type="radio" name="regraEstrelas" value="resetar" />
                  <span>Resetar todos para 3 estrelas</span>
                </label>
              </div>
            </div>

            <button type="submit" class="bl-btn-submit-banca">Lançar Nova Temporada</button>
          </form>

          ${tempAtual ? `
            <div class="bl-danger-zone">
              <p class="bl-danger-title">⚠️ Zona de Perigo</p>
              <p class="bl-danger-desc">Deseja apagar a temporada <strong>"${escapeHtml(tempAtual.nome)}"</strong> atual da nuvem?</p>
              <button type="button" class="bl-btn-danger-banca" id="btnExcluirTemporadaAtual">Excluir Temporada Atual</button>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  document.getElementById("modalRoot").innerHTML = html;

  // Re-atacha todos os listeners do formulário e da exclusão perfeitamente
  const overlay = document.getElementById("tempModalOverlay");
  overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) closeGenericModal(); });
  document.getElementById("tempModalClose").addEventListener("click", closeGenericModal);

  const radiosElenco = document.querySelectorAll('input[name="regraElenco"]');
  radiosElenco.forEach(r => {
    r.addEventListener("change", (e) => {
      const subConfig = document.getElementById("subConfigEstrelas");
      if (subConfig) subConfig.style.display = e.target.value === "manter" ? "block" : "none";
    });
  });

  // Listener Submit do Form
  document.getElementById("formNovaTemporada").addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("newTempNome").value.trim().toUpperCase();
    const timeANome = document.getElementById("newTimeANome").value.trim().toUpperCase();
    const timeACor = document.getElementById("newTimeACor").value;
    const timeBNome = document.getElementById("newTimeBNome").value.trim().toUpperCase();
    const timeBCor = document.getElementById("newTimeBCor").value;
    const regraElenco = document.querySelector('input[name="regraElenco"]:checked').value;
    const regraEstrelas = document.querySelector('input[name="regraEstrelas"]:checked') ? document.querySelector('input[name="regraEstrelas"]:checked').value : 'manter';

    if (tempAtual) tempAtual.arquivadaEm = new Date().toISOString().split("T")[0];

    let novosJogadores = [];
    if (regraElenco === "manter" && tempAtual) {
      novosJogadores = tempAtual.jogadores.map(j => ({
        id: j.id, nome: j.nome, time: "AVULSO", overall: regraEstrelas === "resetar" ? 3 : (j.overall || 3)
      }));
    }

    const novaTemp = {
      id: "temp_" + Date.now(), nome: nome,
      timeA: { nome: timeANome, cor: timeACor }, timeB: { nome: timeBNome, cor: timeBCor },
      jogadores: novosJogadores, jogos: []
    };

    if (!appState.temporadas) appState.temporadas = [];
    appState.temporadas.push(novaTemp);
    appState.temporadaVisualizadaId = novaTemp.id;

    saveAppState();
    if (typeof initTemporadaSelect === "function") initTemporadaSelect(); 
    closeGenericModal();
    renderAll();
    showToast(`Sucesso: ${nome} iniciada!`);
  });

  const btnExcluir = document.getElementById("btnExcluirTemporadaAtual");
  if (btnExcluir && tempAtual) {
    btnExcluir.addEventListener("click", () => {
      if (!confirm(`🚨 EXCLUSÃO DE TEMPORADA!\n\nVocê tem certeza absoluta que deseja APAGAR COMPLETAMENTE a "${tempAtual.nome}"?\nTodos os jogos e históricos salvos nela sumirão.`)) return;
      
      const senhaConfirmacao = prompt("Para confirmar a destruição da temporada, digite a senha de Administrador:");
      
      if (senhaConfirmacao === "bests2026") {
        // Remove exatamente a temporada que estava sendo visualizada
        appState.temporadas = appState.temporadas.filter(t => t.id !== tempAtual.id);
        appState.temporadaVisualizadaId = appState.temporadas.length > 0 ? appState.temporadas[appState.temporadas.length - 1].id : "temp_1";
        
        saveAppState();
        if (typeof initTemporadaSelect === "function") initTemporadaSelect();
        closeGenericModal();
        renderAll();
        showToast("Temporada excluída com sucesso!", true);
      } else if (senhaConfirmacao !== null) {
        alert("Senha incorreta! Operação cancelada de forma segura.");
      }
    });
  }
}