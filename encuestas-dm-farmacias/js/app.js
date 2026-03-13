/* app.js - encuestas-dm-farmacias
   - 1 pregunta por pantalla + barra de progreso
   - Ranking drag&drop (reutilizable)
*/

// Helpers
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const provinces = [
  "Buenos Aires","Catamarca","Chaco","Chubut","Córdoba","Corrientes","Entre Ríos","Formosa","Jujuy","La Pampa",
  "La Rioja","Mendoza","Misiones","Neuquén","Río Negro","Salta","San Juan","San Luis","Santa Cruz","Santa Fe",
  "Santiago del Estero","Tierra del Fuego","Tucumán","CABA"
];

const questions = [
  {
    id: "q1_tipo_farmacia",
    type: "single",
    required: true,
    title: "1- Tipo de Farmacia",
    help: "Seleccione una opción",
    options: [
      "Independiente (1 sucursal)",
      "Independiente (2–3 sucursales)",
      "Cadena regional (4–15 sucursales)",
      "Cadena nacional",
      "Mutual / cooperativa",
      "Hospitalaria",
      "Otro"
    ]
  },
  {
    id: "q2_provincia",
    type: "select",
    required: true,
    title: "2- Ubicación geográfica (Provincia)",
    help: "Seleccione una opción",
    options: provinces
  },
  {
    id: "q2_ciudad",
    type: "datalist_city",
    required: true,
    title: "Ciudad",
    help: "Escriba y seleccione su ciudad/localidad"
  },
  {
    id: "q3_empleados",
    type: "single",
    required: true,
    title: "3- Cantidad de empleados",
    help: "Seleccione la opción correcta",
    options: ["1-3","4-6","7-10","Más de 10"]
  },
  {
    id: "q4_facturacion",
    type: "single",
    required: true,
    title: "4- Facturación mensual aproximada",
    help: "Seleccione la opción correcta",
    options: ["Menos de $30M","$30M-$80M","$80M-$150M","Más de $150M","Prefiero no responder"]
  },
  {
    id: "q5_cuantas_droguerias",
    type: "single",
    required: true,
    title: "5- ¿Cuántas droguerías utiliza actualmente?",
    help: "Seleccione la opción correcta",
    options: ["1","2","3","Más de 3"]
  },
  {
    id: "q6_principal_60",
    type: "single",
    required: true,
    title: "6- ¿Tiene una droguería principal (>60% de compra)?",
    help: "Seleccione la opción correcta",
    options: ["Sí","No"]
  },
  {
    id: "q7_pct_obras_sociales",
    type: "single",
    required: true,
    title: "7- ¿Qué porcentaje de sus compras están vinculadas a obras sociales?",
    help: "Seleccione la opción correcta",
    options: ["Menos de 30%","30-50%","50-70%","Más de 70%"]
  },
  {
    id: "q8_pct_pami",
    type: "single",
    required: true,
    title: "8- ¿Qué porcentaje de su facturación corresponde a PAMI?",
    help: "Seleccione la opción correcta",
    options: ["Menos de 20%","20-40%","40-60%","Más de 60%"]
  },
  {
    id: "q9_plazo_cobro",
    type: "single",
    required: true,
    title: "9- Plazo promedio de cobro de obras sociales",
    help: "Seleccione la opción correcta",
    options: ["0-30 días","31-60 días","61-90 días","Más de 90 días"]
  },
  {
    id: "q10_presion_flujo",
    type: "single",
    required: true,
    title: "10- Nivel de presión sobre su flujo de caja",
    help: "Seleccione la opción correcta",
    options: ["Muy bajo","Bajo","Medio","Alto","Muy alto"]
  },
  {
    id: "q11_dificultad_financiera",
    type: "multi",
    required: true,
    title: "11- ¿Cuál es su mayor dificultad financiera actual?",
    help: "Seleccione las opciones que correspondan",
    options: [
      "Desfase pago/cobro",
      "Margen insuficiente",
      "Tasa financiera",
      "Bajo volumen",
      "Ninguna relevante"
    ]
  },
  {
    id: "q12_ranking_criterios",
    type: "rank",
    required: true,
    title: "12- Principal criterio para elegir droguería",
    help: "Arrastre las opciones al ranking (derecha) y ordénelas del más importante al menos importante.",
    items: [
      "Precio / descuento",
      "Plazo de financiación",
      "Bonificaciones",
      "Disponibilidad",
      "Frecuencia y rapidez de entrega",
      "Relación personal",
      "Plataforma digital"
    ]
  },
  {
    id: "q13_cambio_por_desc",
    type: "single",
    required: true,
    title: "13- Si le ofrecen 1–2 puntos más de descuento, ¿cambiaría de droguería?",
    help: "Seleccione la opción correcta",
    options: [
      "Sí, cambiaría inmediatamente",
      "Sí, evaluaría seriamente",
      "Solo si mejora también la financiación",
      "Solo si mantiene condiciones actuales",
      "No cambiaría",
      "Depende del proveedor actual"
    ]
  },
  {
    id: "q14_frec_comp_precios",
    type: "single",
    required: true,
    title: "14- Frecuencia de comparación de precios",
    help: "Seleccione la opción correcta",
    options: [
      "Diariamente",
      "Varias veces por semana",
      "Semanalmente",
      "Mensualmente",
      "Solo ante aumentos importantes",
      "Nunca comparo activamente"
    ]
  },
  {
    id: "q15_dispuesto_mejora",
    type: "single",
    required: true,
    title: "15- Ante una mejora económica concreta en productos clave, usted estaría dispuesto a:",
    help: "Seleccione la opción correcta",
    options: [
      "No modificar mis compras actuales",
      "Probar con un volumen mínimo",
      "Derivar algunas líneas específicas",
      "Transferir una parte significativa",
      "Trabajar activamente con ambos proveedores"
    ]
  },
  {
    id: "q16_quien_decide",
    type: "single",
    required: true,
    title: "16- ¿Quién decide el proveedor principal?",
    help: "Seleccione la opción correcta",
    options: [
      "Dueño / titular",
      "Socio gerente",
      "Administrador",
      "Encargado de compras",
      "Casa central (en caso de cadena)",
      "Otro"
    ]
  },
  {
    id: "q17_quien_pide",
    type: "single",
    required: true,
    title: "17- ¿Quién realiza los pedidos?",
    help: "Seleccione la opción correcta",
    options: [
      "Dueño / titular",
      "Empleado administrativo",
      "Encargado de compras",
      "Farmacéutico",
      "Sistema automático",
      "Otro"
    ]
  },
  {
    id: "q18_tiempo_pedidos",
    type: "single",
    required: true,
    title: "18- Tiempo diario dedicado a cargar pedidos",
    help: "Seleccione la opción correcta",
    options: [
      "Menos de 30 minutos",
      "30–60 minutos",
      "1–2 horas",
      "Más de 2 horas",
      "Variable según el día"
    ]
  },
  {
    id: "q19_frec_entregas",
    type: "single",
    required: true,
    title: "19- Frecuencia de entregas requerida",
    help: "Seleccione la opción correcta",
    options: [
      "1 vez por día",
      "2 veces por día",
      "Más de 2 veces por día",
      "Día por medio",
      "Según disponibilidad"
    ]
  },
  {
    id: "q20_antiguedad",
    type: "single",
    required: true,
    title: "20- Antigüedad con la droguería principal",
    help: "Seleccione la opción correcta",
    options: ["Menos de 1 año","1–3 años","3–5 años","Más de 5 años","Más de 10 años"]
  },
  {
    id: "q21_satisfaccion",
    type: "single",
    required: true,
    title: "21- ¿Qué tan satisfecho está actualmente con su droguería principal?",
    help: "En términos generales (precio, financiación, servicios y cumplimiento)",
    options: ["Muy insatisfecho","Insatisfecho","Neutral","Satisfecho","Muy satisfecho"]
  },
  {
    id: "q22_ranking_motivos_cambio",
    type: "rank",
    required: true,
    title: "22- ¿Cuáles serían los principales motivos para considerar cambio de droguería?",
    help: "Arrastre al ranking (derecha) y ordene del más importante al menos importante.",
    items: [
      "Mejor precio",
      "Mejor financiación",
      "Problemas de disponibilidad",
      "Demoras en entregas",
      "Mala atención",
      "Condiciones poco claras / inestables",
      "Digitalización / plataforma"
    ]
  },
  {
    id: "q24_ranking_barreras",
    type: "rank",
    required: true,
    title: "24- ¿Cuáles son las principales barreras para cambiar de droguería?",
    help: "Arrastre al ranking (derecha) y ordene del más importante al menos importante.",
    items: [
      "Miedo a perder condiciones actuales",
      "Riesgo financiero",
      "Relación personal",
      "Complejidad administrativa",
      "Falta de tiempo",
      "Desconfianza en el nuevo proveedor",
      "No veo beneficios claros"
    ]
  },
  {
    id: "q25_nivel_cambio",
    type: "single",
    required: true,
    title: "25- Si encontrara una propuesta financieramente superior, ¿qué nivel de cambio estaría dispuesto a realizar?",
    help: "Seleccione la opción correcta",
    options: [
      "No cambiaría",
      "Probaría con un volumen mínimo",
      "Derivaría parte de mis compras",
      "Transferiría una parte significativa",
      "Cambiaría totalmente de proveedor"
    ]
  },
  {
    id: "q26_urgencia_rent",
    type: "single",
    required: true,
    title: "26- ¿Qué tan urgente es mejorar su rentabilidad hoy?",
    help: "Seleccione la opción correcta",
    options: ["Nada urgente","Poco urgente","Moderadamente urgente","Bastante urgente","Muy urgente"]
  },
  {
    id: "q27_canal_comunicacion",
    type: "multi",
    required: true,
    title: "27- Canal principal de comunicación con la droguería",
    help: "Seleccione las opciones que correspondan",
    options: [
      "WhatsApp",
      "Representante comercial presencial",
      "Teléfono",
      "Plataforma web",
      "Email",
      "Grupo de compras"
    ]
  },
  {
    id: "q28_comp_precios_tool",
    type: "single",
    required: true,
    title: "28- ¿Utiliza herramientas de comparación de precios?",
    help: "Seleccione la opción correcta",
    options: ["Sí, diariamente","Sí, ocasionalmente","Solo ante aumentos fuertes","No utilizo"]
  },
  {
    id: "q29_grupos_wp",
    type: "single",
    required: true,
    title: "29- ¿Busca información en grupos de WhatsApp del sector?",
    help: "Seleccione la opción correcta",
    options: [
      "Sí, activamente",
      "Sí, pero solo observo",
      "Estoy en grupos pero no participo",
      "No participo en grupos"
    ]
  },
  {
    id: "q30_dispuesto_digital",
    type: "single",
    required: true,
    title: "30- ¿Qué tan dispuesto estaría a implementar nuevas herramientas digitales?",
    help: "Que mejoren la gestión de compra y rentabilidad de su farmacia",
    options: ["Nada dispuesto","Poco dispuesto","Moderadamente dispuesto","Bastante dispuesto","Totalmente dispuesto"]
  },
  {
    id: "q31_deterioro_margen",
    type: "single",
    required: true,
    title: "31- ¿Percibe deterioro de margen en los últimos 12 meses?",
    help: "Seleccione la opción correcta",
    options: ["Sí, fuerte deterioro","Sí, leve deterioro","Se mantiene estable","Mejoró","No lo tengo claro"]
  },
  {
    id: "q32_perdida_faltantes",
    type: "single",
    required: true,
    title: "32- Estimación de pérdida por faltantes",
    help: "Seleccione la opción correcta",
    options: ["Menos de 1% mensual","1–3% mensual","3–5% mensual","Más de 5% mensual","No lo tengo medido"]
  }
];
let ACCESS = null;
const state = { i: 0, answers: {} };

const card = $("#card");
const btnBack = $("#btnBack");
const btnNext = $("#btnNext");
const progressBar = $("#progressBar");
const progressText = $("#progressText");
const stepText = $("#stepText");

function rankItem(text){
  const d = document.createElement("div");
  d.className = "rank-item";
  d.textContent = text;
  return d;
}

function normalizeStr(s){
  return (s || "").toString().trim().toLowerCase();
}

function findProvinceForCity(city){
  const map = window.CITIES_BY_PROVINCE || {};
  const cN = normalizeStr(city);
  if (!cN) return null;

  for (const provKey of Object.keys(map)){
    const arr = map[provKey];
    if (!Array.isArray(arr)) continue;
    if (arr.some(x => normalizeStr(x) === cN)) return provKey;
  }
  return null;
}

function validateCityCrossProvince(selectedProv, city){
  const p = (selectedProv || "").trim();
  const c = (city || "").trim();
  if (!p || !c) return { ok: false, msg: "Complete provincia y ciudad." };

  const provFound = findProvinceForCity(c);
  if (!provFound) return { ok: true }; // ciudad no cargada -> permitir

  if (provFound !== p){
    return {
      ok: false,
      msg: `La ciudad "${c}" corresponde a "${provFound}" (según las ciudades cargadas). Revise provincia.`
    };
  }
  return { ok: true };
}

function setProgress(){
  const total = questions.length;
  const curr = state.i + 1;
  const pct = Math.round((curr / total) * 100);

  progressBar.style.width = pct + "%";
  progressText.textContent = pct + "%";
  stepText.textContent = `Pregunta ${curr} de ${total}`;
}

function render(){
  setProgress();

  const q = questions[state.i];
  btnBack.disabled = state.i === 0;
  btnNext.textContent = (state.i === questions.length - 1) ? "Finalizar" : "Siguiente";

  card.innerHTML = "";

  const h = document.createElement("h2");
  h.className = "q-title";
  h.textContent = q.title;
  card.appendChild(h);

  if (q.help){
    const help = document.createElement("p");
    help.className = "q-help";
    help.textContent = q.help;
    card.appendChild(help);
  }

  if (q.type === "single") renderSingle(q);
  else if (q.type === "multi") renderMulti(q);
  else if (q.type === "select") renderSelect(q);
  else if (q.type === "text") renderText(q);
  else if (q.type === "rank") renderRank(q);
  else if (q.type === "datalist_city") renderDatalistCity(q);
}

function renderSingle(q){
  const val = state.answers[q.id] ?? null;

  q.options.forEach((opt, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "opt";
         wrap.setAttribute("role", "button");
    wrap.tabIndex = 0;

    const input = document.createElement("input");
    input.type = "radio";
    input.name = q.id;
    input.id = `${q.id}_${idx}`;
    input.value = opt;
    if (val === opt) input.checked = true;

    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.textContent = opt;

        wrap.appendChild(input);
    wrap.appendChild(label);

    wrap.addEventListener("click", (e) => {
      if (e.target.tagName !== "INPUT") {
        input.checked = true;
      }
    });

    wrap.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        input.checked = true;
      }
    });

    card.appendChild(wrap);
  });
}
function renderMulti(q){
  const val = state.answers[q.id] ?? [];

  q.options.forEach((opt, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "opt";
    wrap.setAttribute("role", "button");
    wrap.tabIndex = 0;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = q.id;
    input.id = `${q.id}_${idx}`;
    input.value = opt;
    if (val.includes(opt)) input.checked = true;

    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.textContent = opt;

    wrap.appendChild(input);
    wrap.appendChild(label);

    wrap.addEventListener("click", (e) => {
      if (e.target.tagName !== "INPUT") {
        input.checked = !input.checked;
      }
    });

    wrap.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        input.checked = !input.checked;
      }
    });

    card.appendChild(wrap);
  });
}
function renderSelect(q){
  const row = document.createElement("div");
  row.className = "row";

  const sel = document.createElement("select");
  sel.id = q.id;

  const ph = document.createElement("option");
  ph.value = "";
  ph.textContent = "Seleccione…";
  sel.appendChild(ph);

  q.options.forEach(opt => {
    const o = document.createElement("option");
    o.value = opt;
    o.textContent = opt;
    sel.appendChild(o);
  });

  sel.value = state.answers[q.id] ?? "";

  row.appendChild(sel);
  card.appendChild(row);
}

function renderText(q){
  const inp = document.createElement("input");
  inp.type = "text";
  inp.id = q.id;
  inp.placeholder = "Escriba aquí…";
  inp.value = state.answers[q.id] ?? "";
  card.appendChild(inp);
}

function renderDatalistCity(q){
  const prov = (state.answers.q2_provincia || "").trim();
  const cities = (window.CITIES_BY_PROVINCE && window.CITIES_BY_PROVINCE[prov]) ? window.CITIES_BY_PROVINCE[prov] : [];

  const wrap = document.createElement("div");
  wrap.className = "row";
   wrap.setAttribute("role", "button");
wrap.tabIndex = 0;

  const input = document.createElement("input");
  input.type = "text";
  input.id = q.id;
  input.placeholder = prov ? "Escribí y elegí de la lista" : "Primero elegí provincia";
  input.autocomplete = "off";
  input.value = state.answers[q.id] ?? "";
  input.disabled = !prov;

  const listId = `dl_${q.id}`;
  input.setAttribute("list", listId);

  const dl = document.createElement("datalist");
  dl.id = listId;

  cities.forEach(c => {
    const o = document.createElement("option");
    o.value = c;
    dl.appendChild(o);
  });

  wrap.appendChild(input);
  wrap.appendChild(dl);
  card.appendChild(wrap);

   wrap.addEventListener("click", (e) => {
  if (e.target.tagName !== "INPUT") {
    input.checked = true;
  }
});

wrap.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    input.checked = true;
  }
});

  if (prov && cities.length === 0){
    const hint = document.createElement("p");
    hint.className = "q-help";
    hint.textContent = "Todavía no hay ciudades cargadas para esta provincia. Puede escribirla manualmente.";
    card.appendChild(hint);
  }
}

function renderRank(q){
  const saved = state.answers[q.id];

  const wrap = document.createElement("div");
  wrap.className = "rank-wrap";

  const left = document.createElement("div");
  left.className = "rank-box";
  left.innerHTML = `<h3>Opciones</h3><div id="rankLeft"></div><div class="rank-hint">Arrastre al ranking.</div>`;

  const right = document.createElement("div");
  right.className = "rank-box";
  right.innerHTML = `<h3>Ranking (más importante arriba)</h3><div id="rankRight"></div><div class="rank-hint">Ordene aquí.</div>`;

  wrap.appendChild(left);
  wrap.appendChild(right);
  card.appendChild(wrap);

  const leftList = $("#rankLeft");
  const rightList = $("#rankRight");

  const itemsRight = Array.isArray(saved) ? saved.slice() : [];
  const itemsLeft = q.items.filter(x => !itemsRight.includes(x));

  itemsLeft.forEach(txt => leftList.appendChild(rankItem(txt)));
  itemsRight.forEach(txt => rightList.appendChild(rankItem(txt)));

 new Sortable(leftList, {
  group: "rank",
  animation: 180,
  draggable: ".rank-item",
  ghostClass: "drag-ghost",
  dragClass: "drag-dragging",
  sort: false,
  swapThreshold: 0.2
});

new Sortable(rightList, {
  group: "rank",
  animation: 180,
  draggable: ".rank-item",
  ghostClass: "drag-ghost",
  dragClass: "drag-dragging",
  swapThreshold: 0.2
});
}

function readCurrentAnswer(){
  const q = questions[state.i];

  if (q.type === "single"){
    const picked = document.querySelector(`input[name="${q.id}"]:checked`);
    return picked ? picked.value : null;
  }

  if (q.type === "multi"){
    return Array.from(document.querySelectorAll(`input[name="${q.id}"]:checked`)).map(x => x.value);
  }

  if (q.type === "select"){
    const sel = $(`#${q.id}`);
    return sel ? sel.value : "";
  }

  if (q.type === "text"){
    const inp = $(`#${q.id}`);
    return inp ? inp.value.trim() : "";
  }

  if (q.type === "datalist_city"){
    const inp = $(`#${q.id}`);
    return inp ? inp.value.trim() : "";
  }

  if (q.type === "rank"){
    const rightList = $("#rankRight");
    return rightList ? Array.from(rightList.querySelectorAll(".rank-item")).map(x => x.textContent) : [];
  }

  return null;
}

function validateAnswer(q, val){
  if (!q.required) return true;

  if (q.type === "single") return !!val;
  if (q.type === "select") return typeof val === "string" && val.length > 0;
  if (q.type === "text") return typeof val === "string" && val.length > 0;

  if (q.type === "datalist_city"){
    if (!(typeof val === "string" && val.length > 0)) return false;
    const selectedProv = state.answers.q2_provincia || "";
    const check = validateCityCrossProvince(selectedProv, val);
    if (!check.ok){ alert(check.msg); return false; }
    return true;
  }

  if (q.type === "multi") return Array.isArray(val) && val.length > 0;
  if (q.type === "rank") return Array.isArray(val) && val.length === q.items.length;

  return true;
}

function saveCurrent(){
  const q = questions[state.i];
  const val = readCurrentAnswer();

  if (!validateAnswer(q, val)){
    alert("Complete esta pregunta para continuar.");
    return false;
  }

  state.answers[q.id] = val;
  return true;
}

btnBack.addEventListener("click", () => {
  if (state.i > 0){
    state.i--;
    render();
  }
});

btnNext.addEventListener("click", () => {
  if (!saveCurrent()) return;

  if (state.i < questions.length - 1){
    state.i++;
    render();
    return;
  }

  console.log("RESPUESTAS:", state.answers);
  showFinish();
});
function showFinish(){
  card.innerHTML = "";

  const box = document.createElement("div");
  box.className = "finish";

  box.innerHTML = `
    <h2>Muchas gracias</h2>
    <p>Agradecemos su tiempo para completar esta encuesta.</p>
    <p>La información será analizada de forma agregada para comprender mejor la estructura económica del canal farmacéutico.</p>
    <p>Su participación es muy valiosa para este estudio.</p>
  `;

  card.appendChild(box);

  btnBack.style.display = "none";
  btnNext.style.display = "none";

  progressBar.style.width = "100%";
  progressText.textContent = "100%";
  stepText.textContent = "Encuesta finalizada";
}
async function initSurveyAccess(){
  const result = await validateAccessCode();

  if(!result.ok){
    document.body.innerHTML = `
      <div style="max-width:600px;margin:80px auto;font-family:sans-serif;text-align:center">
        <h2>Acceso inválido</h2>
        <p>${result.message}</p>
      </div>
    `;
    return;
  }

  ACCESS = result;
  console.log("Farmacia validada:", ACCESS.pharmacyName);

  render();
}

document.addEventListener("DOMContentLoaded", initSurveyAccess);   
