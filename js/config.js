// Configuración base (sin Supabase por ahora)
window.WS_CONFIG = {
  companies: [
    {
      id: "monumento",
      name: "Droguería Monumento",
      channels: [
        { id: "farmacias", name: "Farmacias" }
      ]
    }
  ],
  planes: {
    strategy: [
      {
        id: "E1",
        title: "Mercado y Cliente Objetivo",
        desc: "Buyer persona, segmentación, roles de decisión, motivaciones y objeciones.",
        subs: [
          "Investigación de mercado",
          "Buyer persona",
          "Segmentación",
          "Roles de decisión",
          "Motivaciones y objeciones"
        ]
      },
      {
        id: "E2",
        title: "Propuesta de Valor y Posicionamiento",
        desc: "Diferenciadores, beneficios, mensaje central, reputación y coherencia de marca.",
        subs: [
          "Propuesta de valor",
          "Posicionamiento",
          "Branding y coherencia",
          "Reputación sectorial"
        ]
      },
      {
        id: "E3",
        title: "Inteligencia Competitiva",
        desc: "Benchmark, share of voice, SEO competitivo, captación y canales.",
        subs: [
          "Benchmark de contenidos",
          "SEO / keywords competitivo",
          "Share of voice",
          "Estrategias de captación",
          "Canales publicitarios"
        ]
      }
    ],
    system: [
      {
        id: "T1",
        title: "Arquitectura del Proceso Comercial",
        desc: "Calificación, MQL/SQL, comité de compra, reglas y SLA.",
        subs: [
          "Lead scoring",
          "MQL / SQL",
          "Comité de compra",
          "Reglas de traspaso",
          "SLA de respuesta"
        ]
      },
      {
        id: "T2",
        title: "Activos de Contenido y Argumentación",
        desc: "Assets educativos, técnicos y comerciales. Objeciones, CTA y copy.",
        subs: [
          "Contenido educativo",
          "Prueba social",
          "Contenido técnico",
          "Contenido comercial",
          "Gestión de objeciones"
        ]
      },
      {
        id: "T3",
        title: "Canales y Ejecución Multicanal",
        desc: "SEO, LinkedIn, Ads/retargeting, alianzas, eventos, webinars y cadencias.",
        subs: [
          "SEO",
          "LinkedIn",
          "Ads y retargeting",
          "Alianzas y co-marketing",
          "Eventos y webinars"
        ]
      },
      {
        id: "T4",
        title: "Infraestructura y Automatización",
        desc: "CRM, formularios, landing, automatizaciones, integraciones, tracking y tableros.",
        subs: [
          "CRM",
          "Formularios y landing",
          "Automatizaciones",
          "Integraciones",
          "Tracking y dashboards"
        ]
      },
      {
        id: "T5",
        title: "Diseño, Producción y UX",
        desc: "Identidad visual, calidad de piezas, plantillas, producción y QA.",
        subs: [
          "Identidad visual",
          "Calidad de piezas",
          "UX del contenido",
          "Producción",
          "Control de calidad"
        ]
      },
      {
        id: "T6",
        title: "Gestión de Oportunidades y Cierre",
        desc: "Diagnóstico comercial, propuestas, negociación, aprobaciones, implementación y handoff.",
        subs: [
          "Diagnóstico comercial",
          "Propuesta técnica",
          "Propuesta económica",
          "Negociación y aprobaciones",
          "Implementación y handoff"
        ]
      },
      {
        id: "T7",
        title: "Postventa y Optimización",
        desc: "Seguimiento, razones de pérdida, ROI, testing y reporte a dirección.",
        subs: [
          "Seguimiento inicial",
          "Razones de pérdida",
          "ROI y CAC",
          "Testing y aprendizajes",
          "Informe a dirección"
        ]
      }
    ]
  }
};
