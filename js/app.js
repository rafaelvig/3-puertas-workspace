const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const state = {
  tab: "strategy",
  companyId: null,
  channelId: null,
  openBlockId: null
};

let sendingMagicLink = false;
let authGateRunning = false;
let appInitialized = false;
let loginLoggedForSession = false;
let drawerInitialized = false;

/* -----------------------
   Login helpers
------------------------ */
function saveLastLoginEmail(email) {
  if (!email) return;
  localStorage.setItem("workspace_last_email", email.toLowerCase());
}

function loadLastLoginEmail() {
  return localStorage.getItem("workspace_last_email") || "";
}

function initLoginEmailSuggestion() {
  const input = $("#loginEmail");
  const datalist = $("#emailSuggestions");
  if (!input || !datalist) return;

  const lastEmail = loadLastLoginEmail();

  if (lastEmail) {
    input.value = lastEmail;
    datalist.innerHTML = `<option value="${escapeAttr(lastEmail)}"></option>`;
  }
}

/* -----------------------
   Auth logging
------------------------ */
async function logWorkspaceLogin(user) {
  try {
    const { error } = await sb
      .from("workspace_login_log")
      .insert({
        email: user.email,
        full_name: user.user_metadata?.full_name || "",
        user_agent: navigator.userAgent
      });

    if (error) {
      console.error("login log error:", error);
    }
  } catch (e) {
    console.error("login log crash:", e);
  }
}

/* -----------------------
   SUPABASE
------------------------ */
async function uploadFileToStorage(file, blockId, subKey) {
  const user = await getSessionUser();
  if (!user?.id) throw new Error("No hay usuario autenticado");

  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${state.companyId}/${state.channelId}/${blockId}/${subKey}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await sb
    .storage
    .from("workspace-files")
    .upload(path, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data: signedData, error: signedError } = await sb
    .storage
    .from("workspace-files")
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  if (signedError) throw signedError;

  const { data, error: insertError } = await sb
    .from("workspace_items")
    .insert({
      company_id: state.companyId,
      channel_id: state.channelId,
      block_id: blockId,
      subtopic: subKey,
      type: "file",
      content: file.name,
      file_path: path,
      file_url: signedData.signedUrl,
      created_by: user.id
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return data;
}

async function loadWorkspace(blockId, subtopic) {
  const { data, error } = await sb
    .from("workspace_items")
    .select("*")
    .eq("company_id", state.companyId)
    .eq("channel_id", state.channelId)
    .eq("block_id", blockId)
    .eq("subtopic", subtopic)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("loadWorkspace error:", error);
    return [];
  }

  return data || [];
}

async function saveNote(blockId, subtopic, text) {
  const cleanText = (text || "").trim();
  if (!cleanText) return null;

  const { data, error } = await sb
    .from("workspace_items")
    .insert({
      company_id: state.companyId,
      channel_id: state.channelId,
      block_id: blockId,
      subtopic,
      type: "note"
    })
    .select();

  if (error) {
    console.error("saveNote error:", error);
    return null;
  }

  return data?.[0] || null;
}

/* -----------------------
   Storage (local)
------------------------ */
function storageKey() {
  return `3pws:${state.companyId}:${state.channelId}:${state.tab}`;
}

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(storageKey()) || "{}");
  } catch {
    return {};
  }
}

function saveStore(obj) {
  localStorage.setItem(storageKey(), JSON.stringify(obj));
}

function ensureSubNode(store, blockId, subKey) {
  store[blockId] = store[blockId] || {};
  store[blockId][subKey] = store[blockId][subKey] || {
    notes: [],
    links: [],
    files: [],
    surveys: [],
    done: false,
    reviewedAt: null
  };
  return store[blockId][subKey];
}

function countItems(node) {
  return (
    (node?.notes?.length || 0) +
    (node?.links?.length || 0) +
    (node?.files?.length || 0) +
    (node?.surveys?.length || 0)
  );
}

function getSubStatus(node) {
  const totalItems = countItems(node);

  if (node?.done) return "done";
  if (totalItems > 0) return "working";
  return "empty";
}

function getStatusLabel(status) {
  if (status === "done") return "Listo";
  if (status === "working") return "En revisión";
  return "Pendiente";
}

function toggleModuleDone(blockId, subKey) {
  const store = loadStore();
  const node = ensureSubNode(store, blockId, subKey);

  node.done = !node.done;
  node.reviewedAt = node.done ? new Date().toISOString() : null;

  saveStore(store);
  renderAll();
}

function getAllModules() {
  const modules = [];
  const store = loadStore();
  const blocks = window.WS_CONFIG?.planes?.[state.tab] || [];

  blocks.forEach(block => {
    (block.subs || []).forEach(sub => {
      const subKey = sub.id;
      const node = ensureSubNode(store, block.id, subKey);

      modules.push({
        blockId: block.id,
        subKey,
        node
      });
    });
  });

  return modules;
}

function getWorkspaceProgress() {
  const modules = getAllModules();
  const total = modules.length;

  const done = modules.filter(m => m.node.done).length;
  const working = modules.filter(m => getSubStatus(m.node) === "working").length;
  const empty = total - done - working;

  const percent = total ? Math.round((done / total) * 100) : 0;

  let traffic = "red";
  if (percent >= 80) traffic = "green";
  else if (percent >= 35) traffic = "yellow";

  return { total, done, working, empty, percent, traffic };
}

function getBlockProgress(block) {
  const store = loadStore();
  const subs = block?.subs || [];
  const total = subs.length;

  if (!total) {
    return { total: 0, completed: 0, percent: 0 };
  }

  let completed = 0;

  subs.forEach(sub => {
    const subKey = sub.id;
    const node = ensureSubNode(store, block.id, subKey);
    if (node?.done) completed++;
  });

  return {
    total,
    completed,
    percent: Math.round((completed / total) * 100)
  };
}

function renderWorkspaceProgress() {
  const el = $("#workspaceProgress");
  if (!el) return;

  const p = getWorkspaceProgress();

  el.innerHTML = `
    <div class="wp-card">
      <div class="wp-top">
        <div class="wp-title">Avance general</div>
        <div class="wp-traffic ${p.traffic}"></div>
      </div>

      <div class="wp-bar">
        <div class="wp-bar-fill" style="width:${p.percent}%"></div>
      </div>

      <div class="wp-meta">
        <span>${p.percent}% completado</span>
        <span>${p.done}/${p.total} módulos listos</span>
      </div>

      <div class="wp-legend">
        <span>Listos: ${p.done}</span>
        <span>En revisión: ${p.working}</span>
        <span>Pendientes: ${p.empty}</span>
      </div>
    </div>
  `;
}

function renderModuleControls(blockId, subKey, node) {
  const status = getSubStatus(node);
  const statusLabel = getStatusLabel(status);
  const safeBlockId = String(blockId).replace(/'/g, "\\'");
  const safeSubKey = String(subKey).replace(/'/g, "\\'");

  return `
    <div class="module-controls">
      <div class="module-status module-status-${status}">
        Estado: ${statusLabel}
      </div>

      <button
        class="module-toggle-btn"
        type="button"
        onclick="toggleModuleDone('${safeBlockId}', '${safeSubKey}')"
      >
        ${node.done ? "Reabrir módulo" : "Marcar módulo listo"}
      </button>
    </div>
  `;
}

function resetModuleDone(store, blockId, subKey) {
  const node = ensureSubNode(store, blockId, subKey);
  node.done = false;
  node.reviewedAt = null;
}

/* -----------------------
   Init: selectors + tabs
------------------------ */
function initSelectors() {
  const companies = window.WS_CONFIG?.companies || [];
  const selCompany = $("#selCompany");
  if (!selCompany) return;

  selCompany.innerHTML = companies
    .map(c => `<option value="${escapeAttr(c.id)}">${escapeHtml(c.name)}</option>`)
    .join("");

  state.companyId = companies[0]?.id || null;

  selCompany.addEventListener("change", () => {
    state.companyId = selCompany.value;
    syncChannels();
    updateClientLogo();
    renderAll();
    closeDrawer();
  });

  syncChannels();
  updateClientLogo();
}
function syncChannels() {
  const selChannel = $("#selChannel");
  if (!selChannel) return;

  const company = window.WS_CONFIG?.companies?.find(c => c.id === state.companyId);
  const channels = company?.channels || [];

  selChannel.innerHTML = channels
    .map(ch => `<option value="${escapeAttr(ch.id)}">${escapeHtml(ch.name)}</option>`)
    .join("");

  state.channelId = channels[0]?.id || null;

  selChannel.onchange = () => {
    state.channelId = selChannel.value;
    renderAll();
    closeDrawer();
  };
}


function updateClientLogo() {
  const logos = {
    monumento: "img/logo-monumento.svg"
  };

  const el = document.getElementById("clientLogo");
  if (!el) return;

  const src = logos[state.companyId];

  if (src) {
    el.src = src;
    el.style.display = "block";
  } else {
    el.style.display = "none";
  }
}
function initTabs() {
  const strategyItems = window.WS_CONFIG?.planes?.strategy || [];
  const systemItems = window.WS_CONFIG?.planes?.system || [];
  const systemTab = document.querySelector('.tab[data-tab="system"]');

  if (systemTab && systemItems.length === 0) {
    systemTab.style.display = "none";
  }

  if (strategyItems.length > 0) {
    state.tab = "strategy";
  }

  $$(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;
      const items = window.WS_CONFIG?.planes?.[targetTab] || [];
      if (items.length === 0) return;

      $$(".tab").forEach(b => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });

      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      state.tab = targetTab;

      renderAll();
      closeDrawer();
    });
  });
}

/* -----------------------
   Cards
------------------------ */
function render() {
  const grid = $("#cardsGrid");
  if (!grid) return;

  const items = window.WS_CONFIG?.planes?.[state.tab] || [];

  grid.innerHTML = items.map(item => {
    const progress = getBlockProgress(item);

    return `
      <article class="card" data-id="${escapeAttr(item.id)}">
        <div class="card-title">${escapeHtml(item.title)}</div>
        <div class="card-desc">${escapeHtml(item.desc || "")}</div>

        <div class="card-progress">
          ${progress.completed} / ${progress.total}
        </div>

        <div class="card-meta">
          <span class="tag">${escapeHtml(item.id)}</span>
          <span class="tag">${state.tab === "strategy" ? "Estrategia" : "Sistema Comercial"}</span>
        </div>
      </article>
    `;
  }).join("");

  $$(".card", grid).forEach(card => {
    card.addEventListener("click", () => openDrawer(card.dataset.id));
  });
}

function rerenderOpenDrawer() {
  const drawer = $("#drawer");
  if (!drawer) return;
  if (!drawer.classList.contains("is-open")) return;
  if (!state.openBlockId) return;

  const items = window.WS_CONFIG?.planes?.[state.tab] || [];
  const block = items.find(x => x.id === state.openBlockId);
  if (!block) return;

  const company = window.WS_CONFIG?.companies?.find(c => c.id === state.companyId);
  const channel = (company?.channels || []).find(ch => ch.id === state.channelId);

  const drawerTitle = $("#drawerTitle");
  const drawerMeta = $("#drawerMeta");
  const body = $("#drawerBody");

  if (drawerTitle) drawerTitle.textContent = block.title;
  if (drawerMeta) {
    drawerMeta.textContent =
      `${company?.name || ""} · ${channel?.name || ""} · ${state.tab === "strategy" ? "Estrategia" : "Sistema Comercial"}`;
  }

  if (body) {
    body.innerHTML = renderAccordion(block);
    wireAccordion(body);
  }
}

function renderAll() {
  renderWorkspaceProgress();
  render();
  rerenderOpenDrawer();
}

/* -----------------------
   Drawer
------------------------ */
function openDrawer(blockId) {
  const items = window.WS_CONFIG?.planes?.[state.tab] || [];
  const block = items.find(x => x.id === blockId);
  if (!block) return;

  state.openBlockId = blockId;

  const company = window.WS_CONFIG?.companies?.find(c => c.id === state.companyId);
  const channel = (company?.channels || []).find(ch => ch.id === state.channelId);

  const drawerTitle = $("#drawerTitle");
  const drawerMeta = $("#drawerMeta");
  const body = $("#drawerBody");

  if (drawerTitle) drawerTitle.textContent = block.title;
  if (drawerMeta) {
    drawerMeta.textContent =
      `${company?.name || ""} · ${channel?.name || ""} · ${state.tab === "strategy" ? "Estrategia" : "Sistema Comercial"}`;
  }
  if (body) body.innerHTML = renderAccordion(block);

  const drawer = $("#drawer");
  if (drawer) {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
  }

  if (body) wireAccordion(body);

  const closeBtn = $("#drawerClose");
  if (closeBtn) closeBtn.focus();
}

function renderSurveyButton(block, subId) {
  const file = block?.surveys?.[subId];

  if (file) {
    return `
      <a
        class="btn btn-survey active"
        href="${escapeAttr(file)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Encuesta
      </a>
    `;
  }

  return `
    <button
      class="btn btn-survey disabled"
      type="button"
      disabled
    >
      Encuesta
    </button>
  `;
}

function closeDrawer() {
  const drawer = $("#drawer");
  if (!drawer) return;

  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  state.openBlockId = null;

  const activeTab = $(".tab.is-active");
  if (activeTab) activeTab.focus();
}

function initDrawer() {
  if (drawerInitialized) return;
  drawerInitialized = true;

  $("#drawerClose")?.addEventListener("click", closeDrawer);
  $("#drawerBackdrop")?.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
}

/* -----------------------
   Accordion render + wiring
------------------------ */
function renderAccordion(block) {
  const store = loadStore();
  const subs = block.subs || [];

  if (subs.length === 0) {
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
    const status = getSubStatus(node);

    return `
      <div class="acc-item module-${status}" data-sub="${escapeAttr(subKey)}" data-block="${escapeAttr(block.id)}">
        <button class="acc-header" type="button">
          <span class="acc-title">${escapeHtml(subLabel)}</span>
          <span class="acc-count">${cnt}</span>
        </button>

        <div class="acc-body">
          <div class="row-actions">
            ${renderModuleControls(block.id, subKey, node)}
            <button class="btn" type="button" data-action="upload">Subir documento</button>
            <button class="btn" type="button" data-action="link">Agregar link</button>
            <button class="btn" type="button" data-action="note-open">Agregar nota</button>
            ${renderSurveyButton(block, sub.id)}
          </div>

          <input class="file-input" type="file" style="display:none" />

          <div class="note-compose" style="display:none; margin-top:10px;">
            <textarea
              class="note-new-text"
              rows="4"
              style="width:100%; border-radius:14px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.05); color:inherit; padding:10px; resize:vertical;"
              placeholder="Escribí una nota..."
            ></textarea>
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

function wireAccordion(root) {
  $$(".acc-header", root).forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".acc-item");
      item?.classList.toggle("is-open");
    });
  });

  root.addEventListener("click", (e) => {
    const actionBtn = e.target.closest("button[data-action]");
    if (!actionBtn) return;

    const item = actionBtn.closest(".acc-item");
    const subKey = item?.getAttribute("data-sub");
    const realBlockId = item?.getAttribute("data-block");
    if (!item || !subKey || !realBlockId) return;

    const action = actionBtn.getAttribute("data-action");

    if (action === "upload") {
      onUpload(realBlockId, subKey, item);
      return;
    }

    if (action === "link") {
      onAddLink(realBlockId, subKey, item);
      return;
    }

    if (action === "note-open") {
      const box = $(".note-compose", item);
      if (box) box.style.display = "block";
      const ta = $(".note-new-text", item);
      if (ta) ta.focus();
      return;
    }

    if (action === "note-cancel-new") {
      const box = $(".note-compose", item);
      if (box) box.style.display = "none";
      const ta = $(".note-new-text", item);
      if (ta) ta.value = "";
      return;
    }

    if (action === "note-save-new") {
      const ta = $(".note-new-text", item);
      const text = (ta?.value || "").trim();
      if (!text) return;

      saveNote(realBlockId, subKey, text)
        .then((saved) => {
          const store = loadStore();
          const node = ensureSubNode(store, realBlockId, subKey);

          node.notes.unshift({
            text,
            ts: Date.now(),
            remoteId: saved?.id || null
          });

          resetModuleDone(store, realBlockId, subKey);
          saveStore(store);

          if (ta) ta.value = "";
          const box = $(".note-compose", item);
          if (box) box.style.display = "none";

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
    if (!item) return;

    const subKey = item.getAttribute("data-sub");
    const realBlockId = item.getAttribute("data-block");
    if (!subKey || !realBlockId) return;

    const btnEdit = e.target.closest("[data-note-edit]");
    if (btnEdit) {
      const idx = Number(btnEdit.getAttribute("data-note-edit"));
      const view = item.querySelector(`[data-note-view="${idx}"]`);
      const box = item.querySelector(`[data-note-editbox="${idx}"]`);
      if (view) view.style.display = "none";
      if (box) box.style.display = "block";
      const ta = box?.querySelector("textarea");
      if (ta) ta.focus();
      return;
    }

    const btnCancel = e.target.closest("[data-note-cancel]");
    if (btnCancel) {
      const idx = Number(btnCancel.getAttribute("data-note-cancel"));
      const view = item.querySelector(`[data-note-view="${idx}"]`);
      const box = item.querySelector(`[data-note-editbox="${idx}"]`);
      if (box) box.style.display = "none";
      if (view) view.style.display = "block";
      refreshSubUI(realBlockId, subKey, item);
      return;
    }

    const btnSave = e.target.closest("[data-note-save]");
    if (btnSave) {
      const idx = Number(btnSave.getAttribute("data-note-save"));
      const box = item.querySelector(`[data-note-editbox="${idx}"]`);
      const ta = box?.querySelector("textarea");
      const text = (ta?.value || "").trim();
      if (!text) return;

      const store = loadStore();
      const node = ensureSubNode(store, realBlockId, subKey);

      if (node.notes?.[idx]) node.notes[idx].text = text;

      resetModuleDone(store, realBlockId, subKey);
      saveStore(store);

      refreshSubUI(realBlockId, subKey, item);
      return;
    }
  });

  root.addEventListener("click", (e) => {
    const delBtn = e.target.closest("[data-del]");
    if (!delBtn) return;

    const item = delBtn.closest(".acc-item");
    const subKey = item?.getAttribute("data-sub");
    const realBlockId = item?.getAttribute("data-block");
    if (!item || !subKey || !realBlockId) return;

    const type = delBtn.getAttribute("data-del");
    const index = Number(delBtn.getAttribute("data-index"));

    const store = loadStore();
    const node = ensureSubNode(store, realBlockId, subKey);

    if (type === "note") node.notes.splice(index, 1);
    if (type === "link") node.links.splice(index, 1);
    if (type === "file") node.files.splice(index, 1);

    resetModuleDone(store, realBlockId, subKey);
    saveStore(store);

    refreshSubUI(realBlockId, subKey, item);
  });
}

function onAddLink(blockId, subKey, accItem) {
  const url = prompt("Pegá la URL del link:");
  if (!url || !url.trim()) return;

  const title = prompt("Título del link (opcional):") || "";

  const store = loadStore();
  const node = ensureSubNode(store, blockId, subKey);

  node.links.unshift({
    url: url.trim(),
    title: title.trim(),
    ts: Date.now()
  });

  resetModuleDone(store, blockId, subKey);
  saveStore(store);

  refreshSubUI(blockId, subKey, accItem);
}

function onUpload(blockId, subKey, accItem) {
  const input = $(".file-input", accItem);
  if (!input) return;

  input.value = "";

  input.onchange = async () => {
    const f = input.files?.[0];
    if (!f) return;

    console.log("Archivo seleccionado:", {
      name: f.name,
      type: f.type,
      size: f.size,
      blockId,
      subKey
    });

    try {
      const saved = await uploadFileToStorage(f, blockId, subKey);
      console.log("Archivo guardado en Supabase:", saved);

      const store = loadStore();
      const node = ensureSubNode(store, blockId, subKey);

      node.files.unshift({
        name: f.name,
        size: f.size,
        ts: Date.now(),
        remoteId: saved?.id || null,
        url: saved?.file_url || "",
        path: saved?.file_path || ""
      });

      resetModuleDone(store, blockId, subKey);
      saveStore(store);

      refreshSubUI(blockId, subKey, accItem);
    } catch (err) {
      console.error("UPLOAD ERROR FULL:", err);
      alert(err?.message || "No se pudo subir el archivo.");
    }
  };

  input.click();
}

function refreshSubUI(blockId, subKey, accItem) {
  const store = loadStore();
  const node = ensureSubNode(store, blockId, subKey);
  const status = getSubStatus(node);

  const cntEl = $(".acc-count", accItem);
  if (cntEl) cntEl.textContent = String(countItems(node));

  const miniEl = $(".mini", accItem);
  if (miniEl) miniEl.innerHTML = renderMiniList(node);

  accItem.classList.remove("module-empty", "module-working", "module-done");
  accItem.classList.add(`module-${status}`);

  const controlsHost = $(".row-actions", accItem);
  if (controlsHost) {
    const oldControls = $(".module-controls", controlsHost);
    if (oldControls) oldControls.remove();
    controlsHost.insertAdjacentHTML("afterbegin", renderModuleControls(blockId, subKey, node));
  }

  renderWorkspaceProgress();
  render();
  rerenderOpenDrawer();
}

function renderMiniList(node) {
  const notes = node?.notes || [];
  const links = node?.links || [];
  const files = node?.files || [];

  if (notes.length + links.length + files.length === 0) {
    return "Sin contenido cargado";
  }

  const parts = [];

  const delBtn = (type, index) =>
    `<button data-del="${type}" data-index="${index}"
      style="margin-left:8px; font-size:11px; opacity:.7; cursor:pointer; border:0; background:none; color:#ff6b6b;">✕</button>`;

  const editBtn = (index) =>
    `<button data-note-edit="${index}"
      style="margin-left:8px; font-size:11px; opacity:.7; cursor:pointer; border:0; background:none; color:rgba(255,255,255,.8); text-decoration:underline;">Editar</button>`;

  if (notes.length) {
    parts.push(`<div style="margin-bottom:6px;"><span style="opacity:.8">Notas</span></div>`);

    const li = notes.map((n, i) => {
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

  if (links.length) {
    parts.push(`<div style="margin-bottom:6px;"><span style="opacity:.8">Links</span></div>`);

    const li = links.map((l, i) => {
      const label = l.title ? escapeHtml(trunc(l.title, 60)) : escapeHtml(trunc(l.url, 60));
      const href = escapeAttr(l.url);

      return [
        `<li>`,
        `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:inherit; text-decoration:underline; opacity:.9;">`,
        label,
        `</a>`,
        delBtn("link", i),
        `</li>`
      ].join("");
    }).join("");

    parts.push(`<ul style="margin:0 0 10px 16px; padding:0;">${li}</ul>`);
  }

  if (files.length) {
    parts.push(`<div style="margin-bottom:6px;"><span style="opacity:.8">Archivos</span></div>`);

    const li = files.map((f, i) => {
      const label = escapeHtml(trunc(f.name, 60));
      const href = f.url ? escapeAttr(f.url) : null;

      return [
        `<li>`,
        href
          ? `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:inherit; text-decoration:underline; opacity:.9;">${label}</a>`
          : label,
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
function trunc(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll("`", "&#096;");
}

/* -----------------------
   Auth
------------------------ */
async function sendMagicLink() {
  const btn = $("#btnMagicLink");
  const email = ($("#loginEmail")?.value || "").trim().toLowerCase();
  if (!email) return;

  if (sendingMagicLink) {
    $("#authMsg").textContent = "Esperá unos segundos antes de volver a solicitar el link.";
    return;
  }

  sendingMagicLink = true;
  saveLastLoginEmail(email);

  if (btn) btn.disabled = true;
  $("#authMsg").textContent = "Enviando link...";

  try {
    const { data, error } = await sb.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    console.log("signInWithOtp result:", { email, data, error });

    $("#authMsg").textContent = error
      ? `No se pudo enviar el link: ${error.message || "error desconocido"}`
      : "Te enviamos un link de acceso.";
  } catch (e) {
    console.error("sendMagicLink crash:", e);
    $("#authMsg").textContent = `Fallo inesperado: ${e?.message || e}`;
  } finally {
    window.setTimeout(() => {
      sendingMagicLink = false;
      if (btn) btn.disabled = false;
    }, 60000);
  }
}

async function getSessionUser() {
  try {
    const { data, error } = await sb.auth.getSession();
    if (error) {
      console.error("getSessionUser error:", error);
      return null;
    }
    return data?.session?.user || null;
  } catch (e) {
    console.error("getSessionUser crash:", e);
    return null;
  }
}

async function isAuthorizedUser(email) {
  const normalizedEmail = (email || "").trim().toLowerCase();

  const { data, error } = await sb
    .from("workspace_members")
    .select("email,is_active")
    .eq("email", normalizedEmail)
    .eq("is_active", true)
    .maybeSingle();

  console.log("isAuthorizedUser:", { normalizedEmail, data, error });

  if (error) {
    console.error("workspace_members auth error:", error);
    return false;
  }

  return !!data;
}

async function applyAuthGate() {
  if (authGateRunning) return false;
  authGateRunning = true;

  try {
    const user = await getSessionUser();

    if (!user?.email) {
      $("#authBox").style.display = "block";
      $("#appShell").style.display = "none";
      $("#sessionPill").textContent = "Sesión: sin iniciar";
      loginLoggedForSession = false;
      return false;
    }

    const allowed = await isAuthorizedUser(user.email.toLowerCase());

    if (!allowed) {
      $("#authBox").style.display = "block";
      $("#appShell").style.display = "none";
      $("#authMsg").textContent = "Tu email no está autorizado para este workspace.";
      $("#sessionPill").textContent = `Sesión: ${user.email}`;
      loginLoggedForSession = false;
      return false;
    }

    if (!loginLoggedForSession) {
      await logWorkspaceLogin(user);
      loginLoggedForSession = true;
    }

    $("#authBox").style.display = "none";
    $("#appShell").style.display = "block";
    $("#sessionPill").textContent = `Sesión: ${user.email}`;
    return true;
  } catch (e) {
    console.error("applyAuthGate crash:", e);
    return false;
  } finally {
    authGateRunning = false;
  }
}

/* -----------------------
   App init
------------------------ */
function initApp() {
  if (appInitialized) return;
  appInitialized = true;

  initSelectors();
  initTabs();
  initDrawer();
}

async function boot() {
  $("#btnMagicLink")?.addEventListener("click", sendMagicLink);
  initLoginEmailSuggestion();

  const ok = await applyAuthGate();
  if (!ok) return;

  initApp();
  renderAll();
}

boot();

sb.auth.onAuthStateChange(async (event) => {
  console.log("auth state change:", event);

  if (event === "SIGNED_OUT") {
    loginLoggedForSession = false;
  }

  const ok = await applyAuthGate();
  if (ok) {
    initApp();
    renderAll();
  }
});
