const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const state = {
  tab: "strategy",
  companyId: null,
  channelId: null
};

/* -----------------------
   SUPABASE
------------------------ */
async function loadWorkspace(blockId, subtopic){
  const { data, error } = await sb
    .from("workspace_items")
    .select("*")
    .eq("company_id", state.companyId)
    .eq("channel_id", state.channelId)
    .eq("block_id", blockId)
    .eq("subtopic", subtopic)
    .order("created_at", { ascending: false });

  if(error){
    console.error("loadWorkspace error:", error);
    return [];
  }

  return data || [];
}

async function saveNote(blockId, subtopic, text){
  const cleanText = (text || "").trim();
  if(!cleanText) return null;

  const { data, error } = await sb
    .from("workspace_items")
    .insert({
      company_id: state.companyId,
      channel_id: state.channelId,
      block_id: blockId,
      subtopic: subtopic,
      type: "note",
      content: cleanText
    })
    .select();

  if(error){
    console.error("saveNote error:", error);
    return null;
  }

  return data?.[0] || null;
}

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

function ensureSubNode(store, blockId, subKey){
  store[blockId] = store[blockId] || {};
  store[blockId][subKey] = store[blockId][subKey] || { notes: [], links: [], files: [] };
  return store[blockId][subKey];
}

function countItems(node){
  return (node?.notes?.length || 0) + (node?.links?.length || 0) + (node?.files?.length || 0);
}
function getBlockProgress(block){
  const store = loadStore();
  const subs = block.subs || [];

  let completed = 0;

  subs.forEach(sub => {
    const node = ensureSubNode(store, block.id, sub.id);
    const total = countItems(node);
    if(total > 0) completed++;
  });

  return {
    completed,
    total: subs.length
  };
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
  const strategyItems = window.WS_CONFIG.planes.strategy || [];
  const systemItems = window.WS_CONFIG.planes.system || [];
  const systemTab = document.querySelector('.tab[data-tab="system"]');

  if(systemTab && systemItems.length === 0){
    systemTab.style.display = "none";
  }

  if(strategyItems.length > 0){
    state.tab = "strategy";
  }

  $$(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;
      const items = window.WS_CONFIG.planes[targetTab] || [];
      if(items.length === 0) return;

      $$(".tab").forEach(b => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });

      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      state.tab = targetTab;

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

function render(){
  const grid = $("#cardsGrid");
  const items = window.WS_CONFIG.planes[state.tab] || [];

  grid.innerHTML = items.map(item => {
    const progress = getBlockProgress(item);

    return `
      <article class="card" data-id="${item.id}">
        <div class="card-title">${item.title}</div>
        <div class="card-desc">${item.desc}</div>

        <div class="card-progress">
          ${progress.completed} / ${progress.total}
        </div>

        <div class="card-meta">
          <span class="tag">${item.id}</span>
          <span class="tag">${state.tab === "strategy" ? "Estrategia" : "Sistema Comercial"}</span>
        </div>
      </article>
    `;
  }).join("");

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

  $("#drawerTitle").textContent = block.title;
  $("#drawerMeta").textContent = `${company?.name || ""} · ${channel?.name || ""} · ${state.tab === "strategy" ? "Estrategia" : "Sistema Comercial"}`;

  const body = $("#drawerBody");
  body.innerHTML = renderAccordion(block);

  $("#drawer").classList.add("is-open");
  $("#drawer").setAttribute("aria-hidden", "false");

  wireAccordion(body, block.id);

  const closeBtn = $("#drawerClose");
  if(closeBtn) closeBtn.focus();
}

function closeDrawer(){
  const drawer = $("#drawer");
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");

  const activeTab = $(".tab.is-active");
  if(activeTab) activeTab.focus();
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

  if(subs.length === 0){
    return `
      <div class="accordion">
        <div class="acc-item is-open">
          <div class="acc-body" style="display:block;">
            <div class="mini">Sin subitems cargados</div>
          </div>
        </div>
      </div>
    `;
  }

  const accItems = subs.map((sub) => {
    const subKey = sub.id;
    const subLabel = sub.id ? `${sub.id}) ${sub.name}` : sub.name;
    const node = ensureSubNode(store, block.id, subKey);
    const cnt = countItems(node);

    return `
      <div class="acc-item" data-sub="${escapeAttr(subKey)}" data-block="${escapeAttr(block.id)}">
        <button class="acc-header" type="button">
          <span class="acc-title">${escapeHtml(subLabel)}</span>
          <span class="acc-count">${cnt}</span>
        </button>

        <div class="acc-body">
          <div class="row-actions">
            <button class="btn" type="button" data-action="upload">Subir documento</button>
            <button class="btn" type="button" data-action="link">Agregar link</button>
            <button class="btn" type="button" data-action="note-open">Agregar nota</button>
          </div>

          <input class="file-input" type="file" style="display:none" />

          <div class="note-compose" style="display:none; margin-top:10px;">
            <textarea class="note-new-text" rows="4"
              style="width:100%; border-radius:14px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.05); color:inherit; padding:10px; resize:vertical;"
              placeholder="Escribí una nota..."></textarea>
            <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
              <button class="btn" type="button" data-action="note-save-new">Guardar</button>
              <button class="btn" type="button" data-action="note-cancel-new">Cancelar</button>
            </div>
          </div>

          <div class="mini" style="margin-top:10px;">
            ${renderMiniList(node)}
          </div>
        </div>
      </div>
    `;
  }).join("");

  return `<div class="accordion">${accItems}</div>`;
}

function wireAccordion(root, blockId){
  $$(".acc-header", root).forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".acc-item");
      item.classList.toggle("is-open");
    });
  });

  root.addEventListener("click", (e) => {
    const actionBtn = e.target.closest("button[data-action]");
    if(!actionBtn) return;

    const item = actionBtn.closest(".acc-item");
    const subKey = item?.getAttribute("data-sub");
    const realBlockId = item?.getAttribute("data-block");
    if(!item || !subKey || !realBlockId) return;

    const action = actionBtn.getAttribute("data-action");

    if(action === "upload"){
      onUpload(realBlockId, subKey, item);
      return;
    }

    if(action === "link"){
      onAddLink(realBlockId, subKey, item);
      return;
    }

    if(action === "note-open"){
      const box = $(".note-compose", item);
      if(box) box.style.display = "block";
      const ta = $(".note-new-text", item);
      if(ta) ta.focus();
      return;
    }

    if(action === "note-cancel-new"){
      const box = $(".note-compose", item);
      if(box) box.style.display = "none";
      const ta = $(".note-new-text", item);
      if(ta) ta.value = "";
      return;
    }

    if(action === "note-save-new"){
      const ta = $(".note-new-text", item);
      const text = (ta?.value || "").trim();
      if(!text) return;

      saveNote(realBlockId, subKey, text)
        .then((saved) => {
          const store = loadStore();
          const node = ensureSubNode(store, realBlockId, subKey);
          node.notes.unshift({ text, ts: Date.now(), remoteId: saved?.id || null });
          saveStore(store);

          if(ta) ta.value = "";
          const box = $(".note-compose", item);
          if(box) box.style.display = "none";

          refreshSubUI(realBlockId, subKey, item);
        })
        .catch(err => {
          console.error("note-save-new error:", err);
          alert("Error al guardar la nota");
        });

      return;
    }
  });

  root.addEventListener("click", (e) => {
    const item = e.target.closest(".acc-item");
    if(!item) return;

    const subKey = item.getAttribute("data-sub");
    const realBlockId = item.getAttribute("data-block");
    if(!subKey || !realBlockId) return;

    const btnEdit = e.target.closest("[data-note-edit]");
    if(btnEdit){
      const idx = Number(btnEdit.getAttribute("data-note-edit"));
      const view = item.querySelector(`[data-note-view="${idx}"]`);
      const box = item.querySelector(`[data-note-editbox="${idx}"]`);
      if(view) view.style.display = "none";
      if(box) box.style.display = "block";
      const ta = box?.querySelector("textarea");
      if(ta) ta.focus();
      return;
    }

    const btnCancel = e.target.closest("[data-note-cancel]");
    if(btnCancel){
      const idx = Number(btnCancel.getAttribute("data-note-cancel"));
      const view = item.querySelector(`[data-note-view="${idx}"]`);
      const box = item.querySelector(`[data-note-editbox="${idx}"]`);
      if(box) box.style.display = "none";
      if(view) view.style.display = "block";
      refreshSubUI(realBlockId, subKey, item);
      return;
    }

    const btnSave = e.target.closest("[data-note-save]");
    if(btnSave){
      const idx = Number(btnSave.getAttribute("data-note-save"));
      const box = item.querySelector(`[data-note-editbox="${idx}"]`);
      const ta = box?.querySelector("textarea");
      const text = (ta?.value || "").trim();
      if(!text) return;

      const store = loadStore();
      const node = ensureSubNode(store, realBlockId, subKey);
      if(node.notes?.[idx]) node.notes[idx].text = text;
      saveStore(store);

      refreshSubUI(realBlockId, subKey, item);
      return;
    }
  });

  root.addEventListener("click", (e) => {
    const delBtn = e.target.closest("[data-del]");
    if(!delBtn) return;

    const item = delBtn.closest(".acc-item");
    const subKey = item?.getAttribute("data-sub");
    const realBlockId = item?.getAttribute("data-block");
    if(!item || !subKey || !realBlockId) return;

    const type = delBtn.getAttribute("data-del");
    const index = Number(delBtn.getAttribute("data-index"));

    const store = loadStore();
    const node = ensureSubNode(store, realBlockId, subKey);

    if(type === "note") node.notes.splice(index, 1);
    if(type === "link") node.links.splice(index, 1);
    if(type === "file") node.files.splice(index, 1);

    saveStore(store);
    refreshSubUI(realBlockId, subKey, item);
  });
}

function onAddLink(blockId, subKey, accItem){
  const url = prompt("Pegá la URL del link:");
  if(!url || !url.trim()) return;

  const title = prompt("Título del link (opcional):") || "";
  const store = loadStore();
  const node = ensureSubNode(store, blockId, subKey);
  node.links.unshift({ url: url.trim(), title: title.trim(), ts: Date.now() });
  saveStore(store);

  refreshSubUI(blockId, subKey, accItem);
}

function onUpload(blockId, subKey, accItem){
  const input = $(".file-input", accItem);
  if(!input) return;

  input.value = "";
  input.onchange = () => {
    const f = input.files?.[0];
    if(!f) return;

    const store = loadStore();
    const node = ensureSubNode(store, blockId, subKey);
    node.files.unshift({ name: f.name, size: f.size, ts: Date.now() });
    saveStore(store);

    refreshSubUI(blockId, subKey, accItem);
  };

  input.click();
}

function refreshSubUI(blockId, subKey, accItem){
  const store = loadStore();
  const node = ensureSubNode(store, blockId, subKey);

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
    return "Sin contenido cargado";
  }

  const parts = [];

  const delBtn = (type, index) =>
    `<button data-del="${type}" data-index="${index}"
      style="margin-left:8px; font-size:11px; opacity:.7; cursor:pointer; border:0; background:none; color:#ff6b6b;">✕</button>`;

  const editBtn = (index) =>
    `<button data-note-edit="${index}"
      style="margin-left:8px; font-size:11px; opacity:.7; cursor:pointer; border:0; background:none; color:rgba(255,255,255,.8); text-decoration:underline;">Editar</button>`;

  if(notes.length){
    parts.push(`<div style="margin-bottom:6px;"><span style="opacity:.8">Notas</span></div>`);
    const li = notes.map((n,i) => {
      const textView = escapeHtml(trunc(n.text, 300));
      const textEdit = escapeHtml(n.text);

      return [
        `<li style="margin-bottom:8px;">`,
          `<div class="note-view" data-note-view="${i}">`,
            textView,
            editBtn(i),
            delBtn("note", i),
          `</div>`,
          `<div class="note-edit" data-note-editbox="${i}" style="display:none; margin-top:8px;">`,
            `<textarea rows="4"`,
              ` style="width:100%; border-radius:14px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.05); color:inherit; padding:10px; resize:vertical;">`,
              textEdit,
            `</textarea>`,
            `<div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">`,
              `<button class="btn" type="button" data-note-save="${i}">Guardar</button>`,
              `<button class="btn" type="button" data-note-cancel="${i}">Cancelar</button>`,
            `</div>`,
          `</div>`,
        `</li>`
      ].join("");
    }).join("");

    parts.push(`<ul style="margin:0 0 10px 16px; padding:0;">${li}</ul>`);
  }

  if(links.length){
    parts.push(`<div style="margin-bottom:6px;"><span style="opacity:.8">Links</span></div>`);
    const li = links.map((l,i) => {
      const label = l.title ? escapeHtml(trunc(l.title, 60)) : escapeHtml(trunc(l.url, 60));
      const href = escapeAttr(l.url);

      return [
        `<li>`,
          `<a href="${href}" target="_blank" rel="noopener noreferrer"`,
          ` style="color:inherit; text-decoration:underline; opacity:.9;">`,
          label,
          `</a>`,
          delBtn("link", i),
        `</li>`
      ].join("");
    }).join("");

    parts.push(`<ul style="margin:0 0 10px 16px; padding:0;">${li}</ul>`);
  }

  if(files.length){
    parts.push(`<div style="margin-bottom:6px;"><span style="opacity:.8">Archivos</span></div>`);
    const li = files.map((f,i) => {
      return [
        `<li>`,
          escapeHtml(trunc(f.name, 60)),
          delBtn("file", i),
        `</li>`
      ].join("");
    }).join("");

    parts.push(`<ul style="margin:0 0 0 16px; padding:0;">${li}</ul>`);
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
