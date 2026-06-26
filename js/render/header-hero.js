// ============================================================
// BESTS LEAGUE — cabeçalho de temporada, hero/placar e barra de confronto
// ============================================================

// ---------- HEADER: seletor de temporada ----------

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

// ---------- HERO ----------

function renderHero() {
  const temp = temporadaVisualizada();
  const jogosComData = jogosOrdenados(temp).filter((j) => j.date);
  const ultimo = jogosComData.length ? jogosComData[jogosComData.length - 1] : null;
  const heroSection = document.getElementById("heroSection");
  if (!ultimo) {
    heroSection.style.display = "none";
    return;
  }
  heroSection.style.display = "";
  document.getElementById("heroScoreboard").innerHTML = scoreboardHtml(temp, ultimo, true);
}

function scoreboardHtml(temp, jogo, destaque) {
  const semPlacar = jogo.placarA === null || jogo.placarA === undefined;
  const sexta = ehSextaFeira(jogo.date);
  return `
    <div class="bl-scoreboard ${destaque ? "bl-scoreboard-hero" : ""}">
      <div class="bl-scoreboard-date">${formatDateLong(jogo.date)}${sexta === false ? " · fora da sexta de costume" : ""} · ${escapeHtml(jogo.time || "")}</div>
      <div class="bl-scoreboard-main">
        <div class="bl-scoreboard-team">
          ${crestHtml(temp, TIME_A, destaque ? 44 : 30)}
          <span class="bl-scoreboard-teamname">${escapeHtml(temp.timeA.nome)}</span>
        </div>
        <div class="bl-scoreboard-score">
          <span class="bl-led">${semPlacar ? "–" : jogo.placarA}</span>
          <span class="bl-led-x">×</span>
          <span class="bl-led">${semPlacar ? "–" : jogo.placarB}</span>
        </div>
        <div class="bl-scoreboard-team">
          ${crestHtml(temp, TIME_B, destaque ? 44 : 30)}
          <span class="bl-scoreboard-teamname">${escapeHtml(temp.timeB.nome)}</span>
        </div>
      </div>
      ${jogo.craque ? `<div class="bl-scoreboard-craque">${starIcon(13, true)} CRAQUE: ${escapeHtml(jogo.craque)}</div>` : ""}
    </div>
  `;
}

// ---------- BARRA DE CONFRONTO ----------

function renderConfrontoBar() {
  const temp = temporadaVisualizada();
  const c = calcularConfronto(temp);
  document.getElementById("confrontoBar").innerHTML = `
    <div class="bl-confronto-row">
      <div class="bl-confronto-item">
        <span class="bl-confronto-num" style="color:var(--bl-timeA)">${c.vitoriasA}</span>
        <span class="bl-confronto-lbl">vitórias ${escapeHtml(temp.timeA.nome.toLowerCase())}</span>
      </div>
      <div class="bl-confronto-item">
        <span class="bl-confronto-num">${c.empates}</span>
        <span class="bl-confronto-lbl">empates</span>
      </div>
      <div class="bl-confronto-item">
        <span class="bl-confronto-num" style="color:#cfcfcf">${c.vitoriasB}</span>
        <span class="bl-confronto-lbl">vitórias ${escapeHtml(temp.timeB.nome.toLowerCase())}</span>
      </div>
    </div>
    <div class="bl-confronto-divider-h"></div>
    <div class="bl-confronto-row">
      <div class="bl-confronto-item">
        <span class="bl-confronto-num">${c.jogosValidos}</span>
        <span class="bl-confronto-lbl">jogos disputados</span>
      </div>
      <div class="bl-confronto-item">
        <span class="bl-confronto-num">${c.totalGols}</span>
        <span class="bl-confronto-lbl">gols na temporada</span>
      </div>
      <div class="bl-confronto-item">
        <span class="bl-confronto-num">${c.mediaGolsPorJogo.toFixed(1)}</span>
        <span class="bl-confronto-lbl">média de gols/jogo</span>
      </div>
    </div>
  `;
}
