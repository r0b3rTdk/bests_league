// ============================================================
// BESTS LEAGUE — RENDER GERAL E SEGURANÇA MESTRE
// ============================================================

// Helper absoluto para calcular o campeão de qualquer época
function descobrirTimeCampeaoObjeto(temp) {
  if (temp && temp.id === "temp_2025") {
    return { ehTimeACampeao: false, objeto: temp.timeB, vitA: 8, vitB: 8, emp: 3, gpA: 89, gcA: 86, gpB: 86, gcB: 89, derA: 8, derB: 8 };
  }

  let vitA = 0, vitB = 0, emp = 0, gpA = 0, gcA = 0, gpB = 0, gcB = 0;
  const jogosValidos = (temp.jogos || []).filter(j => j.placarA !== null && j.placarB !== null);
  
  jogosValidos.forEach(j => {
    gpA += j.placarA; gcA += j.placarB; gpB += j.placarB; 
    gcB += j.placarA; // Corrigido para evitar NaN
    if (j.placarA > j.placarB) vitA++; else if (j.placarB > j.placarA) vitB++; else emp++;
  });

  const ptsA = (vitA * 3) + emp; ptsB = (vitB * 3) + emp;
  const sgA = gpA - gcA; sgB = gpB - gcB;

  let ehA = true;
  if (ptsB > ptsA) { ehA = false; } 
  else if (ptsA === ptsB) {
    if (vitB > vitA) { ehA = false; } 
    else if (vitA === vitB && sgB > sgA) { ehA = false; }
  }

  return { ehTimeACampeao: ehA, objeto: ehA ? temp.timeA : temp.timeB, vitA, vitB, emp, gpA, gcA, gpB, gcB, derA: vitB, derB: vitA };
}

function renderAll() {
  renderTemporadaHeader();
  aplicarTratamentoSeguranca();
  
  const temp = temporadaVisualizada();
  const ehArquivada = temp && temp.arquivadaEm !== null && temp.arquivadaEm !== undefined && temp.arquivadaEm !== "";

  const confrontoBarTop = document.getElementById("confrontoBar");
  const heroSec = document.getElementById("heroSection") || document.querySelector(".bl-hero-container");

  if (ehArquivada) {
    if (confrontoBarTop) { confrontoBarTop.style.display = "none"; confrontoBarTop.innerHTML = ""; }

    if (heroSec) {
      heroSec.style.display = "block";
      const resCampeao = descobrirTimeCampeaoObjeto(temp);
      const timeCampeao = resCampeao.objeto;
      const detalhePenalties = temp.id === "temp_2025" ? `<p class="bl-champ-sub" style="color:#FFF; margin-top:4px; font-size:0.85rem;">Vencedor nos Pênaltis (3x1) ⚡</p>` : '';
      
      const jogosValidos = (temp.jogos || []).filter(j => j.placarA !== null && j.placarB !== null);
      const totalJogos = jogosValidos.length;
      const cVitorias = resCampeao.ehTimeACampeao ? resCampeao.vitA : resCampeao.vitB;
      const cDerrotas = resCampeao.ehTimeACampeao ? (resCampeao.derA !== undefined ? resCampeao.derA : resCampeao.vitB) : (resCampeao.derB !== undefined ? resCampeao.derB : resCampeao.vitA);
      const cGolsPro = resCampeao.ehTimeACampeao ? resCampeao.gpA : resCampeao.gpB;
      const cGolsContra = resCampeao.ehTimeACampeao ? resCampeao.gcA : resCampeao.gcB;
      const cAproveitamento = totalJogos > 0 ? (((cVitorias * 3 + resCampeao.emp) / (totalJogos * 3)) * 100).toFixed(1) : "0.0";

      // Injeta o Banner do Campeão E as Estatísticas juntos no HERO (Topo)
      heroSec.innerHTML = `
        <div class="bl-hero" style="margin-bottom: 15px;">
          <div class="bl-champion-banner" style="--team-color: ${timeCampeao.cor || '#ffd700'}; margin-bottom: 15px; padding: 1.8rem 1.5rem;">
            <div class="bl-trophy-sticker">🏆</div>
            <p class="bl-champ-sub">CAMPEÃO DA TEMPORADA</p>
            <h2 class="bl-champ-name" style="text-transform: uppercase; text-shadow: 0 0 15px rgba(255,255,255,0.2);">${timeCampeao.nome}</h2>
            ${detalhePenalties}
          </div>
          
          <div class="bl-champ-stats-grid" style="margin-top: 15px;">
            <div class="bl-stat-card"><span>${cAproveitamento}%</span><label>Aproveitamento</label></div>
            <div class="bl-stat-card"><span>${cVitorias}V - ${resCampeao.emp}E - ${cDerrotas}D</span><label>Campanha</label></div>
            <div class="bl-stat-card"><span>${cGolsPro}</span><label>Gols Pró</label></div>
            <div class="bl-stat-card"><span>${cGolsContra}</span><label>Gols Contra</label></div>
          </div>
        </div>
      `;
    }

    const container = document.getElementById("tabContent");
    if (container) {
      container.innerHTML = gerarHtmlHallOfFameInline(temp);
      if (typeof initFameDragScroll === "function") initFameDragScroll();
    }
  } else {
    if (confrontoBarTop) confrontoBarTop.style.display = "";
    if (heroSec) {
      heroSec.style.display = "block";
      heroSec.innerHTML = `<div class="bl-hero"><p class="bl-hero-label">ÚLTIMO RESULTADO</p><div id="heroScoreboard"></div></div>`;
    }
    if (typeof renderHero === "function") renderHero();
    if (typeof renderConfrontoBar === "function") renderConfrontoBar();
    if (typeof renderTabContent === "function") renderTabContent();
  }
}

function gerarHtmlHallOfFameInline(temp) {
  const res = descobrirTimeCampeaoObjeto(temp);
  const jogosValidos = (temp.jogos || []).filter(j => j.placarA !== null && j.placarB !== null);

  let mapaGols = {}, mapaCraques = {};

  if (temp.historico && temp.historico.gols) {
    temp.historico.gols.forEach(g => { mapaGols[g.jogador] = (mapaGols[g.jogador] || 0) + (g.quantidade || 1); });
  }
  jogosValidos.forEach(j => {
    if (j.craque) mapaCraques[j.craque] = (mapaCraques[j.craque] || 0) + 1;
    (j.gols || []).forEach(g => { mapaGols[g.jogador] = (mapaGols[g.jogador] || 0) + (g.quantidade || 1); });
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
    <div class="bl-hall-fame-inline-container" style="margin-top: 5px;">
      <h3 class="bl-section-title-fame">👥 Elenco Vitorioso</h3>
      <div class="bl-fifa-cards-grid-fame">
        ${jogadoresCampeoes.map(j => typeof renderFifaCard === "function" ? renderFifaCard(temp, j, false) : `<div>${j.nome}</div>`).join("")}
      </div>
      <div class="bl-awards-row" style="margin-top: 25px;">
        <div class="bl-award-badge gold">
          <div class="bl-award-icon">⚽</div>
          <div class="bl-award-info"><span class="bl-award-label">ARTILHEIRO</span><span class="bl-award-player">${topScorer[0]}</span><span class="bl-award-stat">${topScorer[1]} Gols</span></div>
        </div>
        <div class="bl-award-badge purple">
          <div class="bl-award-icon">⭐</div>
          <div class="bl-award-info"><span class="bl-award-label">CRAQUE DA TEMPORADA</span><span class="bl-award-player">${topMVP[0]}</span><span class="bl-award-stat">${topMVP[1]}× MVP</span></div>
        </div>
      </div>
      ${renderBlocoEstatisticas(temp)}
    </div>
  `;
}

function initBotaoSecretoAdmin() {
  const footer = document.querySelector(".bl-footer");
  if (footer) {
    footer.style.cursor = "pointer"; 
    footer.style.userSelect = "none";
    footer.title = "Área Restrita — Desenvolvedor";
    footer.removeEventListener("click", lancarPromptAdmin);
    footer.addEventListener("click", lancarPromptAdmin);
  }
}

function lancarPromptAdmin() {
  const senha = prompt("Digite a senha para liberar o modo Administrador:");
  if (senha === "bests2026") {
    window.localStorage.setItem("bl_admin_token", "PELADA_ADMIN_2026");
    showToast("Modo Admin Ativado com sucesso!");
    setTimeout(() => { location.reload(); }, 1000);
  } else if (senha !== null) {
    showToast("Senha incorreta!", true);
  }
}

function aplicarTratamentoSeguranca() {
  const adminToken = window.localStorage.getItem("bl_admin_token");
  window.isAdmin = adminToken === "PELADA_ADMIN_2026";
  
  if (document.getElementById("btnNovoJogo")) {
    document.getElementById("btnNovoJogo").style.display = window.isAdmin ? "block" : "none";
  }
  if (document.getElementById("btnGerenciarElenco")) {
    document.getElementById("btnGerenciarElenco").style.display = window.isAdmin ? "block" : "none";
  }

  const optNovaTemporada = document.querySelector('option[value="__nova__"]');
  if (optNovaTemporada) {
    if (window.isAdmin) {
      optNovaTemporada.removeAttribute("disabled");
      optNovaTemporada.style.display = "block";
    } else {
      optNovaTemporada.setAttribute("disabled", "true");
      optNovaTemporada.style.display = "none";
    }
  }

  const seletores = document.querySelectorAll("select");
  seletores.forEach((selectTemp) => {
    if (selectTemp && !window.isAdmin) {
      for (let i = 0; i < selectTemp.options.length; i++) {
        if (selectTemp.options[i].value === "nova" || selectTemp.options[i].text.includes("Criar nova temporada")) {
          selectTemp.remove(i);
        }
      }
    }
  });
}

// 🔹 CORREÇÃO DE REDECLARAÇÃO: Apenas uma instância global e segura do toast
function checkIcon() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C853" stroke-width="3" style="margin-right: 6px; display: inline-block; vertical-align: middle;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
}

let toastTimeout = null;
function showToast(msg, isError) {
  const root = document.getElementById("toastRoot");
  if (!root) return;
  clearTimeout(toastTimeout);
  root.innerHTML = `<div class="bl-toast ${isError ? "bl-toast-erro" : ""}">${isError ? "" : checkIcon()} ${escapeHtml(msg)}</div>`;
  toastTimeout = setTimeout(() => { root.innerHTML = ""; }, isError ? 6000 : 2400);
}

function renderBlocoEstatisticas(temp) {
  const res = descobrirTimeCampeaoObjeto(temp);
  
  // 🔹 CORREÇÃO DE ORDENAÇÃO: Garante a ordem cronológica real dos jogos antes de filtrar
  const jogosCronologicos = typeof jogosOrdenados === "function" ? jogosOrdenados(temp) : (temp.jogos || []);
  const jogosValidos = jogosCronologicos.filter(j => j.placarA !== null && j.placarB !== null);
  const totalJogos = jogosValidos.length;
  
  // Captura o último jogo real disputado da temporada
  const ultimoJogo = totalJogos > 0 ? jogosValidos[totalJogos - 1] : null;

  let estiloColA = "flex: 1; text-align: left; padding: 12px 20px; border-radius: 12px; transition: all 0.3s ease;";
  let estiloColB = "flex: 1; text-align: right; padding: 12px 20px; border-radius: 12px; transition: all 0.3s ease;";
  let estiloEmpatePill = "background: #2a2a2a; padding: 12px 28px; border-radius: 12px; text-align: center; margin: 0 20px; min-width: 120px; transition: all 0.3s ease;";

  // Aplica a pílula cinza no lado oposto ao vencedor do último confronto
  if (ultimoJogo) {
    if (ultimoJogo.placarA < ultimoJogo.placarB) {
      // Vitória do Branco (A) ➔ Pílula cinza vai para cima do PRETO (B)
      estiloColB = "flex: 1; text-align: right; background: #2a2a2a; padding: 12px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.02); transition: all 0.3s ease;";
      estiloEmpatePill = "padding: 12px 28px; text-align: center; margin: 0 20px; min-width: 120px; transition: all 0.3s ease;";
    } else if (ultimoJogo.placarB < ultimoJogo.placarA) {
      // Vitória do Preto (B) ➔ Pílula cinza vai para cima do BRANCO (A)
      estiloColA = "flex: 1; text-align: left; background: #2a2a2a; padding: 12px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.02); transition: all 0.3s ease;";
      estiloEmpatePill = "padding: 12px 28px; text-align: center; margin: 0 20px; min-width: 120px; transition: all 0.3s ease;";
    }
  }

  return `
    <div class="bl-estatisticas-container">
      <div class="bl-estatisticas-titulo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
        ESTATÍSTICAS DA TEMPORADA
      </div>
      
      <div class="bl-estatisticas-grid-top">
        <!-- ⚪ Lado do Time A (Branco) -->
        <div style="${estiloColA}">
          <div class="bl-stat-valor">${res.vitA}</div>
          <div class="bl-stat-label">VITÓRIAS ${escapeHtml(temp.timeA.nome).toUpperCase()}</div>
        </div>
        
        <!-- 🤝 Centro (Empates) -->
        <div style="${estiloEmpatePill}">
          <div style="font-family:'Impact',sans-serif; font-size: 1.6rem; color: var(--bl-gold-light); line-height: 1;">${res.emp}</div>
          <div style="font-size: 0.65rem; color: #BBB; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px; font-weight: 600;">EMPATES</div>
        </div>

        <!-- ⚫ Lado do Time B (Preto) -->
        <div style="${estiloColB}">
          <div class="bl-stat-valor">${res.vitB}</div>
          <div class="bl-stat-label">VITÓRIAS ${escapeHtml(temp.timeB.nome).toUpperCase()}</div>
        </div>
      </div>
      
      <div class="bl-estatisticas-grid-bottom">
        <div><div class="bl-stat-valor">${totalJogos}</div><div class="bl-stat-label">JOGOS DISPUTADOS</div></div>
        <div><div class="bl-stat-valor">${res.gpA + res.gpB}</div><div class="bl-stat-label">GOLS NA TEMPORADA</div></div>
        <div><div class="bl-stat-valor">${totalJogos > 0 ? ((res.gpA + res.gpB) / totalJogos).toFixed(1) : '0.0'}</div><div class="bl-stat-label">MÉDIA DE GOLS/JOGO</div></div>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  initBotaoSecretoAdmin();
  aplicarTratamentoSeguranca();
});