// URL de la aplicación web de Google Apps Script
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwcV-90MJF41JDmIy7OKUyO8kQbwg8dk-5P7HhOuA1xUqkBrrgmNlqJOWVu4cesCzkKAw/exec";

let databaseTrouble = [];
let currentStage = "ALL";

// Base de datos de promociones / Sponsors
const SPONSORS_DB = [
  {
    badge: "VENTA DE EQUIPOS 3D",
    text: "🛈 ¿Buscás tu próxima impresora 3D? Equipos FDM y Resina con garantía y soporte local en Salta.",
    link: "https://wa.me/5493870000000?text=Hola!%20Quiero%20consultar%20por%20impresoras%203D%20disponibles"
  },
  {
    badge: "OFERTA INSUMOS",
    text: "🧵 Filamentos PLA, ABS y resinas seleccionadas. Stock inmediato con entrega local.",
    link: "https://wa.me/5493870000000?text=Hola!%20Busco%20presupuesto%20de%20filamentos%20e%20insumos"
  },
  {
    badge: "SERVICIO TÉCNICO",
    text: "🔧 ¿Tu impresora necesita mantenimiento o calibración? Diagnosticamos e instalamos repuestos.",
    link: "https://wa.me/5493870000000?text=Hola!%20Necesito%20servicio%20técnico%20para%20mi%20impresora%203D"
  },
  {
    badge: "DESARROLLO A PEDIDO",
    text: "🚀 Mi Fábrica de Ideas: Impresión 3D industrial, prototipado y piezas a medida.",
    link: "https://wa.me/5493870000000?text=Hola!%20Quiero%20presupuestar%20un%20trabajo%20de%20impresión%203D"
  }
];

let currentSponsorIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  initSponsorRotator();
  loadDatabase();
  setupEventListeners();
  calcularCostoImpresion(); // Inicializa el costo de la calculadora al cargar
});

function initSponsorRotator() {
  const badgeEl = document.getElementById("sponsor-badge");
  const textEl = document.getElementById("sponsor-text");
  const linkEl = document.getElementById("sponsor-link");

  const targetBadge = badgeEl || document.querySelector("a span");
  const targetText = textEl || document.querySelector("a p");
  const targetLink = linkEl || document.querySelector("a");

  if (!targetText) return;

  function updateBanner(index) {
    const item = SPONSORS_DB[index];
    targetText.style.opacity = "0";
    
    setTimeout(() => {
      if (targetBadge) targetBadge.textContent = item.badge;
      targetText.textContent = item.text;
      if (targetLink) targetLink.href = item.link;
      targetText.style.opacity = "1";
    }, 200);
  }

  currentSponsorIndex = Math.floor(Math.random() * SPONSORS_DB.length);
  updateBanner(currentSponsorIndex);

  setInterval(() => {
    currentSponsorIndex = (currentSponsorIndex + 1) % SPONSORS_DB.length;
    updateBanner(currentSponsorIndex);
  }, 7000);
}

async function loadDatabase() {
  try {
    const res = await fetch("troubleshooting.json");
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    databaseTrouble = await res.json();
    renderCards(databaseTrouble);
  } catch (error) {
    console.error("Error al cargar troubleshooting.json:", error);
    const container = document.getElementById("troubleshoot-cards");
    if (container) {
      container.innerHTML = `<div class="p-8 text-center text-red-400 text-sm">Error al cargar la base de datos de diagnósticos.</div>`;
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
    card.className = "bg-zinc-900/85 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 rounded-xl p-4 transition shadow-[0_0_10px_rgba(0,0,0,0.3)] space-y-3";
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-mono uppercase bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full border border-brand-500/30">
          ${item.etapa || 'GENERAL'}
        </span>
        <span class="text-xs text-slate-500">ID: ${item.id || 'N/A'}</span>
      </div>
      <h3 class="font-bold text-slate-100 text-base">${item.titulo || 'Sin título'}</h3>
      <p class="text-xs text-slate-300">${item.sintomas || ''}</p>
      
      <div class="bg-black/50 p-3 rounded-lg border border-slate-700/50 space-y-1 text-xs">
        <p class="text-slate-400 font-semibold">❓ Pregunta de descarte:</p>
        <p class="text-slate-300 italic">"${pregunta}"</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
        <div class="bg-black/40 p-2.5 rounded border border-cyan-500/20">
          <span class="text-lab-400 font-semibold block mb-1">🎛️ Solución Slicer:</span>
          <ul class="list-disc list-inside text-slate-300 space-y-1">
            ${slicerList}
          </ul>
        </div>
        <div class="bg-black/40 p-2.5 rounded border border-purple-500/20">
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
  const searchBtn = document.getElementById("btn-search");

  if (searchInput) {
    searchInput.addEventListener("input", () => filterData());
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") filterData();
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", () => filterData());
  }

  const stageButtons = document.querySelectorAll(".stage-btn");
  stageButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      stageButtons.forEach((b) => {
        b.classList.remove("active", "bg-brand-500", "text-white");
        b.classList.add("bg-zinc-900/85", "text-slate-400");
      });
      btn.classList.add("active", "bg-brand-500", "text-white");
      btn.classList.remove("bg-zinc-900/85", "text-slate-400");

      currentStage = btn.dataset.stage || btn.textContent.trim();
      filterData();
    });
  });
}

function filterData() {
  const searchInput = document.getElementById("input-search");
  const rawQuery = searchInput ? searchInput.value.toLowerCase().trim() : "";
  
  const clean = (text) => (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const query = clean(rawQuery);
  const stage = clean(currentStage);

  const filtered = databaseTrouble.filter((item) => {
    const itemEtapa = clean(item.etapa);
    const itemTitulo = clean(item.titulo);
    const itemSintomas = clean(item.sintomas);

    let matchStage = false;

    if (stage === "all" || stage.includes("todas")) {
      matchStage = true;
    } else if (stage.includes("1") || stage.includes("capa") || stage.includes("adherencia")) {
      matchStage = itemEtapa.includes("1") || itemEtapa.includes("capa") || itemEtapa.includes("adherencia");
    } else if (stage.includes("2") || stage.includes("extru") || stage.includes("flujo")) {
      matchStage = itemEtapa.includes("2") || itemEtapa.includes("extru") || itemEtapa.includes("flujo");
    } else if (stage.includes("3") || stage.includes("termica") || stage.includes("humedad")) {
      matchStage = itemEtapa.includes("3") || itemEtapa.includes("termica") || itemEtapa.includes("humedad");
    } else if (stage.includes("4") || stage.includes("mecanica") || stage.includes("mecanic")) {
      matchStage = itemEtapa.includes("4") || 
                   itemEtapa.includes("mecanica") || 
                   itemEtapa.includes("mecanic") || 
                   itemTitulo.includes("mecanic") || 
                   itemSintomas.includes("mecanic") ||
                   itemSintomas.includes("eje") ||
                   itemSintomas.includes("correa") ||
                   itemSintomas.includes("motor");
    } else if (stage.includes("5") || stage.includes("slicer") || stage.includes
              
