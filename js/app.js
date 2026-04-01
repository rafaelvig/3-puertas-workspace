const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const state = {
  tab: "strategy",
  companyId: null,
  channelId: null,
  openBlockId: null,
  moduleStatusMap: {}
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
  if (!lastEmail) return;

  input.value = lastEmail;
  datalist.innerHTML = `<option value="${escapeAttr(lastEmail)}"></option>`;
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
   Local state (solo UI)
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
  store[blockId][subKey] = store[blockId][subKey] || {};

  const node = store[blockId][subKey];
  node.done = typeof node.done === "boolean" ? node.done : false;
  node.reviewedAt = node.reviewedAt || null;

  return node;
}

function resetModuleDone(store, blockId, subKey) {
  const node = ensureSubNode(store, blockId, subKey);
  node.done = false;
  node.reviewedAt = null;
}

/* -----------------------
   Supabase content
------------------------ */
async function loadWorkspace(blockId, subtopic) {
  console.log("loadWorkspace START", {
    blockId,
    subtopic,
    companyId: state.companyId,
    channelId: state.channelId
  });

  if (!state.companyId || !state.channelId) {
    console.warn("loadWorkspace sin companyId/channelId", { blockId, subtopic, state });
    return [];
  }

  // 🔴 FIX CRÍTICO: asegurar sesión viva
  const { data: sessionData } = await sb.auth.getSession();

  if (!sessionData?.session) {
    console.warn("No session activa, intentando refresh...");
    await sb.auth.refreshSession();
  }

  const query = sb
    .from("workspace_items")
    .select("*")
    .eq("company_id", state.companyId)
    .eq("channel_id", state.channelId)
    .eq("block_id", blockId)
    .eq("subtopic", subtopic)
    .order("created_at", { ascending: false });

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Supabase timeout")), 8000)
  );

  try {
    const res = await Promise.race([query, timeout]);

    const data = res?.data || [];
    const error = res?.error || null;

    console.log("loadWorkspace END", {
      blockId,
      subtopic,
      rows: data.length,
      error
    });

    if (error) {
      console.error("loadWorkspace error:", error);
      return [];
    }

    return data;
  } catch (e) {
    console.error("loadWorkspace TIMEOUT", { blockId, subtopic, error: e.message });
    return [];
  }
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
      type: "note",
      content: cleanText
    })
    .select()
    .single();

  if (error) {
    console.error("saveNote error:", error);
    throw error;
  }

  return data || null;
}

async function saveLink(blockId, subtopic, url) {
  let cleanUrl = (url || "").trim();
  if (!cleanUrl) return null;

  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = "https://" + cleanUrl;
  }

  const { data, error } = await sb
    .from("workspace_items")
    .insert({
      company_id: state.companyId,
      channel_id: state.channelId,
      block_id: blockId,
      subtopic,
      type: "link",
      content: cleanUrl
    })
    .select()
    .single();

  if (error) {
    console.error("saveLink error:", error);
    throw error;
  }

  return data || null;
}

async function updateWorkspaceNoteRemote(remoteId, text) {
  const cleanText = (text || "").trim();
  if (!remoteId) throw new Error("Falta remoteId");
  if (!cleanText) throw new Error("Texto vacío");

  const { data, error } = await sb
    .from("workspace_items")
    .update({ content: cleanText })
    .eq("id", remoteId)
    .select()
    .single();

  if (error) {
    console.error("updateWorkspaceNoteRemote error:", error);
    throw error;
  }

  return data || null;
}

function moduleStatusKey(blockId, subKey) {
  return `${state.companyId}::${state.channelId}::${blockId}::${subKey}`;
}

async function refreshModuleStatusMap() {
  const { data, error } = await sb
    .from("workspace_module_status")
    .select("block_id, subtopic, status, reviewed_at, reviewed_by")
    .eq("company_id", state.companyId)
    .eq("channel_id", state.channelId);

  if (error) {
    console.error("refreshModuleStatusMap error:", error);
    state.moduleStatusMap = {};
    return {};
  }

  const map = {};
  (data || []).forEach(row => {
    map[moduleStatusKey(row.block_id, row.subtopic)] = row;
  });

  state.moduleStatusMap = map;
  return map;
}

function getModuleStatusRecord(blockId, subKey) {
  return state.moduleStatusMap[moduleStatusKey(blockId, subKey)] || null;
}

async function setModuleStatusRemote(blockId, subKey, status) {
  const user = await getSessionUser();

  const payload = {
    company_id: state.companyId,
    channel_id: state.channelId,
    block_id: blockId,
    subtopic: subKey,
    status,
    reviewed_at: status === "done" ? new Date().toISOString() : null,
    reviewed_by: status === "done" ? user?.id || null : null,
    updated_at: new Date().toISOString()
  };

  const { error } = await sb
    .from("workspace_module_status")
    .upsert(payload, {
      onConflict: "company_id,channel_id,block_id,subtopic"
    });

  if (error) {
    console.error("setModuleStatusRemote error:", error);
    throw error;
  }

  await refreshModuleStatusMap();
}

async function reopenModuleStatus(blockId, subKey) {
  await setModuleStatusRemote(blockId, subKey, "working");
}


async function uploadFileToStorage(file, blockId, subKey, itemType = "file") {
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

  const payload = {
    company_id: state.companyId,
    channel_id: state.channelId,
    block_id: blockId,
    subtopic: subKey,
    type: itemType,
    content: file.name,
    file_path: path,
    file_url: signedData?.signedUrl || null,
    created_by: user.id
  };

  const { data, error: insertError } = await sb
    .from("workspace_items")
    .insert(payload)
    .select()
    .single();

  if (insertError) throw insertError;

  return data;
}

async function deleteWorkspaceItemRemote(entry) {
  if (!entry?.remoteId) {
    throw new Error("Falta remoteId en el item a eliminar.");
  }

  if (entry.path) {
    const { error: storageError } = await sb
      .storage
      .from("workspace-files")
      .remove([entry.path]);

    if (storageError) {
      console.error("storage remove error:", storageError);
      throw storageError;
    }
  }

  const { error: rowError } = await sb
    .from("workspace_items")
    .delete()
    .eq("id", entry.remoteId);

  if (rowError) {
    console.error("workspace_items delete error:", rowError);
    throw rowError;
  }
}

/* -----------------------
   Build view model
------------------------ */
function buildNodeFromWorkspaceItems(items, localNode = {}) {
  const node = {
    notes: [],
    links: [],
    files: [],
    theory: [],
    surveys: Array.isArray(localNode?.surveys) ? localNode.surveys : [],
    done: typeof localNode?.done === "boolean" ? localNode.done : false,
    reviewedAt: localNode?.reviewedAt || null
  };

  (items || []).forEach((row) => {
    if (row.type === "note") {
      node.notes.push({
        text: row.content || "",
        ts: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
        remoteId: row.id
      });
      return;
    }

    if (row.type === "link") {
      node.links.push({
        url: row.content || "",
        ts: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
        remoteId: row.id
      });
      return;
    }

    if (row.type === "file") {
      node.files.push({
        name: row.content || "Archivo",
        ts: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
        remoteId: row.id,
        url: row.file_url || "",
        path: row.file_path || ""
      });
      return;
    }

    if (row.type === "theory") {
      node.theory.push({
        name: row.content || "Material teórico",
        ts: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
        remoteId: row.id,
        url: row.file_url || "",
        path: row.file_path || ""
      });
    }
  });

  return node;
}

function countItems(node) {
  return (
    (node?.notes?.length || 0) +
    (node?.links?.length || 0) +
    (node?.files?.length || 0) +
    (node?.theory?.length || 0) +
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

/* -----------------------
   Progress
------------------------ */
async function toggleModuleDone(blockId, subKey) {
  const current = getModuleStatusRecord(blockId, subKey);
  const nextStatus = current?.status === "done" ? "working" : "done";

  await setModuleStatusRemote(blockId, subKey, nextStatus);
  await renderAll();
}

function getAllModules() {
  const modules = [];
  const blocks = window.WS_CONFIG?.planes?.[state.tab] || [];

  blocks.forEach(block => {
    (block.subs || []).forEach(sub => {
      const record = getModuleStatusRecord(block.id, sub.id);

      modules.push({
        blockId: block.id,
        subKey: sub.id,
        status: record?.status || "empty"
      });
    });
  });

  return modules;
}

function getWorkspaceProgress() {
  const modules = getAllModules();
  const total = modules.length;

  const done = modules.filter(m => m.status === "done").length;
  const working = modules.filter(m => m.status === "working").length;
  const empty = modules.filter(m => m.status === "empty").length;

  const percent = total ? Math.round((done / total) * 100) : 0;

  let traffic = "red";
  if (percent >= 80) traffic = "green";
  else if (percent >= 35) traffic = "yellow";

  return { total, done, working, empty, percent, traffic };
}

function getBlockProgress(block) {
  const subs = block?.subs || [];
  const total = subs.length;

  if (!total) {
    return { total: 0, completed: 0, percent: 0 };
  }

  let completed = 0;

  subs.forEach(sub => {
    const record = getModuleStatusRecord(block.id, sub.id);
    if (record?.status === "done") completed++;
  });

  return {
    total,
    completed,
    percent: Math.round((completed / total) * 100)
  };
}

async function renderWorkspaceProgress() {
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

/* -----------------------
   UI init
------------------------ */
function initSelectors() {
  const companies = window.WS_CONFIG?.companies || [];
  const selCompany = $("#selCompany");
  if (!selCompany) return;

  selCompany.innerHTML = companies
    .map(c => `<option value="${escapeAttr(c.id)}">${escapeHtml(c.name)}</option>`)
    .join("");

  state.companyId = companies[0]?.id || null;

  selCompany.addEventListener("change", async () => {
    state.companyId = selCompany.value;
    syncChannels();
    updateClientLogo();
    closeDrawer();
    await renderAll();
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

  selChannel.onchange = async () => {
    state.channelId = selChannel.value;
    closeDrawer();
    await renderAll();
  };
}

function updateClientLogo() {
  const logos = {
    monumento: "img/logo-monumento.svg"
  };

  const el = $("#clientLogo");
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
    btn.addEventListener("click", async () => {
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

      closeDrawer();
      await renderAll();
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

  if (!grid.dataset.bound) {
    grid.dataset.bound = "1";

    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;

      const id = card.dataset.id;
      if (!id) return;

      openDrawer(id);
    });
  }

  highlightActiveCard();
}

async function rerenderOpenDrawer() {
  if (!state.openBlockId) return;
  await openDrawer(state.openBlockId);
}

async function renderAll() {
  await refreshModuleStatusMap();
  render();
  rerenderOpenDrawer().catch(err => console.error("rerenderOpenDrawer error:", err));
  renderWorkspaceProgress().catch(err => console.error("renderWorkspaceProgress error:", err));
}

/* -----------------------
   Drawer / detail
------------------------ */
async function openDrawer(blockId) {
  const items = window.WS_CONFIG?.planes?.[state.tab] || [];
  const block = items.find(x => x.id === blockId);
  if (!block) return;

  state.openBlockId = blockId;

  const company = window.WS_CONFIG?.companies?.find(c => c.id === state.companyId);
  const channel = (company?.channels || []).find(ch => ch.id === state.channelId);
  const panel = $("#detailPanelInner");
  if (!panel) return;

  panel.innerHTML = `
    <div class="detail-head">
      <div class="detail-title">${escapeHtml(block.title)}</div>
      <div class="detail-meta">
        ${escapeHtml(company?.name || "")} · ${escapeHtml(channel?.name || "")} · ${state.tab === "strategy" ? "Estrategia" : "Sistema Comercial"}
      </div>
    </div>
    <div class="mini">Cargando...</div>
  `;

  try {
    console.log("openDrawer before renderAccordion", block.id);
    const accordionHtml = await renderAccordion(block);
    console.log("openDrawer after renderAccordion", block.id, accordionHtml?.length);

    panel.innerHTML = `
      <div class="detail-head">
        <div class="detail-title">${escapeHtml(block.title)}</div>
        <div class="detail-meta">
          ${escapeHtml(company?.name || "")} · ${escapeHtml(channel?.name || "")} · ${state.tab === "strategy" ? "Estrategia" : "Sistema Comercial"}
        </div>
      </div>
      ${accordionHtml}
    `;

    wireAccordion(panel);
    highlightActiveCard();
  } catch (err) {
    console.error("openDrawer error:", err);
    panel.innerHTML = `
      <div class="detail-head">
        <div class="detail-title">${escapeHtml(block.title)}</div>
        <div class="detail-meta">
          ${escapeHtml(company?.name || "")} · ${escapeHtml(channel?.name || "")} · ${state.tab === "strategy" ? "Estrategia" : "Sistema Comercial"}
        </div>
      </div>
      <div class="mini">Error al cargar este bloque.</div>
    `;
  }
}
function closeDrawer() {
  state.openBlockId = null;

  const panel = $("#detailPanelInner");
  if (panel) {
    panel.innerHTML = `<div class="detail-empty">Seleccioná un bloque para ver el detalle.</div>`;
  }

  highlightActiveCard();

  const activeTab = $(".tab.is-active");
  if (activeTab) activeTab.focus();
}

function initDrawer() {
  if (drawerInitialized) return;
  drawerInitialized = true;

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
}

function highlightActiveCard() {
  $$(".card").forEach(card => {
    card.classList.toggle("is-active", card.dataset.id === state.openBlockId);
  });
}

function renderSurveyButton(block, subId) {
  const file = block?.surveys?.[subId];
  if (!file) {
    return `
      <button class="btn btn-survey disabled" type="button" disabled>
        Encuesta
      </button>
    `;
  }

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

async function renderAccordion(block) {
  console.log("renderAccordion START", block.id);

  const store = loadStore();
  const subs = block.subs || [];

  if (subs.length === 0) {
    console.log("renderAccordion sin subs", block.id);
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

  const htmlParts = await Promise.all(
    subs.map(async (sub) => {
      try {
        console.log("renderAccordion SUB START", block.id, sub.id);

        const subKey = sub.id;
        const subLabel = sub.id ? `${sub.id}) ${sub.name}` : sub.name;

        const localNode = ensureSubNode(store, block.id, subKey);
        const remoteItems = await loadWorkspace(block.id, subKey);
        const node = buildNodeFromWorkspaceItems(remoteItems, localNode);

        const statusRecord = getModuleStatusRecord(block.id, subKey);
        node.done = statusRecord?.status === "done";
        node.reviewedAt = statusRecord?.reviewed_at || null;

        const cnt = countItems(node);
        const status = getSubStatus(node);

        console.log("renderAccordion SUB END", block.id, sub.id);

        return `
          <div class="acc-item module-${status}" data-sub="${escapeAttr(subKey)}" data-block="${escapeAttr(block.id)}">
            <button class="acc-header" type="button">
              <span class="acc-title">${escapeHtml(subLabel)}</span>
              <span class="acc-count">${cnt}</span>
            </button>

            <div class="acc-body">
              <div class="row-actions">
                ${renderModuleControls(block.id, subKey, node)}
                <button class="btn btn-doc" type="button" data-action="upload">Subir documento</button>
                <button class="btn btn-theory" type="button" data-action="upload-theory">Subir material teórico</button>
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
      } catch (err) {
        console.error("renderAccordion error:", block.id, sub.id, err);
        return `
          <div class="acc-item is-open">
            <div class="acc-body" style="display:block;">
              <div class="mini">Error en este módulo</div>
            </div>
          </div>
        `;
      }
    })
  );

  console.log("renderAccordion END", block.id);

  return `<div class="accordion">${htmlParts.join("")}</div>`;
}

/* -----------------------
   Wiring
------------------------ */
function wireAccordion(root) {
  if (!root) return;

  $$(".acc-header", root).forEach(btn => {
    if (btn.dataset.wiredHeader === "1") return;

    btn.addEventListener("click", () => {
      const item = btn.closest(".acc-item");
      item?.classList.toggle("is-open");
    });

    btn.dataset.wiredHeader = "1";
  });

  if (root.dataset.wiredDelegates === "1") return;
  root.dataset.wiredDelegates = "1";

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

    if (action === "upload-theory") {
      onUploadTheory(realBlockId, subKey, item);
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
    .then(async () => {
      await reopenModuleStatus(realBlockId, subKey);

      if (ta) ta.value = "";
      const box = $(".note-compose", item);
      if (box) box.style.display = "none";

      await refreshSubUI(realBlockId, subKey, item);
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

      const view = item.querySelector(`[data-note-view="${idx}"]`);
      const remoteId = view?.getAttribute("data-remote-id") || null;

      if (!remoteId) {
        alert("Esta nota no tiene identificador remoto para actualizarse.");
        return;
      }

      updateWorkspaceNoteRemote(remoteId, text)
        .then(async () => {
     await reopenModuleStatus(realBlockId, subKey);
await refreshSubUI(realBlockId, subKey, item);
        })
        .catch(err => {
          console.error("note update error:", err);
          alert("No se pudo actualizar la nota.");
        });

      return;
    }
  });

  root.addEventListener("click", async (e) => {
    const delBtn = e.target.closest("[data-del]");
    if (!delBtn) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const item = delBtn.closest(".acc-item");
    const subKey = item?.getAttribute("data-sub");
    const realBlockId = item?.getAttribute("data-block");
    if (!item || !subKey || !realBlockId) return;

    const type = delBtn.getAttribute("data-del");
    const index = Number(delBtn.getAttribute("data-index"));

    const remoteItems = await loadWorkspace(realBlockId, subKey);
    const localNode = ensureSubNode(loadStore(), realBlockId, subKey);
    const node = buildNodeFromWorkspaceItems(remoteItems, localNode);

    let entry = null;
    if (type === "note") entry = node.notes?.[index];
    if (type === "link") entry = node.links?.[index];
    if (type === "file") entry = node.files?.[index];
    if (type === "theory") entry = node.theory?.[index];

    if (!entry) {
      entry = {
        remoteId: delBtn.getAttribute("data-remote-id") || null,
        path: delBtn.getAttribute("data-path") || "",
        name: delBtn.getAttribute("data-name") || "",
        url: delBtn.getAttribute("data-name") || "",
        text: delBtn.getAttribute("data-name") || ""
      };
    }

    if (!entry?.remoteId) {
      console.warn("DELETE WITHOUT REMOTE ID", { type, index, entry });
      alert("Este elemento no se puede eliminar porque no tiene identificador válido.");
      return;
    }

    try {
      await deleteWorkspaceItemRemote(entry);

   await reopenModuleStatus(realBlockId, subKey);
await refreshSubUI(realBlockId, subKey, item);
    } catch (err) {
      console.error("delete item error:", err);
      alert("No se pudo eliminar el documento.");
    }
  });
}

/* -----------------------
   Actions
------------------------ */
async function onAddLink(blockId, subKey, accItem) {
  const url = prompt("Pegá la URL del link:");
  if (!url || !url.trim()) return;

  try {
    await saveLink(blockId, subKey, url);
    await reopenModuleStatus(blockId, subKey);
    await refreshSubUI(blockId, subKey, accItem);
  } catch (err) {
    console.error("onAddLink error:", err);
    alert("No se pudo guardar el link.");
  }
}

function onUpload(blockId, subKey, accItem) {
  const input = $(".file-input", accItem);
  if (!input) return;

  input.value = "";

  input.onchange = async () => {
    const f = input.files?.[0];
    if (!f) return;

    try {
      await uploadFileToStorage(f, blockId, subKey, "file");

await reopenModuleStatus(blockId, subKey);
await refreshSubUI(blockId, subKey, accItem);
    } catch (err) {
      console.error("UPLOAD ERROR FULL:", err);
      alert(err?.message || JSON.stringify(err) || "No se pudo subir el archivo.");
    }
  };

  input.click();
}

function onUploadTheory(blockId, subKey, accItem) {
  const input = $(".file-input", accItem);
  if (!input) return;

  input.value = "";

  input.onchange = async () => {
    const f = input.files?.[0];
    if (!f) return;

    try {
      await uploadFileToStorage(f, blockId, subKey, "theory");
      await reopenModuleStatus(blockId, subKey);
      await refreshSubUI(blockId, subKey, accItem);
    } catch (err) {
      console.error("UPLOAD THEORY ERROR FULL:", err);
      alert(err?.message || JSON.stringify(err) || "No se pudo subir el material teórico.");
    }
  };

  input.click();
}

async function refreshSubUI(blockId, subKey, accItem) {
  const store = loadStore();
  const localNode = ensureSubNode(store, blockId, subKey);
  const remoteItems = await loadWorkspace(blockId, subKey);
  const node = buildNodeFromWorkspaceItems(remoteItems, localNode);
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

  await renderWorkspaceProgress();
  render();
  await rerenderOpenDrawer();
}

/* -----------------------
   Render mini list
------------------------ */
function renderMiniList(node) {
  const notes = node?.notes || [];
  const links = node?.links || [];
  const files = node?.files || [];
  const theory = node?.theory || [];

  if (notes.length + links.length + files.length + theory.length === 0) {
    return "Sin contenido cargado";
  }

  const parts = [];

  const delBtn = (type, index, entry = {}) =>
    `<button
      type="button"
      data-del="${type}"
      data-index="${index}"
      data-remote-id="${escapeAttr(entry.remoteId || "")}"
      data-path="${escapeAttr(entry.path || "")}"
      data-name="${escapeAttr(entry.name || entry.url || entry.text || "")}"
      style="margin-left:8px;font-size:11px;opacity:.7;cursor:pointer;border:0;background:none;color:#ff6b6b;"
    >✕</button>`;

  const editBtn = (index) =>
    `<button data-note-edit="${index}"
      style="margin-left:8px;font-size:11px;opacity:.7;cursor:pointer;border:0;background:none;color:rgba(255,255,255,.8);text-decoration:underline;">Editar</button>`;

  if (notes.length) {
    parts.push(`<div class="mini-section-title"><span>Notas</span></div>`);

    const li = notes.map((n, i) => {
      const textView = escapeHtml(trunc(n.text, 300));
      const textEdit = escapeHtml(n.text);

      return [
        `<li style="margin-bottom:8px;">`,
        `<div class="note-view" data-note-view="${i}" data-remote-id="${escapeAttr(n.remoteId || "")}">`,
        textView,
        editBtn(i),
        delBtn("note", i, n),
        `</div>`,
        `<div class="note-edit" data-note-editbox="${i}" style="display:none;margin-top:8px;">`,
        `<textarea rows="4"
          style="width:100%;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:inherit;padding:10px;resize:vertical;">`,
        textEdit,
        `</textarea>`,
        `<div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;">`,
        `<button class="btn" type="button" data-note-save="${i}">Guardar</button>`,
        `<button class="btn" type="button" data-note-cancel="${i}">Cancelar</button>`,
        `</div>`,
        `</div>`,
        `</li>`
      ].join("");
    }).join("");

    parts.push(`<ul class="mini-list">${li}</ul>`);
  }

  if (links.length) {
    parts.push(`<div class="mini-section-title"><span>Links</span></div>`);

    const li = links.map((l, i) => {
      const href = escapeAttr(l.url);
      const label = escapeHtml(trunc(l.url, 60));

      return [
        `<li>`,
        `<a href="${href}" target="_blank" rel="noopener noreferrer"
          style="text-decoration:underline;opacity:.9;color:#ffffff;">`,
        label,
        `</a>`,
        delBtn("link", i, l),
        `</li>`
      ].join("");
    }).join("");

    parts.push(`<ul class="mini-list">${li}</ul>`);
  }

  if (files.length) {
    parts.push(`<div class="mini-section-title"><span>Archivos</span></div>`);

    const li = files.map((f, i) => {
      const label = escapeHtml(trunc(f.name, 60));
      const href = f.url ? escapeAttr(f.url) : null;

      return [
        `<li>`,
        href
          ? `<a href="${href}" target="_blank" rel="noopener noreferrer"
              style="text-decoration:underline;opacity:.9;">${label}</a>`
          : label,
        delBtn("file", i, f),
        `</li>`
      ].join("");
    }).join("");

    parts.push(`<ul class="mini-list files">${li}</ul>`);
  }

  if (theory.length) {
    parts.push(`<div class="mini-section-title"><span>Material teórico</span></div>`);

    const li = theory.map((f, i) => {
      const label = escapeHtml(trunc(f.name, 60));
      const href = f.url ? escapeAttr(f.url) : null;

      return [
        `<li class="mini-theory-item">`,
        `<span class="mini-badge mini-badge-theory">Clase</span>`,
        href
          ? `<a href="${href}" target="_blank" rel="noopener noreferrer"
              style="text-decoration:underline;opacity:.95;">${label}</a>`
          : label,
        delBtn("theory", i, f),
        `</li>`
      ].join("");
    }).join("");

    parts.push(`<ul class="mini-list theory">${li}</ul>`);
  }

  return parts.join("");
}

/* -----------------------
   Utils
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

async function logoutWorkspace() {
  try {
    const { error } = await sb.auth.signOut();

    if (error) {
      console.warn("signOut falló, forzando limpieza local", error);
    }

  } catch (err) {
    console.warn("Excepción en signOut, forzando limpieza", err);
  }

  // limpieza forzada (evita estados inconsistentes)
  localStorage.removeItem("workspace_last_email");
  sessionStorage.clear();

  window.location.href = window.location.origin + window.location.pathname;
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("#btnLogout");
  if (!btn) return;

  console.log("click logout detectado");
  await logoutWorkspace();
});


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
  const btnMagic = $("#btnMagicLink");
  if (btnMagic && !btnMagic.dataset.bound) {
    btnMagic.dataset.bound = "1";
    btnMagic.addEventListener("click", sendMagicLink);
  }

  initLoginEmailSuggestion();

  const ok = await applyAuthGate();
  if (!ok) return;

  initApp();
  await renderAll();
}

boot();

sb.auth.onAuthStateChange(async (event) => {
  if (event === "SIGNED_OUT") {
    loginLoggedForSession = false;
    await applyAuthGate();
    return;
  }

  if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
    const ok = await applyAuthGate();
    if (ok) {
      initApp();
      await renderAll();
    }
  }
});
