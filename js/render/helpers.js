// ============================================================
// BESTS LEAGUE — helpers de renderização
// (formatação de texto/data, ícones, escudos, estrelas)
// Usado por todos os outros arquivos de render/ e modals/
// ============================================================

let currentTab = "inicio";
let perfilJogadorAberto = null; // nome do jogador cujo perfil está sendo visto

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDateBR(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatDateLong(iso) {
  if (!iso) return "Data a definir";
  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const [y, m, d] = iso.split("-");
  return `${parseInt(d)} ${meses[parseInt(m) - 1]} ${y}`;
}

function timeClasse(time) {
  if (time === TIME_A) return "timeA";
  if (time === TIME_B) return "timeB";
  return "avulso";
}

// ============================================================
// ANIMAÇÃO — contador numérico (estatísticas, pódio) sobe de 0 até o
// valor final, respeitando prefers-reduced-motion.
// ============================================================
function animarNumero(elemento, valorFinal, duracaoMs) {
  if (!elemento) return;
  const reduzMovimento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const destino = parseFloat(valorFinal);
  if (isNaN(destino)) { elemento.textContent = "0"; return; } // nunca mostra "NaN" literal
  if (reduzMovimento) { elemento.textContent = valorFinal; return; }

  duracaoMs = duracaoMs || 900;
  const ehDecimal = String(valorFinal).includes(".");
  const inicio = performance.now();

  function passo(agora) {
    const progresso = Math.min((agora - inicio) / duracaoMs, 1);
    const facilitado = 1 - Math.pow(1 - progresso, 3); // ease-out cúbico
    const atual = destino * facilitado;
    elemento.textContent = ehDecimal ? atual.toFixed(1) : Math.round(atual);
    if (progresso < 1) requestAnimationFrame(passo);
    else elemento.textContent = valorFinal;
  }
  requestAnimationFrame(passo);
}

// Procura todo elemento com [data-count-final] dentro do container e
// anima cada um a partir de 0 — usar logo após inserir um innerHTML novo.
function animarContadoresEm(container) {
  if (!container) return;
  container.querySelectorAll("[data-count-final]").forEach((el) => {
    animarNumero(el, el.getAttribute("data-count-final"));
  });
}

function crestHtml(temp, time, size) {
  size = size || 28;
  let cor, borda;
  if (time === TIME_A) { cor = temp.timeA.cor; borda = "1.5px solid #cfcabc"; }
  else if (time === TIME_B) { cor = temp.timeB.cor; borda = "1.5px solid #4a4a4a"; }
  else { cor = "#5B7DFF"; borda = "1.5px solid #16299e"; }
  return `<span class="bl-crest" style="width:${size}px;height:${size}px;background:${cor};border:${borda};"></span>`;
}

// ============================================================
// CAPITÃES — descoberta do capitão de um time + avatar (foto ou inicial)
// ============================================================

// Retorna o jogador marcado como capitão de um time. Se ninguém foi
// marcado explicitamente ainda, cai de volta pro artilheiro do time
// (depois maior overall, depois ordem alfabética) — assim o hero e os
// cards nunca ficam vazios antes do admin escolher um capitão de fato.
function capitaoDoTime(temp, time) {
  const jogadores = (temp && temp.jogadores ? temp.jogadores : []).filter((j) => j.time === time);
  if (jogadores.length === 0) return null;
  const marcado = jogadores.find((j) => j.capitao === true);
  if (marcado) return marcado;

  const golsPorNome = {};
  if (typeof calcularArtilharia === "function") {
    calcularArtilharia(temp).forEach((a) => { golsPorNome[a.jogador] = a.gols; });
  }
  return [...jogadores].sort((a, b) => {
    const golsA = golsPorNome[a.nome] || 0;
    const golsB = golsPorNome[b.nome] || 0;
    return golsB - golsA || (b.overall || 0) - (a.overall || 0) || a.nome.localeCompare(b.nome);
  })[0];
}

// Avatar redondo de um jogador: mostra a foto cadastrada (se houver) com
// fallback automático pra inicial do nome — cobre link quebrado também.
function avatarHtml(jogador, size, corAnel, extraClass) {
  size = size || 64;
  const nome = jogador && jogador.nome ? jogador.nome : "";
  const inicial = nome.trim().charAt(0).toUpperCase() || "?";
  const foto = jogador && jogador.foto ? jogador.foto : "";
  const fontSize = Math.round(size * 0.4);
  return `
    <div class="bl-avatar ${extraClass || ''}" style="width:${size}px;height:${size}px;border-color:${corAnel};background:${corAnel}26;color:${corAnel};font-size:${fontSize}px;">
      <span class="bl-avatar-inicial">${escapeHtml(inicial)}</span>
      ${foto ? `<img class="bl-avatar-img" src="${escapeHtml(foto)}" alt="${escapeHtml(nome)}" onerror="this.remove();" />` : ""}
    </div>
  `;
}

function starIcon(size, filled) {
  size = size || 13;
  const fill = filled ? "currentColor" : "none";
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="0"><polygon points="12 2 15 9 22 9 16 14 18 21 12 17 6 21 8 14 2 9 9 9"/></svg>`;
}

function starsHtml(overall, size) {
  size = size || 14;
  let html = '<span class="bl-stars">';
  for (let i = 1; i <= 5; i++) {
    html += `<svg class="${i <= overall ? "filled" : ""}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${i <= overall ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15 9 22 9 16 14 18 21 12 17 6 21 8 14 2 9 9 9"/></svg>`;
  }
  html += '</span>';
  return html;
}

function starsInputHtml(overall, inputId) {
  let html = `<span class="bl-stars-input" id="${inputId}" data-value="${overall}">`;
  for (let i = 1; i <= 5; i++) {
    html += `<svg data-star="${i}" class="${i <= overall ? "filled" : ""}" width="22" height="22" viewBox="0 0 24 24" fill="${i <= overall ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.5" style="color:${i <= overall ? "var(--bl-gold)" : "var(--bl-line-strong)"}"><polygon points="12 2 15 9 22 9 16 14 18 21 12 17 6 21 8 14 2 9 9 9"/></svg>`;
  }
  html += '</span>';
  return html;
}

function emptyStateHtml(svgPath, title, subtitle) {
  return `
    <div class="bl-empty">
      ${svgPath}
      <p class="bl-empty-title">${escapeHtml(title)}</p>
      <p class="bl-empty-subtitle">${escapeHtml(subtitle)}</p>
    </div>
  `;
}

const ICONS = {
  goal: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  calendar: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  star: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15 9 22 9 16 14 18 21 12 17 6 21 8 14 2 9 9 9"/></svg>`,
  cards: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>`,
  users: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
};
