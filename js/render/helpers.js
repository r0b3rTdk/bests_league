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

function crestHtml(temp, time, size) {
  size = size || 28;
  let cor, borda;
  if (time === TIME_A) { cor = temp.timeA.cor; borda = "1.5px solid #cfcabc"; }
  else if (time === TIME_B) { cor = temp.timeB.cor; borda = "1.5px solid #4a4a4a"; }
  else { cor = "#5B7DFF"; borda = "1.5px solid #16299e"; }
  return `<span class="bl-crest" style="width:${size}px;height:${size}px;background:${cor};border:${borda};"></span>`;
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
