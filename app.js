let databaseTrouble = [];
let currentStage = "ALL";

document.addEventListener("DOMContentLoaded", async () => {
  const userCountEl = document.getElementById("user-count");
  if (userCountEl) userCountEl.textContent = "Comunidad Maker";

  await loadDatabase();
  setupEventListeners();
});

async function loadDatabase() {
  try {
    const res = await fetch("troubleshooting.json");
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    databaseTrouble = await res.json();
    renderCards(databaseTrouble);
  } catch (error) {
    console.error("Error al cargar la base de datos de diagnósticos:", error);
    const container = document.getElementById("troubleshoot-cards");
    if (container) {
      container.innerHTML = `<div class="p-8 text-center text-red-400 text-sm">Error al cargar troubleshooting.json.</div>`;
    }
  }
}

function renderCards(data) {
  const container = document.getElementById("troubleshoot-cards");
  if (!container) return;
  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = `<div class="p-8 text-center text-slate-500 text-sm">No se encontraron diagnósticos que coincidan con la búsqueda.</div>`;
    return;
  }

  data.forEach((item) => {
    const pregunta = (item.preguntas_descarte && item.preguntas_descarte.length > 0) 
      ? item.preguntas_descarte[0] 
      : "Sin pregunta de descarte registrada.";

    const slicerList = (item.solucion_rapida_slicer || [])
      .map(s => `<li>${s}</li>`)
      .join("");

    const mecanicaList = (item.solucion_mecanica || [])
      .map(s => `<li>${s}</li>`)
      .join("");

    const card = document.createElement("div");
    card.className = "bg-slate-800 border border-slate-700/80 rounded-xl p-4 transition hover:border-slate-600";
    card.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] font-mono uppercase bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full border border-brand-500/30">
          ${item.etapa || 'GENERAL'}
        </span>
        <span class="text-xs text-slate-500">ID: ${item.id || 'N/A'}</span>
      </div>
      <h3 class="font-bold text-slate-100 text-base mb-1">${item.titulo || 'Sin título'}</h3>
      <p class="text-xs text-slate-300 mb-3">${item.sintomas || ''}</p>
      
      <div class="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50 space-y-2 text-xs mb-3">
        <p class="text-slate-400 font-semibold">❓ Pregunta de descarte:</p>
        <p class="text-slate-300 italic">"${pregunta}"</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        <div class="bg-slate-900/40 p-2 rounded border border-slate-700/40">
          <span class="text-lab-400 font-semibold block mb-1">🎛️ Solución Slicer:</span>
          <ul class="list-disc list-inside text-slate-300 space-y-1">
            ${slicerList}
          </ul>
        </div>
        <div class="bg-slate-900/40 p-2 rounded border border-slate-700/40">
          <span class="text-brand-400 font-semibold block mb-1">🔧 Solución Mecánica:</span>
          <ul class="list-disc list-inside text-slate-300 space-y-1">
            ${mecanicaList}
          </ul>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function setupEventListeners() {
  const searchInput = document.getElementById("input-search");
  if (searchInput) {
    searchInput.addEventListener("input", () => filterData());
  }

  const stageButtons = document.querySelectorAll(".stage-btn");
  stageButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      stageButtons.forEach((b) => {
        b.classList.remove("active", "bg-brand-500", "text-white");
        b.classList.add("bg-slate-800", "text-slate-400");
      });
      btn.classList.add("active", "bg-brand-500", "text-white");
      btn.classList.remove("bg-slate-800", "text-slate-400");

      currentStage = btn.dataset.stage;
      filterData();
    });
  });
}

function filterData() {
  const searchInput = document.getElementById("input-search");
  const query = searchInput ? searchInput.value.toLowerCase() : "";
  
  const filtered = databaseTrouble.filter((item) => {
    const matchStage = currentStage === "ALL" || item.etapa === currentStage;
    const matchText = (item.titulo || "").toLowerCase().includes(query) ||
                      (item.sintomas || "").toLowerCase().includes(query) ||
                      (item.busquedas_coloquiales || []).some(b => b.toLowerCase().includes(query));
    return matchStage && matchText;
  });

  renderCards(filtered);
}
