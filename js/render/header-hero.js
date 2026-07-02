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

  const jogosComData = jogosOrdenados(temp).filter((j) => j.date);
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
}