// ============================================================
// BESTS LEAGUE — cabeçalho de temporada, hero/placar e barra de confronto
// ============================================================

function renderTemporadaHeader() {
  const temp = temporadaVisualizada();
  const emAndamento = temporadaEmAndamento();
  document.getElementById("temporadaAtualLabel").textContent = temp.nome + (temp.id !== emAndamento.id ? " (arquivada)" : "");

  const select = document.getElementById("temporadaSelect");
  const temporadas = listaTemporadas();
  let html = temporadas.map((t) => `<option value="${t.id}" ${t.id === temp.id ? "selected" : ""}>${escapeHtml(t.nome)}${t.arquivadaEm ? " (arquivada)" : " (atual)"}</option>`).join("");
  html += `<option value="__nova__">+ Criar nova temporada</option>`;
  select.innerHTML = html;
}

function renderHero() {
  const temp = temporadaVisualizada();
  const ehArquivada = temp && (temp.arquivadaEm || temp.nome.toLowerCase().includes("arquivada"));
  const heroSection = document.getElementById("heroSection");
  
  if (ehArquivada) {
    if (heroSection) heroSection.style.display = "none";
    return;
  }

  // Só considera jogos que já têm placar definido (já aconteceram) — um
  // jogo agendado no futuro (ainda sem placar) não deve virar "último
  // resultado" no hero.
  const jogosComData = jogosOrdenados(temp).filter((j) => j.date && j.placarA !== null && j.placarA !== undefined);
  const ultimo = jogosComData.length ? jogosComData[jogosComData.length - 1] : null;
  if (!ultimo) {
    if (heroSection) heroSection.style.display = "none";
    return;
  }
  if (heroSection) {
    heroSection.style.display = "";
    document.getElementById("heroScoreboard").innerHTML = scoreboardHtml(temp, ultimo, true);
  }
}

function scoreboardHtml(temp, jogo, destaque) {
  // A versão "destaque" (hero da tela inicial) usa o painel de confronto
  // estilo UFC — cara a cara, capitão de cada time em cantos opostos.
  if (destaque) return heroConfrontoUfcHtml(temp, jogo);

  const semPlacar = jogo.placarA === null || jogo.placarA === undefined;
  return `
    <div class="bl-scoreboard">
      <div class="bl-scoreboard-date">${formatDateLong(jogo.date)}${jogo.time ? " · " + escapeHtml(jogo.time) : ""}</div>
      <div class="bl-scoreboard-main">
        <div class="bl-scoreboard-team">
          ${crestHtml(temp, TIME_A, 30)}
          <span class="bl-scoreboard-teamname">${escapeHtml(temp.timeA.nome)}</span>
        </div>
        <div class="bl-scoreboard-score">
          <span class="bl-led">${semPlacar ? "–" : jogo.placarA}</span>
          <span class="bl-led-x">×</span>
          <span class="bl-led">${semPlacar ? "–" : jogo.placarB}</span>
        </div>
        <div class="bl-scoreboard-team">
          ${crestHtml(temp, TIME_B, 30)}
          <span class="bl-scoreboard-teamname">${escapeHtml(temp.timeB.nome)}</span>
        </div>
      </div>
      ${jogo.craque ? `<div class="bl-scoreboard-craque">${starIcon(13, true)} CRAQUE: ${escapeHtml(jogo.craque)}</div>` : ""}
    </div>
  `;
}

// ============================================================
// HERO — painel de confronto estilo transmissão cinematográfica
// Com zoom infinito, fade na entrada, glow no lado do vencedor 
// e bolinhas (🟢🔴🟢) de forma recente dos últimos jogos.
// ============================================================
function heroConfrontoUfcHtml(temp, jogo) {
  const semPlacar = jogo.placarA === null || jogo.placarA === undefined;
  const corA = (temp.timeA && temp.timeA.cor) || "#F2EFE6";
  const corB = (temp.timeB && temp.timeB.cor) || "#1a1a1a";
  const capA = typeof capitaoDoTime === "function" ? capitaoDoTime(temp, TIME_A) : null;
  const capB = typeof capitaoDoTime === "function" ? capitaoDoTime(temp, TIME_B) : null;
  const fotoA = capA && capA.foto ? capA.foto : "";
  const fotoB = capB && capB.foto ? capB.foto : "";

  // 1. Descobre quem foi o vencedor para aplicar o Glow/Apagar no CSS
  let classeVencedor = "";
  if (!semPlacar) {
    if (jogo.placarA > jogo.placarB) classeVencedor = "vencedor-a";
    else if (jogo.placarB > jogo.placarA) classeVencedor = "vencedor-b";
  }

  // 2. Calcula a forma recente (últimos 5 jogos) de um time específico
  const gerarForma = (timeAlvo) => {
    // Pega todos os jogos que já acabaram (têm placar)
    const jogosConcluidos = jogosOrdenados(temp).filter(j => j.placarA !== null && j.placarA !== undefined);
    
    // Pega só os últimos 5
    const ultimos5 = jogosConcluidos.slice(-5);
    
    // Gera as bolinhas baseado nos resultados
    const bolinhas = ultimos5.map(j => {
      let cssClass = "bl-bolinha-e"; // Empate
      if (timeAlvo === TIME_A) {
        if (j.placarA > j.placarB) cssClass = "bl-bolinha-v";
        else if (j.placarA < j.placarB) cssClass = "bl-bolinha-d";
      } else {
        if (j.placarB > j.placarA) cssClass = "bl-bolinha-v";
        else if (j.placarB < j.placarA) cssClass = "bl-bolinha-d";
      }
      return `<div class="bl-bolinha-forma ${cssClass}"></div>`;
    }).join('');
    
    return `<div class="bl-forma-recente">${bolinhas}</div>`;
  };

  const fighterHtml = (cap, time, side, timeValue) => `
    <div class="bl-ufc-fighter bl-ufc-fighter-${side}">
      <div class="bl-ufc-fighter-info">
        <span class="bl-ufc-fighter-tag">${cap ? "Capitão" : "Time"}</span>
        <span class="bl-ufc-fighter-nome">${escapeHtml(cap ? cap.nome : (time && time.nome ? time.nome : ""))}</span>
        ${gerarForma(timeValue)}
      </div>
    </div>
  `;

  // Retorna o HTML aplicando o Fade (bl-ufc-score-wrapper) e a lógica de vitória
  return `
    <div class="bl-ufc-hero ${classeVencedor}" style="--corA:${corA}; --corB:${corB};">
      
      <!-- NOVA ESTRUTURA DE FOTOS COM TAG <img> PARA O DROP-SHADOW FUNCIONAR -->
      ${fotoA ? `
        <div class="bl-ufc-photobg-container bl-ufc-photobg-a-container" style="--team-color: var(--corA);">
          <img src="${escapeHtml(fotoA)}" class="bl-ufc-photobg bl-ufc-photobg-a" alt="Capitão A">
        </div>
      ` : ""}
      
      ${fotoB ? `
        <div class="bl-ufc-photobg-container bl-ufc-photobg-b-container" style="--team-color: var(--corB);">
          <img src="${escapeHtml(fotoB)}" class="bl-ufc-photobg bl-ufc-photobg-b" alt="Capitão B">
        </div>
      ` : ""}

      <!-- AMBIENTAÇÃO DE LUZ DE FUNDO -->
      <div class="bl-ufc-wash bl-ufc-wash-a"></div>
      <div class="bl-ufc-wash bl-ufc-wash-b"></div>
      <div class="bl-ufc-vinheta"></div>

      <div class="bl-ufc-topline">${formatDateLong(jogo.date)}${jogo.time ? " · " + escapeHtml(jogo.time) : ""}</div>

      <div class="bl-ufc-center bl-ufc-score-wrapper">
        <!-- Time A: Sem bolinha e com a cor do time injetada no texto -->
        <div class="bl-ufc-teamname bl-ufc-teamname-a" style="color: var(--corA); text-shadow: 0 2px 8px rgba(0,0,0,0.9);">
          <span>${escapeHtml(temp.timeA.nome)}</span>
        </div>
        
        <div class="bl-ufc-score">
          <span class="bl-led bl-ufc-led">${semPlacar ? "–" : jogo.placarA}</span>
          <span class="bl-ufc-vs">VS</span>
          <span class="bl-led bl-ufc-led">${semPlacar ? "–" : jogo.placarB}</span>
        </div>
        
        <div class="bl-ufc-teamname bl-ufc-teamname-b" style="color: var(--corB); text-shadow: 0 2px 8px rgba(0,0,0,0.9);">
          <span>${escapeHtml(temp.timeB.nome)}</span>
        </div>
      </div>

      ${jogo.craque ? `<div class="bl-scoreboard-craque">${starIcon(13, true)} CRAQUE: ${escapeHtml(jogo.craque)}</div>` : ""}

      ${fighterHtml(capA, temp.timeA, "a", TIME_A)}
      ${fighterHtml(capB, temp.timeB, "b", TIME_B)}
    </div>
  `;
}

function renderConfrontoBar() {
  const temp = temporadaVisualizada();
  const confrontoBarEl = document.getElementById("confrontoBar");
  if (!confrontoBarEl) return;

  // Se a temporada for arquivada, o controle é do Hall of Fame, então esconde aqui
  const ehArquivada = temp && temp.arquivadaEm !== null && temp.arquivadaEm !== undefined && temp.arquivadaEm !== "";
  if (ehArquivada) {
    confrontoBarEl.style.display = "none";
    confrontoBarEl.innerHTML = "";
    return;
  }

  // Garante que a barra apareça e injeta o bloco premium centralizado
  confrontoBarEl.style.display = "block";
  confrontoBarEl.innerHTML = typeof renderBlocoEstatisticas === "function" ? renderBlocoEstatisticas(temp) : "";
  if (typeof animarContadoresEm === "function") animarContadoresEm(confrontoBarEl);
}