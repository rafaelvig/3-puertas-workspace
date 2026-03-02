const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const state = {
  tab: "strategy",
  companyId: null,
  channelId: null
};

/* -----------------------
   Storage (local)
------------------------ */
function storageKey(){
  return `3pws:${state.companyId}:${state.channelId}:${state.tab}`;
}

function loadStore(){
  try{
    return JSON.parse(localStorage.getItem(storageKey()) || "{}");
  }catch{
    return {};
  }
}

function saveStore(obj){
  localStorage.setItem(storageKey(), JSON.stringify(obj));
}

function ensureSubNode(store, blockId, subName){
  store[blockId] = store[blockId] || {};
  store[blockId][subName] = store[blockId][subName] || { notes: [], links: [], files: [] };
  return store[blockId][subName];
}

function countItems(node){
  return (node?.notes?.length || 0) + (node?.links?.length || 0) + (node?.files?.length || 0);
}

/* -----------------------
   Init: selectors + tabs
------------------------ */
function initSelectors(){
  const companies = window.WS_CONFIG.companies;
  const selCompany = $("#selCompany");
  selCompany.innerHTML = companies.map(c => `<option value="${c.id}">${c.name}</option>`).join("");

  state.companyId = companies[0]?.id || null;

  selCompany.addEventListener("change", () => {
    state.companyId = selCompany.value;
    syncChannels();
    render();
    closeDrawer();
  });

  syncChannels();
}

function syncChannels(){
  const selChannel = $("#selChannel");
  const company = window.WS_CONFIG.companies.find(c => c.id === state.companyId);
  const channels = company?.channels || [];
  selChannel.innerHTML = channels.map(ch => `<option value="${ch.id}">${ch.name}</option>`).join("");
  state.channelId = channels[0]?.id || null;

  selChannel.onchange = () => {
    state.channelId = selChannel.value;
    render();
    closeDrawer();
  };
}

function initTabs(){
  $$(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".tab").forEach(b => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      state.tab = btn.dataset.tab;
      render();
      closeDrawer();
    });
  });
}

/* -----------------------
   Cards
------------------------ */
function render(){
  const grid = $("#cardsGrid");
  const items = window.WS_CONFIG.planes[state.tab] || [];

  grid.innerHTML = items.map(item => `
    <article class="card" data-id="${item.id}">
      <div class="card-title">${item.title}</div>
      <div class="card-desc">${item.desc}</div>
      <div class="card-meta">
        <span class="tag">${item.id}</span>
        <span class="tag">${state.tab === "strategy" ? "Estrategia" : "Sistema Comercial"}</span>
      </div>
    </article>
  `).join("");

  $$(".card", grid).forEach(card => {
    card.addEventListener("click", () => openDrawer(card.dataset.id));
  });
}

/* -----------------------
   Drawer
------------------------ */
function openDrawer(blockId){
  const items = window.WS_CONFIG.planes[state.tab] || [];
  const block = items.find(x => x.id === blockId);
  if(!block) return;

  const company = window.WS_CONFIG.companies.find(c => c.id === state.companyId);
  const channel = (company?.channels || []).find(ch => ch.id === state.channelId);

  $("#drawerTitle").textContent = `${block.id}. ${block.title}`;
  $("#drawerMeta").textContent = `${company?.name || ""} · ${channel?.name || ""} · ${state.tab === "strategy" ? "Estrategia" : "Sistema Comercial"}`;

  const body = $("#drawerBody");
  body.innerHTML = renderAccordion(block);

  $("#drawer").classList.add("is-open");
  $("#drawer").setAttribute("aria-hidden", "false");

  wireAccordion(body, block.id);
}

function closeDrawer(){
  $("#drawer").classList.remove("is-open");
  $("#drawer").setAttribute("aria-hidden", "true");
}

function initDrawer(){
  $("#drawerClose").addEventListener("click", closeDrawer);
  $("#drawerBackdrop").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") closeDrawer();
  });
}

/* -----------------------
   Accordion render + wiring
------------------------ */
function renderAccordion(block){
  const store = loadStore();
  const subs = block.subs || [];

  const accItems = subs.map((subName) => {
    const node = ensureSubNode(store, block.id, subName);
    const cnt = countItems(node);

    return `
      <div class="acc-item" data-sub="${escapeAttr(subName)}" data-block="${escapeAttr(block.id)}">
        <button class="acc-header" type="button">
          <span class="acc-title">${escapeHtml(subName)}</span>
          <span class="acc-count">${cnt}</span>
        </button>
        <div class="acc-body">
          <div class="row-actions">
            <button class="btn" type="button" data-action="upload">Subir documento</button>
            <button class="btn" type="button" data-action="link">Agregar link</button>
            <button class="btn" type="button" data-action="note">Agregar nota</button>
          </div>

          <input class="file-input" type="file" style="display:none" />

          <div class="mini">
            ${renderMiniList(node)}
          </div>
        </div>
      </div>
    `;
  }).join("");

  // No guardo store acá: solo lo uso para render.
  return `<div class="accordion">${accItems}</div>`;
}

function wireAccordion(root, blockId){
  // toggle
  $$(".acc-header", root).forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".acc-item");
      item.classList.toggle("is-open");
    });
  });

  // actions (delegado)
  root.addEventListener("click", (e) => {
    const actionBtn = e.target.closest("button[data-action]");
    if(!actionBtn) return;

    const item = actionBtn.closest(".acc-item");
    const subName = item?.getAttribute("data-sub");
    const action = actionBtn.getAttribute("data-action");
    if(!item || !subName) return;

    if(action === "note") onAddNote(blockId, subName, item);
    if(action === "link") onAddLink(blockId, subName, item);
    if(action === "upload") onUpload(blockId, subName, item);
  });
}

function onAddNote(blockId, subName, accItem){
  const text = prompt("Escribí la nota:");
  if(!text || !text.trim()) return;

  const store = loadStore();
  const node = ensureSubNode(store, blockId, subName);
  node.notes.unshift({ text: text.trim(), ts: Date.now() });
  saveStore(store);

  refreshSubUI(blockId, subName, accItem);
}

function onAddLink(blockId, subName, accItem){
  const url = prompt("Pegá la URL del link:");
  if(!url || !url.trim()) return;

  const title = prompt("Título del link (opcional):") || "";
  const store = loadStore();
  const node = ensureSubNode(store, blockId, subName);
  node.links.unshift({ url: url.trim(), title: title.trim(), ts: Date.now() });
  saveStore(store);

  refreshSubUI(blockId, subName, accItem);
}

function onUpload(blockId, subName, accItem){
  const input = $(".file-input", accItem);
  if(!input) return;

  input.value = "";
  input.onchange = () => {
    const f = input.files?.[0];
    if(!f) return;

    const store = loadStore();
    const node = ensureSubNode(store, blockId, subName);
    // Mock: guardamos nombre y size (no sube a ningún lado)
    node.files.unshift({ name: f.name, size: f.size, ts: Date.now() });
    saveStore(store);

    refreshSubUI(blockId, subName, accItem);
  };

  input.click();
}

function refreshSubUI(blockId, subName, accItem){
  const store = loadStore();
  const node = ensureSubNode(store, blockId, subName);

  const cntEl = $(".acc-count", accItem);
  if(cntEl) cntEl.textContent = String(countItems(node));

  const miniEl = $(".mini", accItem);
  if(miniEl) miniEl.innerHTML = renderMiniList(node);
}

function renderMiniList(node){
  const notes = node?.notes || [];
  const links = node?.links || [];
  const files = node?.files || [];

  if(notes.length + links.length + files.length === 0){
    return `Sin contenido cargado`;
  }

  const parts = [];

  if(notes.length){
    parts.push(`<div style="margin-bottom:8px;"><span style="opacity:.8">Notas</span></div>`);
    parts.push(`<ul style="margin:0 0 10px 16px; padding:0;">${
      notes.slice(0,3).map(n => `<li>${escapeHtml(trunc(n.text, 80))}</li>`).join("")
    }</ul>`);
  }

  if(links.length){
    parts.push(`<div style="margin-bottom:8px;"><span style="opacity:.8">Links</span></div>`);
    parts.push(`<ul style="margin:0 0 10px 16px; padding:0;">${
      links.slice(0,3).map(l => {
        const label = l.title ? escapeHtml(trunc(l.title, 60)) : escapeHtml(trunc(l.url, 60));
        const href = escapeAttr(l.url);
        return `<li><a href="${href}" target="_blank" rel="noopener noreferrer" style="color:inherit; text-decoration:underline; opacity:.9;">${label}</a></li>`;
      }).join("")
    }</ul>`);
  }

  if(files.length){
    parts.push(`<div style="margin-bottom:8px;"><span style="opacity:.8">Archivos</span></div>`);
    parts.push(`<ul style="margin:0 0 0 16px; padding:0;">${
      files.slice(0,3).map(f => `<li>${escapeHtml(trunc(f.name, 60))}</li>`).join("")
    }</ul>`);
  }

  return parts.join("");
}

/* -----------------------
   Utils (safe)
------------------------ */
function trunc(s, n){
  if(!s) return "";
  return s.length > n ? s.slice(0, n-1) + "…" : s;
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(str){
  return escapeHtml(str).replaceAll("`", "&#096;");
}

/* -----------------------
   Boot
------------------------ */
function boot(){
  initSelectors();
  initTabs();
  initDrawer();
  render();
}
boot();
