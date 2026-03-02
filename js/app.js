const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const state = {
  tab: "strategy",
  companyId: null,
  channelId: null
};

function initSelectors(){
  const companies = window.WS_CONFIG.companies;
  const selCompany = $("#selCompany");
  selCompany.innerHTML = companies.map(c => `<option value="${c.id}">${c.name}</option>`).join("");

  state.companyId = companies[0]?.id || null;

  selCompany.addEventListener("change", () => {
    state.companyId = selCompany.value;
    syncChannels();
    render();
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
  };
}

function initTabs(){
  $$(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".tab").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.tab = btn.dataset.tab;
      render();
    });
  });
}

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

  // handlers acordeón
  $$(".acc-header", body).forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".acc-item");
      item.classList.toggle("is-open");
    });
  });
}

function closeDrawer(){
  $("#drawer").classList.remove("is-open");
  $("#drawer").setAttribute("aria-hidden", "true");
}

function renderAccordion(block){
  const subs = block.subs || [];
  const accItems = subs.map((s) => `
    <div class="acc-item">
      <button class="acc-header" type="button">
        <span class="acc-title">${s}</span>
        <span class="acc-count">0</span>
      </button>
      <div class="acc-body">
        <div class="row-actions">
          <button class="btn" type="button" data-action="upload">Subir documento</button>
          <button class="btn" type="button" data-action="link">Agregar link</button>
          <button class="btn" type="button" data-action="note">Agregar nota</button>
        </div>
        <div class="mini">Sin documentos cargados</div>
      </div>
    </div>
  `).join("");

  return `
    <div class="accordion">
      ${accItems}
    </div>
  `;
}

function initDrawer(){
  $("#drawerClose").addEventListener("click", closeDrawer);
  $("#drawerBackdrop").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") closeDrawer();
  });
}

function boot(){
  initSelectors();
  initTabs();
  initDrawer();
  render();
}

boot();
