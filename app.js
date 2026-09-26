// Configuración Supabase
const SUPABASE_URL = "https://TU_PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "TU_ANON_KEY";
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let databaseTrouble = [];
let currentStage = "ALL";

document.addEventListener("DOMContentLoaded", async () => {
  await loadDatabase();
  setupEventListeners();
  initSupabase();
});

async function loadDatabase() {
  try {
    const res = await fetch("troubleshooting.json");
    databaseTrouble = await res.json();
    renderCards(databaseTrouble);
  } catch (error) {
    console.error("Error al cargar la base de datos de diagnósticos:", error);
  }
}

function renderCards(data) {
  const container = document.getElementById("troubleshoot-cards");
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = `<div class="p-8 text-center text-slate-500 text-sm">No se encontraron diagnósticos que coincidan con la búsqueda.</div>`;
    return;
  }

  data.forEach((item) => {
    const card = document.createElement("div");
    card.className = "bg-slate-800 border border-slate-700/80 rounded-xl p-4 transition hover:border-slate-600";
    card.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] font-mono uppercase bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full border border-brand-500/30">
          ${item.etapa}
        </span>
        <span class="text-xs text-slate-500">ID: ${item.id}</span>
      </div>
      <h3 class="font-bold text-slate-100 text-base mb-1">${item.titulo}</h3>
      <p class="text-xs text-slate-300 mb-3">${item.sintomas}</p>
      
      <div class="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50 space-y-2 text-xs mb-3">
        <p class="text-slate-400 font-semibold">❓ Pregunta de descarte:</p>
        <p class="text-slate-300 italic">"${item.preguntas_descarte[0]}"</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        <div class="bg-slate-900/40 p-2 rounded border border-slate-700/40">
          <span class="text-lab-400 font-semibold block mb-1">🎛️ Solución Slicer:</span>
          <ul class="list-disc list-inside text-slate-300 space-y-1">
            ${item.solucion_rapida_slicer.map(s => `<li>${s}</li>`).join("")}
          </ul>
        </div>
        <div class="bg-slate-900/40 p-2 rounded border border-slate-700/40">
          <span class="text-brand-400 font-semibold block mb-1">🔧 Solución Mecánica:</span>
          <ul class="list-disc list-inside text-slate-300 space-y-1">
            ${item.solucion_mecanica.map(s => `<li>${s}</li>`).join("")}
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
  const query = document.getElementById("input-search").value.toLowerCase();
  
  const filtered = databaseTrouble.filter((item) => {
    const matchStage = currentStage === "ALL" || item.etapa === currentStage;
    const matchText = item.titulo.toLowerCase().includes(query) ||
                      item.sintomas.toLowerCase().includes(query) ||
                      item.busquedas_coloquiales.some(b => b.toLowerCase().includes(query));
    return matchStage && matchText;
  });

  renderCards(filtered);
}

async function initSupabase() {
  const userCountEl = document.getElementById("user-count");
  if (!supabase || SUPABASE_URL.includes("TU_PROYECTO")) {
    if (userCountEl) userCountEl.textContent = "Comunidad Maker";
    return;
  }

  const { count, error } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  if (!error && count !== null) {
    if (userCountEl) userCountEl.textContent = `+${count} Makers`;
  } else {
    if (userCountEl) userCountEl.textContent = "Comunidad Maker";
  }

  const btnLogin = document.getElementById("btn-login");
  if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
      await supabase.auth.signInWithOAuth({ provider: "google" });
    });
  }
}