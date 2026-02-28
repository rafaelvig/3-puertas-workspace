import { initAccordions } from "./accordion.js";
export const estrategicoTopics = [
  {
export async function renderEstrategico() {
  document.querySelector("#content").innerHTML = "";

  estrategicoTopics.forEach(topic => {
    const section = document.createElement("div");
    section.classList.add("topic-section");

    const sectionTitle = document.createElement("h2");
    sectionTitle.textContent = topic.title;
    section.appendChild(sectionTitle);

    topic.subtopics.forEach(sub => {
      const item = document.createElement("div");
      item.className = "accordion-item";
      item.innerHTML = `
        <div class="accordion-header">
          <span>${sub.title}</span>
          <span class="doc-count">(0)</span>
        </div>

        <div class="accordion-body">
          <button class="btn-upload">Subir documento</button>
          <div class="documents-list">
            <p class="empty">Sin documentos cargados</p>
          </div>
        </div>
      `;

      section.appendChild(item);
    });

    document.querySelector("#content").appendChild(section);
  });

  initAccordions();
}

    
    key: "buyer_persona",
    title: "1. Definición de Buyer Persona",
    subtopics: [
      { key: "investigacion_mercado", title: "a) Investigación de mercado" },
      { key: "pain_points", title: "b) Identificación de pain points" },
      { key: "roles_decision", title: "c) Roles de decisión en B2B" },
      { key: "motivaciones_objeciones", title: "d) Motivaciones y objeciones de compra" },
      { key: "mapas_comportamiento", title: "e) Mapas de comportamiento digital" }
    ]
  },
  // ...otros tópicos
];


