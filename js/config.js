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
  id: "c01",
  title: "1. Definición de Buyer Persona.",
  desc: "TOFU - 1. Estrategia y Segmentación (25%)",

  surveys: {
    a: "docs/encuestas-dm-farmacias-modelo.pdf"
  },

  subs: [
    { id: "a", name: "Investigación de mercado y datos reales." },
    { id: "b", name: "Identificación de pain points (dolores)." },
    { id: "c", name: "Roles de decisión en B2B (comprador técnico, económico, usuario)." },
    { id: "d", name: "Motivaciones y objeciones de compra." },
    { id: "e", name: "Mapas de comportamiento digital." }
  ]
},


      {
        id: "c02",
        title: "2. Claridad de la Propuesta de Valor.",
        desc: "TOFU - 1. Estrategia y Segmentación (25%)",
        subs: [
          { id: "a", name: "Diferenciadores frente a la competencia." },
          { id: "b", name: "Beneficios tangibles (ahorro, eficiencia, ROI)." },
          { id: "c", name: "Beneficios intangibles (confianza, respaldo, soporte)." },
          { id: "d", name: "Coherencia con la marca y misión." },
          { id: "e", name: "Adaptación por segmento o industria." }
        ]
      },
      {
        id: "c03",
        title: "3. Posicionamiento de marca.",
        desc: "TOFU - 1. Estrategia y Segmentación (25%)",
        subs: [
          { id: "a", name: "Mensaje central consistente." },
          { id: "b", name: "Reputación digital (reseñas, autoridad)." },
          { id: "c", name: "Participación en medios o eventos del sector." },
          { id: "d", name: "Branding visual coherente." },
          { id: "e", name: "Percepción emocional (confianza, innovación)." }
        ]
      },
      {
        id: "c04",
        title: "4. Segmentación del mercado.",
        desc: "TOFU - 1. Estrategia y Segmentación (25%)",
        subs: [
          { id: "a", name: "Segmentos por industria o tamaño." },
          { id: "b", name: "Criterios geográficos o logísticos." },
          { id: "c", name: "Nivel de madurez digital del cliente." },
          { id: "d", name: "Potencial de compra y frecuencia." },
          { id: "e", name: "Nichos estratégicos subatendidos." }
        ]
      },
      {
        id: "c05",
        title: "5. Análisis de competencia.",
        desc: "TOFU - 1. Estrategia y Segmentación (25%)",
        subs: [
          { id: "a", name: "Benchmark de contenidos (qué publican y qué funciona)." },
          { id: "b", name: "Share of Voice en redes y buscadores." },
          { id: "c", name: "Análisis de palabras clave SEO." },
          { id: "d", name: "Estrategias de captación (leads, webinars, etc.)." },
          { id: "e", name: "Canales publicitarios usados" }
        ]
      },
      {
        id: "c06",
        title: "6. Calidad del contenido educativo",
        desc: "TOFU - 2. Contenido y Mensaje (20%)",
        subs: [
          { id: "a", name: "Exactitud y veracidad de la información." },
          { id: "b", name: "Profundidad técnica y claridad." },
          { id: "c", name: "Actualización periódica." },
          { id: "d", name: "Formato profesional (diseño, redacción, fuentes)." },
          { id: "e", name: "Valor práctico (guías, herramientas, plantillas)." }
        ]
      },
      {
        id: "c07",
        title: "7. Relevancia temática (problemas del cliente).",
        desc: "TOFU - 2. Contenido y Mensaje (20%)",
        subs: [
          { id: "a", name: "Investigación de temas de dolor y retos del sector." },
          { id: "b", name: "Alineación con los objetivos del cliente." },
          { id: "c", name: "Enfoque en soluciones más que en productos." },
          { id: "d", name: "Uso de lenguaje del cliente (no del proveedor)." },
          { id: "e", name: "Prioridad a temas de ROI, eficiencia o innovación." }
        ]
      },
      {
        id: "c08",
        title: "8. Tono y lenguaje adecuados.",
        desc: "TOFU - 2. Contenido y Mensaje (20%)",
        subs: [
          { id: "a", name: "Ajuste al nivel profesional del lector (técnico, ejecutivo, comprador)." },
          { id: "b", name: "Claridad y precisión." },
          { id: "c", name: "Evitar jerga innecesaria." },
          { id: "d", name: "Adaptación cultural y regional." },
          { id: "e", name: "Consistencia en toda la comunicación." }
        ]
      },
      {
        id: "c09",
        title: "9. Uso de storytelling (casos, ejemplos, emociones).",
        desc: "TOFU - 2. Contenido y Mensaje (20%)",
        subs: [
          { id: "a", name: "Uso de casos reales o anécdotas corporativas." },
          { id: "b", name: "Incorporación de testimonios o datos narrativos." },
          { id: "c", name: "Estructura de historia (situación–problema–solución–resultado)." },
          { id: "d", name: "Apoyo audiovisual o infográfico." },
          { id: "e", name: "Emoción y credibilidad combinadas." }
        ]
      },
      {
        id: "c10",
        title: "10. SEO (optimización para buscadores).",
        desc: "TOFU - 3. Canales de Atracción (15%)",
        subs: [
          { id: "a", name: "Investigación de palabras clave relevantes." },
          { id: "b", name: "Optimización on-page (títulos, meta, estructura H1–H3)." },
          { id: "c", name: "Estrategia de contenidos SEO (blogs, guías)." },
          { id: "d", name: "Autoridad de dominio (backlinks)." },
          { id: "e", name: "Experiencia del usuario (velocidad, navegación, mobile)." }
        ]
      },
      {
        id: "c11",
        title: "11. Publicidad digital (Ads).",
        desc: "TOFU - 3. Canales de Atracción (15%)",
        subs: [
          { id: "a", name: "Campañas en Google Ads (búsqueda e intención comercial)." },
          { id: "b", name: "Campañas en LinkedIn Ads (segmentación por cargo/industria)." },
          { id: "c", name: "Remarketing estratégico (Google, Meta, LinkedIn)." },
          { id: "d", name: "Análisis de CPC/ROI." },
          { id: "e", name: "Test A/B de anuncios y audiencias." }
        ]
      },
      {
        id: "c12",
        title: "12. Redes sociales profesionales (LinkedIn, YouTube, etc.).",
        desc: "TOFU - 3. Canales de Atracción (15%)",
        subs: [
          { id: "a", name: "Calendario de publicaciones estratégicas." },
          { id: "b", name: "Interacción con decisores y comunidades." },
          { id: "c", name: "Publicación de videos o artículos de valor." },
          { id: "d", name: "Social selling y mensajes directos personalizados." },
          { id: "e", name: "Uso de hashtags y analítica de desempeño." }
        ]
      },
      {
        id: "c13",
        title: "13. Relaciones públicas o medios especializados.",
        desc: "TOFU - 3. Canales de Atracción (15%)",
        subs: [
          { id: "a", name: "Artículos en medios del sector." },
          { id: "b", name: "Entrevistas o colaboraciones con líderes de opinión." },
          { id: "c", name: "Participación en webinars y eventos." },
          { id: "d", name: "Publicación en revistas digitales especializadas." },
          { id: "e", name: "Alianzas con cámaras o asociaciones empresariales." }
        ]
      },
      {
        id: "c14",
        title: "14. CRM y seguimiento de leads.",
        desc: "TOFU - 4. Tecnología y Herramientas (15%)",
        subs: [
          { id: "a", name: "Registro automático de contactos." },
          { id: "b", name: "Trazabilidad de interacciones (emails, llamadas, formularios)." },
          { id: "c", name: "Asignación de leads a vendedores." },
          { id: "d", name: "Calificación automática (Lead Scoring)." },
          { id: "e", name: "Sincronización con herramientas de marketing y ventas." }
        ]
      },
      {
        id: "c15",
        title: "15. Integración con plataformas de automatización.",
        desc: "TOFU - 4. Tecnología y Herramientas (15%)",
        subs: [
          { id: "a", name: "Envío automático de emails según comportamiento." },
          { id: "b", name: "Secuencias de nutrición (nurturing)." },
          { id: "c", name: "Segmentación dinámica de bases de datos." },
          { id: "d", name: "Formularios y landing pages integrados." },
          { id: "e", name: "Sincronización entre campañas y CRM." }
        ]
      },
      {
        id: "c16",
        title: "16. Herramientas de analítica (Google Analytics, Tag Manager, Hotjar).",
        desc: "TOFU - 4. Tecnología y Herramientas (15%)",
        subs: [
          { id: "a", name: "Configuración de objetivos (conversiones, tráfico, CTR)." },
          { id: "b", name: "Mapeo del recorrido del usuario." },
          { id: "c", name: "Visualización de embudos y fuentes de tráfico." },
          { id: "d", name: "Análisis de comportamiento (clics, scroll, rebote)." },
          { id: "e", name: "Dashboards automáticos para decisiones rápidas." }
        ]
      },
      {
        id: "c17",
        title: "17. Diseño visual y UX del contenido.",
        desc: "TOFU - 5. Creatividad y Diseño (10%)",
        subs: [
          { id: "a", name: "Jerarquía visual clara (titulares, imágenes, espacios)." },
          { id: "b", name: "Legibilidad tipográfica." },
          { id: "c", name: "Uso adecuado de color, contraste y branding." },
          { id: "d", name: "Adaptación a distintos formatos (mobile, desktop, PDF, video)." },
          { id: "e", name: "Experiencia de navegación fluida (UX)" }
        ]
      },
      {
        id: "c18",
        title: "18. Claridad de CTAs (Call to Action).",
        desc: "TOFU - 5. Creatividad y Diseño (10%)",
        subs: [
          { id: "a", name: "Ubicación estratégica del CTA (visible, contextual)." },
          { id: "b", name: "Lenguaje de acción claro (“Descargá”, “Solicitá”, “Conocé”)." },
          { id: "c", name: "Contraste visual con el resto del contenido." },
          { id: "d", name: "Uso moderado (evitar saturar)" },
          { id: "e", name: "Medición del rendimiento (CTR por CTA)" }
        ]
      },
      {
        id: "c19",
        title: "19. Coherencia visual de la marca.",
        desc: "TOFU - 5. Creatividad y Diseño (10%)",
        subs: [
          { id: "a", name: "Guía de estilo definida (colores, tipografía, iconografía)." },
          { id: "b", name: "Uniformidad entre canales (web, redes, presentaciones)." },
          { id: "c", name: "Integración de logo y elementos gráficos." },
          { id: "d", name: "Consistencia emocional (tono visual)." },
          { id: "e", name: "Alineación con el posicionamiento de la marca." }
        ]
      },
      {
        id: "c20",
        title: "20. Definición de métricas ToFu (alcance, CTR, leads generados).",
        desc: "TOFU - 6. Datos y Medición (15%)",
        subs: [
          { id: "a", name: "Selección de métricas relevantes (alcance, impresiones, CTR, CPL, tasa de conversión)." },
          { id: "b", name: "Establecimiento de objetivos SMART." },
          { id: "c", name: "Configuración de dashboards (Looker Studio, HubSpot, GA4)." },
          { id: "d", name: "Claridad en fuentes de datos (orgánico, pago, referral)." },
          { id: "e", name: "Frecuencia de medición y reporting." }
        ]
      },
      {
        id: "c21",
        title: "21. Análisis de resultados y experimentación continua (A/B Testing).",
        desc: "TOFU - 6. Datos y Medición (15%)",
        subs: [
          { id: "a", name: "Creación de hipótesis basadas en datos." },
          { id: "b", name: "Pruebas A/B en CTAs, titulares, imágenes y formatos." },
          { id: "c", name: "Documentación y aprendizaje sistemático" },
          { id: "d", name: "Herramientas de testeo y personalización." },
          { id: "e", name: "Incorporación de IA para predicción de rendimiento." }
        ]
      },
      {
        id: "c22",
        title: "22. Definición de criterios de calificación (MQL).",
        desc: "MOFU - 1. Segmentación y Calificación (20%)",
        subs: [
          { id: "a", name: "Definición clara de criterios de MQL (cargo, tamaño de empresa, interacción, intención)." },
          { id: "b", name: "Alineación entre marketing y ventas sobre qué es un lead calificado." },
          { id: "c", name: "Clasificación de leads por etapa del viaje del cliente (TOFU–MOFU–BOFU)." },
          { id: "d", name: "Documentación de criterios y uso en CRM." },
          { id: "e", name: "Revisión trimestral de parámetros." }
        ]
      },
      {
        id: "c23",
        title: "23. Lead Scoring (por comportamiento y perfil).",
        desc: "MOFU - 1. Segmentación y Calificación (20%)",
        subs: [
          { id: "a", name: "Configuración de scoring automático en CRM." },
          { id: "b", name: "Variables demográficas (industria, cargo, tamaño)." },
          { id: "c", name: "Variables de comportamiento (clics, descargas, asistencia a webinars)." },
          { id: "d", name: "IA predictiva para priorización de leads." },
          { id: "e", name: "Ajuste dinámico según resultados históricos." }
        ]
      },
      {
        id: "c24",
        title: "24. Integración entre marketing y ventas.",
        desc: "MOFU - 1. Segmentación y Calificación (20%)",
        subs: [
          { id: "a", name: "Reuniones semanales o mensuales de alineación." },
          { id: "b", name: "Acuerdos de niveles de servicio (SLA: Service Level Agreement)." },
          { id: "c", name: "Seguimiento conjunto de MQLs y SQLs." },
          { id: "d", name: "Feedback constante desde ventas para ajustar criterios de calificación." },
          { id: "e", name: "Visibilidad compartida del pipeline." }
        ]
      },
      {
        id: "c25",
        title: "25. Sincronización CRM–automatización.",
        desc: "MOFU - 1. Segmentación y Calificación (20%)",
        subs: [
          { id: "a", name: "Integración bidireccional entre CRM y plataformas de automatización (HubSpot, ActiveCampaign)." },
          { id: "b", name: "Registro automático de interacciones (emails, formularios, llamadas)." },
          { id: "c", name: "Segmentación dinámica de listas." },
          { id: "d", name: "Detección de duplicados o leads inactivos." },
          { id: "e", name: "Alertas automáticas para vendedores." }
        ]
      },
      {
        id: "c26",
        title: "26. Profundidad del contenido (ebooks, webinars, guías técnicas).",
        desc: "MOFU - 2. Contenido Educativo y Valor (20%)",
        subs: [
          { id: "a", name: "Creación de materiales detallados (whitepapers, estudios, comparativas)." },
          { id: "b", name: "Enfoque en desafíos específicos del cliente." },
          { id: "c", name: "Incorporación de datos, gráficos y fuentes verificables." },
          { id: "d", name: "Guías prácticas con pasos concretos de implementación." },
          { id: "e", name: "Frecuencia de actualización de contenidos técnicos." }
        ]
      },
      {
        id: "c27",
        title: "27. Personalización por segmento/industria.",
        desc: "MOFU - 2. Contenido Educativo y Valor (20%)",
        subs: [
          { id: "a", name: "Adaptación de mensajes según sector, tamaño o rol del cliente." },
          { id: "b", name: "Creación de versiones de contenido según vertical (ej.: salud, finanzas, manufactura)." },
          { id: "c", name: "Inclusión de terminología propia del sector." },
          { id: "d", name: "Personalización dinámica en emails o landing pages." },
          { id: "e", name: "Análisis de comportamiento para ajustar futuros envíos." }
        ]
      },
      {
        id: "c28",
        title: "28. Storytelling educativo (casos de éxito).",
        desc: "MOFU - 2. Contenido Educativo y Valor (20%)",
        subs: [
          { id: "a", name: "Estructura narrativa: problema–solución–resultado." },
          { id: "b", name: "Uso de datos reales y métricas de impacto." },
          { id: "c", name: "Incorporación de testimonios o citas de clientes." },
          { id: "d", name: "Formato visual o audiovisual breve (1–3 minutos)." },
          { id: "e", name: "Conclusión que inspire acción (“nosotros también podemos ayudarte”)." }
        ]
      },
      {
        id: "c29",
        title: "29. Contenido audiovisual y demostraciones.",
        desc: "MOFU - 2. Contenido Educativo y Valor (20%)",
        subs: [
          { id: "a", name: "Videos explicativos cortos (1–2 min)." },
          { id: "b", name: "Webinars interactivos con Q&A." },
          { id: "c", name: "Grabaciones de demostraciones o tutoriales." },
          { id: "d", name: "Infografías y presentaciones animadas." },
          { id: "e", name: "Formatos reutilizables para redes y emails." }
        ]
      },
      {
        id: "c30",
        title: "30. Secuencias automatizadas de email y contenido.",
        desc: "MOFU - 3. Automatización y Nurturing (20%)",
        subs: [
          { id: "a", name: "Diseño de flujos automatizados según etapa del funnel." },
          { id: "b", name: "Combinación de correos, contenido descargable y enlaces a recursos MOFU." },
          { id: "c", name: "Personalización del mensaje por nombre, sector o comportamiento." },
          { id: "d", name: "Frecuencia equilibrada (sin saturar)." },
          { id: "e", name: "Evaluación de tasas de apertura y clics." }
        ]
      },
      {
        id: "c31",
        title: "31. Triggers o disparadores basados en comportamiento.",
        desc: "MOFU - 3. Automatización y Nurturing (20%)",
        subs: [
          { id: "a", name: "Activación de emails o flujos según acciones del usuario (descarga, visita, clic, inactividad)." },
          { id: "b", name: "Segmentación dinámica en función de interacciones." },
          { id: "c", name: "Registro automático de eventos en CRM." },
          { id: "d", name: "Alertas para vendedores cuando se detecta intención de compra." },
          { id: "e", name: "Integración con IA para aprendizaje continuo." }
        ]
      },
      {
        id: "c32",
        title: "32. IA predictiva para detectar intención de compra.",
        desc: "MOFU - 3. Automatización y Nurturing (20%)",
        subs: [
          { id: "a", name: "Modelos de scoring con inteligencia artificial." },
          { id: "b", name: "Análisis del histórico de comportamiento digital." },
          { id: "c", name: "Predicción de leads con alta probabilidad de conversión." },
          { id: "d", name: "Integración con CRM y automatización de alertas." },
          { id: "e", name: "Ajuste de modelos según resultados reales." }
        ]
      },
      {
        id: "c33",
        title: "33. Nutrición progresiva de leads fríos.",
        desc: "MOFU - 3. Automatización y Nurturing (20%)",
        subs: [
          { id: "a", name: "Flujos de reactivación para leads inactivos." },
          { id: "b", name: "Contenido MOFU ligero (checklists, mini guías, microvideos)." },
          { id: "c", name: "Reimpacto por retargeting o email personalizado." },
          { id: "d", name: "Eliminación de leads inactivos después de cierto periodo." },
          { id: "e", name: "Monitoreo del reingreso al funnel." }
        ]
      },
      {
        id: "c34",
        title: "34. Landing pages MOFU (claras y persuasivas).",
        desc: "MOFU - 4. Experiencia Digital (UX y Retención) (15%)",
        subs: [
          { id: "a", name: "Título orientado al valor (no al producto)." },
          { id: "b", name: "Diseño visual limpio y jerarquizado." },
          { id: "c", name: "Testimonios, datos o beneficios específicos." },
          { id: "d", name: "CTA único y visible." },
          { id: "e", name: "Test A/B de contenido y estructura." }
        ]
      },
      {
        id: "c35",
        title: "35. CTAs progresivos (“Solicitá demo”, “Descargá informe”).",
        desc: "MOFU - 4. Experiencia Digital (UX y Retención) (15%)",
        subs: [
          { id: "a", name: "Adaptación del CTA según etapa del buyer journey." },
          { id: "b", name: "Uso de verbos de acción y beneficios (“Accedé a la guía”, “Agendá una demo”)." },
          { id: "c", name: "Colocación estratégica dentro del contenido." },
          { id: "d", name: "Diseño contrastante y visible." },
          { id: "e", name: "Medición del CTR por CTA." }
        ]
      },
      {
        id: "c36",
        title: "36. Optimización de formularios.",
        desc: "MOFU - 4. Experiencia Digital (UX y Retención) (15%)",
        subs: [
          { id: "a", name: "Reducción del número de campos." },
          { id: "b", name: "Inclusión progresiva de datos (formularios inteligentes)." },
          { id: "c", name: "Mensajes de agradecimiento personalizados." },
          { id: "d", name: "Seguridad y confianza (certificados, logos, políticas)." },
          { id: "e", name: "Integración directa con CRM." }
        ]
      },
      {
        id: "c37",
        title: "37. Retargeting inteligente.",
        desc: "MOFU - 4. Experiencia Digital (UX y Retención) (15%)",
        subs: [
          { id: "a", name: "Segmentación por comportamiento (visitas, clics, descargas)." },
          { id: "b", name: "Personalización de mensajes y creatividades." },
          { id: "c", name: "Frecuencia y duración de campañas ajustadas." },
          { id: "d", name: "Cross-channel (LinkedIn, Google Display, email)." },
          { id: "e", name: "Exclusión de leads ya convertidos." }
        ]
      },
      {
        id: "c38",
        title: "38. Casos de éxito documentados.",
        desc: "MOFU - 5. Confianza y Prueba Social (15%)",
        subs: [
          { id: "a", name: "Formato estructurado (problema → solución → resultado)." },
          { id: "b", name: "Inclusión de métricas medibles (ahorro, ROI, productividad)." },
          { id: "c", name: "Testimonio directo del cliente." },
          { id: "d", name: "Uso de elementos visuales (logos, imágenes del proyecto)." },
          { id: "e", name: "Difusión en múltiples canales (web, redes, webinars)." }
        ]
      },
      {
        id: "c39",
        title: "39. Testimonios en video y cifras verificables.",
        desc: "MOFU - 5. Confianza y Prueba Social (15%)",
        subs: [
          { id: "a", name: "Grabación de clientes o usuarios reales." },
          { id: "b", name: "Uso de cifras y porcentajes tangibles." },
          { id: "c", name: "Brevedad y claridad del mensaje (menos de 60 seg)." },
          { id: "d", name: "Contexto: mostrar la aplicación real del producto/servicio." },
          { id: "e", name: "Publicación en sitio web, landing pages y redes B2B." }
        ]
      },
      {
        id: "c40",
        title: "40. Certificaciones o avales del sector.",
        desc: "MOFU - 5. Confianza y Prueba Social (15%)",
        subs: [
          { id: "a", name: "Certificaciones de calidad (ISO, industria, compliance)." },
          { id: "b", name: "Sellos o reconocimientos institucionales." },
          { id: "c", name: "Publicación visible en web y materiales comerciales." },
          { id: "d", name: "Actualización periódica de avales." },
          { id: "e", name: "Asociación con instituciones o cámaras relevantes." }
        ]
      },
      {
        id: "c41",
        title: "41. Participación en eventos o webinars técnicos.",
        desc: "MOFU - 5. Confianza y Prueba Social (15%)",
        subs: [
          { id: "a", name: "Presencia en conferencias o ferias especializadas." },
          { id: "b", name: "Participación en paneles con referentes del sector." },
          { id: "c", name: "Coorganización de eventos con socios estratégicos." },
          { id: "d", name: "Difusión de grabaciones y aprendizajes." },
          { id: "e", name: "Seguimiento de asistentes con contenido MOFU posterior." }
        ]
      },
      {
        id: "c42",
        title: "42. Tasa de conversión MOFU–BOFU.",
        desc: "MOFU - 6. Medición y Optimización Continua (10%)",
        subs: [
          { id: "a", name: "Definición de métricas claras de conversión (demo solicitada, reunión agendada, etc.)." },
          { id: "b", name: "Seguimiento de conversiones asistidas y directas." },
          { id: "c", name: "Medición por canal (email, social, paid, orgánico)." },
          { id: "d", name: "Identificación de cuellos de botella del funnel." },
          { id: "e", name: "Ajuste de flujos o contenidos según resultados." }
        ]
      },
      {
        id: "c43",
        title: "43. Engagement (aperturas, clics, tiempos).",
        desc: "MOFU - 6. Medición y Optimización Continua (10%)",
        subs: [
          { id: "a", name: "Análisis de métricas de interacción en flujos de email, landing y contenido." },
          { id: "b", name: "Segmentación según comportamiento de apertura y clics." },
          { id: "c", name: "Evaluación de retención de atención (scroll, duración, repetición)." },
          { id: "d", name: "Optimización de mensajes o visuales según tasas." },
          { id: "e", name: "Priorización de leads con engagement alto." }
        ]
      },
      {
        id: "c44",
        title: "44. Dashboards MOFU en tiempo real.",
        desc: "MOFU - 6. Medición y Optimización Continua (10%)",
        subs: [
          { id: "a", name: "Integración de métricas en plataformas centralizadas (Looker Studio, HubSpot, Power BI)." },
          { id: "b", name: "Automatización de informes diarios/semanales." },
          { id: "c", name: "Visualización de KPIs clave por equipo (marketing, ventas, dirección)." },
          { id: "d", name: "Alertas automáticas ante desvíos o anomalías." },
          { id: "e", name: "Comparativas históricas y proyecciones." }
        ]
      },
      {
        id: "c45",
        title: "45. A/B testing de emails y flujos.",
        desc: "MOFU - 6. Medición y Optimización Continua (10%)",
        subs: [
          { id: "a", name: "Pruebas de titulares, CTAs, tiempos y secuencias." },
          { id: "b", name: "Segmentación de audiencias de prueba." },
          { id: "c", name: "Documentación de resultados (aprendizaje continuo)." },
          { id: "d", name: "Iteración automática de versiones ganadoras." },
          { id: "e", name: "Uso de IA para predicción de rendimiento." }
        ]
      },
      {
        id: "c46",
        title: "46. Alineación entre marketing y ventas.",
        desc: "BOFU - 1. Estrategia Comercial y Alineación (20%)",
        subs: [
          { id: "a", name: "Definición de objetivos compartidos y métricas comunes (SQLs, tasa de cierre)." },
          { id: "b", name: "Reuniones semanales de pipeline." },
          { id: "c", name: "Feedback bidireccional sobre calidad de leads." },
          { id: "d", name: "Documentación del proceso y SLA entre áreas." },
          { id: "e", name: "Comunicación constante en CRM." }
        ]
      },
      {
        id: "c47",
        title: "47. Definición clara de SQL (Sales Qualified Lead).",
        desc: "BOFU - 1. Estrategia Comercial y Alineación (20%)",
        subs: [
          { id: "a", name: "Establecer criterios concretos (presupuesto, necesidad, autoridad, tiempo)." },
          { id: "b", name: "Clasificación en CRM según etapa (MQL → SQL → Oportunidad)." },
          { id: "c", name: "Revisión constante con el equipo de ventas." },
          { id: "d", name: "Integración de datos de comportamiento (engagement MOFU)." },
          { id: "e", name: "Validación por inteligencia comercial." }
        ]
      },
      {
        id: "c48",
        title: "48. Estrategia de seguimiento y cierre.",
        desc: "BOFU - 1. Estrategia Comercial y Alineación (20%)",
        subs: [
          { id: "a", name: "Cadencia de contacto estructurada (emails, llamadas, mensajes)." },
          { id: "b", name: "Scripts personalizados por segmento o industria." },
          { id: "c", name: "Seguimiento automatizado y manual combinado." },
          { id: "d", name: "Priorización de oportunidades activas." },
          { id: "e", name: "Monitoreo del progreso en CRM." }
        ]
      },
      {
        id: "c49",
        title: "49. Priorización de oportunidades (Lead Scoring avanzado).",
        desc: "BOFU - 1. Estrategia Comercial y Alineación (20%)",
        subs: [
          { id: "a", name: "Uso de algoritmos predictivos o IA para priorizar SQLs." },
          { id: "b", name: "Evaluación de probabilidad de cierre y valor potencial." },
          { id: "c", name: "Categorización dinámica en el CRM." },
          { id: "d", name: "Actualización constante según comportamiento real." },
          { id: "e", name: "Foco comercial en leads de mayor valor." }
        ]
      },
      {
        id: "c50",
        title: "50. Casos de éxito y ROI comprobable.",
        desc: "BOFU - 2. Contenido de Decisión y Valor Tangible (20%)",
        subs: [
          { id: "a", name: "Presentación de resultados cuantificables (KPIs antes/después)." },
          { id: "b", name: "Historias reales con datos verificables." },
          { id: "c", name: "Segmentación por industria o tamaño de empresa." },
          { id: "d", name: "Formatos variados: PDF, video, infografía, presentación." },
          { id: "e", name: "Testimonios que refuercen la veracidad de los logros." }
        ]
      },
      {
        id: "c51",
        title: "51. Comparativas de producto/servicio.",
        desc: "BOFU - 2. Contenido de Decisión y Valor Tangible (20%)",
        subs: [
          { id: "a", name: "Tablas de comparación objetivas con competidores." },
          { id: "b", name: "Evaluación de ventajas y beneficios únicos (USP)." },
          { id: "c", name: "Enfoque en ahorro, rendimiento o soporte." },
          { id: "d", name: "Argumentos de diferenciación basados en datos." },
          { id: "e", name: "Material visual o interactivo (gráficos, calculadoras)." }
        ]
      },
      {
        id: "c52",
        title: "52. Pruebas gratuitas, demos o pilotos.",
        desc: "BOFU - 2. Contenido de Decisión y Valor Tangible (20%)",
        subs: [
          { id: "a", name: "Ofrecimiento de versión limitada o temporal del servicio." },
          { id: "b", name: "Onboarding asistido y acompañamiento durante la demo." },
          { id: "c", name: "Automatización de seguimiento post-prueba." },
          { id: "d", name: "Recopilación de feedback durante la experiencia." },
          { id: "e", name: "Conversión de usuarios de prueba en clientes." }
        ]
      },
      {
        id: "c53",
        title: "53. Material comercial personalizado (propuestas, cotizaciones).",
        desc: "BOFU - 2. Contenido de Decisión y Valor Tangible (20%)",
        subs: [
          { id: "a", name: "Plantillas dinámicas adaptadas a la necesidad del cliente." },
          { id: "b", name: "Inclusión de beneficios financieros concretos." },
          { id: "c", name: "Argumentos alineados con el perfil del decisor." },
          { id: "d", name: "Uso de herramientas visuales y trackeables." },
          { id: "e", name: "Entregas rápidas y profesionalmente diseñadas." }
        ]
      },
      {
        id: "c54",
        title: "54. Testimonios y referencias verificadas.",
        desc: "BOFU - 3. Confianza y Relación con el Cliente (15%)",
        subs: [
          { id: "a", name: "Incorporación de opiniones de clientes actuales verificables." },
          { id: "b", name: "Publicación de testimonios en formatos texto, video o casos breves." },
          { id: "c", name: "Inclusión de logos o datos identificables (con permiso)." },
          { id: "d", name: "Uso en propuestas, landing pages y presentaciones." },
          { id: "e", name: "Verificación de autenticidad y actualización periódica." }
        ]
      },
      {
        id: "c55",
        title: "55. Relación directa con el decisor.",
        desc: "BOFU - 3. Confianza y Relación con el Cliente (15%)",
        subs: [
          { id: "a", name: "Identificación del decisor principal (cargo, nivel de influencia)." },
          { id: "b", name: "Personalización de la comunicación según su perfil (estratégico, técnico, financiero)." },
          { id: "c", name: "Contacto directo por reunión, demo o correo." },
          { id: "d", name: "Empatía y escucha activa en el trato." },
          { id: "e", name: "Comunicación breve, clara y con propuesta de valor adaptada." }
        ]
      },
      {
        id: "c56",
        title: "56. Respuesta rápida y seguimiento post-contacto.",
        desc: "BOFU - 3. Confianza y Relación con el Cliente (15%)",
        subs: [
          { id: "a", name: "Envío de respuesta dentro de las primeras 24 horas." },
          { id: "b", name: "Seguimiento estructurado por CRM." },
          { id: "c", name: "Automatización de recordatorios." },
          { id: "d", name: "Evaluación de satisfacción tras la reunión o contacto." },
          { id: "e", name: "Reforzamiento del valor después del primer intercambio." }
        ]
      },
      {
        id: "c57",
        title: "57. Transparencia en precios y condiciones.",
        desc: "BOFU - 3. Confianza y Relación con el Cliente (15%)",
        subs: [
          { id: "a", name: "Claridad en el modelo de precios y servicios incluidos." },
          { id: "b", name: "Eliminación de costos ocultos o condiciones confusas." },
          { id: "c", name: "Ofrecimiento de comparativas de inversión y retorno." },
          { id: "d", name: "Explicación anticipada de términos contractuales." },
          { id: "e", name: "Coherencia entre discurso comercial y contrato final." }
        ]
      },
      {
        id: "c58",
        title: "58. Simplificación del proceso de compra o contratación.",
        desc: "BOFU - 4. Experiencia de Venta (UX de cierre) (15%)",
        subs: [
          { id: "a", name: "Reducción de pasos y formularios." },
          { id: "b", name: "Claridad en la documentación y requisitos." },
          { id: "c", name: "Procesos digitales y sin papel (e-signature, formularios dinámicos)." },
          { id: "d", name: "Comunicación proactiva ante trabas o dudas." },
          { id: "e", name: "Acompañamiento comercial personalizado hasta el cierre." }
        ]
      },
      {
        id: "c59",
        title: "59. Landing pages BOFU (formularios de demo o contacto).",
        desc: "BOFU - 4. Experiencia de Venta (UX de cierre) (15%)",
        subs: [
          { id: "a", name: "Diseño UX centrado en la conversión." },
          { id: "b", name: "Mensajes de valor enfocados en acción (“Solicitá demo”, “Recibí propuesta”)." },
          { id: "c", name: "Formularios breves con validación inteligente." },
          { id: "d", name: "Testimonios y garantías visibles." },
          { id: "e", name: "Integración directa con CRM o automatización." }
        ]
      },
      {
        id: "c60",
        title: "60. Claridad en el flujo de negociación (reuniones, presupuestos, firmas).",
        desc: "BOFU - 4. Experiencia de Venta (UX de cierre) (15%)",
        subs: [
          { id: "a", name: "Agenda predefinida de pasos post-demo o reunión." },
          { id: "b", name: "Presentación de presupuestos visuales y claros." },
          { id: "c", name: "Seguimiento con recordatorios automáticos." },
          { id: "d", name: "Integración con herramientas de firma digital." },
          { id: "e", name: "Cronograma acordado con el cliente." }
        ]
      },
      {
        id: "c61",
        title: "61. Integración CRM con procesos de venta.",
        desc: "BOFU - 4. Experiencia de Venta (UX de cierre) (15%)",
        subs: [
          { id: "a", name: "Registro automático de interacciones (mails, llamadas, propuestas)." },
          { id: "b", name: "Sincronización con automatizaciones de marketing y remarketing." },
          { id: "c", name: "Trazabilidad total del lead hasta el cierre." },
          { id: "d", name: "Medición de tiempos de respuesta y conversión." },
          { id: "e", name: "Automatización de tareas repetitivas del equipo comercial." }
        ]
      },
      {
        id: "c62",
        title: "62. Uso de herramientas de automatización de ventas.",
        desc: "BOFU - 5. Tecnología y Automatización de Cierre (15%)",
        subs: [
          { id: "a", name: "Integración de CRM con marketing y servicio." },
          { id: "b", name: "Registro automático de actividades y comunicaciones." },
          { id: "c", name: "Automatización de tareas repetitivas (seguimientos, correos, actualizaciones)." },
          { id: "d", name: "Alertas internas para el equipo de ventas." },
          { id: "e", name: "Personalización de flujos según tipo de cliente o etapa." }
        ]
      },
      {
        id: "c63",
        title: "63. Seguimiento de comportamiento en BOFU (email tracking, sesiones web).",
        desc: "BOFU - 5. Tecnología y Automatización de Cierre (15%)",
        subs: [
          { id: "a", name: "Medición de apertura de emails y clics en propuestas." },
          { id: "b", name: "Registro de sesiones web del lead en páginas de producto o precios." },
          { id: "c", name: "Notificaciones automáticas al ejecutivo cuando el lead interactúa." },
          { id: "d", name: "Integración con dashboards analíticos." },
          { id: "e", name: "Personalización de mensajes en función del comportamiento." }
        ]
      },
      {
        id: "c64",
        title: "64. Envíos automáticos de recordatorios o propuestas",
        desc: "BOFU - 5. Tecnología y Automatización de Cierre (15%)",
        subs: [
          { id: "a", name: "Programación de envíos post-demo o post-reunión." },
          { id: "b", name: "Recordatorios automáticos de vencimiento de propuestas." },
          { id: "c", name: "Secuencias de correos de seguimiento no invasivos." },
          { id: "d", name: "Integración con el calendario del vendedor." },
          { id: "e", name: "Mensajes automatizados con personalización de contexto." }
        ]
      },
      {
        id: "c65",
        title: "65. Integración con herramientas de firma digital y pago online.",
        desc: "BOFU - 5. Tecnología y Automatización de Cierre (15%)",
        subs: [
          { id: "a", name: "Uso de plataformas seguras para firma digital (DocuSign, PandaDoc)." },
          { id: "b", name: "Activación de procesos de pago online o transferencia directa." },
          { id: "c", name: "Integración con el CRM para registrar contratos cerrados." },
          { id: "d", name: "Automatización de emisión de facturas o contratos." },
          { id: "e", name: "Reducción de tiempos administrativos." }
        ]
      },
      {
        id: "c66",
        title: "66. Medición de tasa de cierre (% de SQL a cliente).",
        desc: "BOFU - 6. Datos, Medición y Optimización de Conversión (15%)",
        subs: [
          { id: "a", name: "Definición precisa de qué se considera cierre (firma, pago, onboarding)." },
          { id: "b", name: "Registro automático de conversiones en CRM." },
          { id: "c", name: "Cálculo de tasa de cierre por vendedor, canal y producto." },
          { id: "d", name: "Identificación de cuellos de botella (tiempo o etapa)." },
          { id: "e", name: "Comparación intermensual o trimestral." }
        ]
      },
      {
        id: "c67",
        title: "67. Análisis de razones de pérdida.",
        desc: "BOFU - 6. Datos, Medición y Optimización de Conversión (15%)",
        subs: [
          { id: "a", name: "Clasificación estandarizada de motivos (precio, competencia, tiempo, falta de fit, etc.)." },
          { id: "b", name: "Registro obligatorio en CRM." },
          { id: "c", name: "Identificación de patrones y frecuencia por categoría." },
          { id: "d", name: "Retroalimentación al equipo de marketing o producto." },
          { id: "e", name: "Ajuste de estrategias futuras según hallazgos." }
        ]
      },
      {
        id: "c68",
        title: "68. Evaluación de retorno de inversión (ROI por campaña o canal).",
        desc: "BOFU - 6. Datos, Medición y Optimización de Conversión (15%)",
        subs: [
          { id: "a", name: "Medición de costo por adquisición (CAC)." },
          { id: "b", name: "Asignación correcta de origen de lead (tracking multi-touch)." },
          { id: "c", name: "Comparación ROI entre campañas o segmentos." },
          { id: "d", name: "Visualización en dashboards dinámicos." },
          { id: "e", name: "Reasignación de presupuesto según rentabilidad." }
        ]
      },
      {
        id: "c69",
        title: "69. A/B testing de propuestas y argumentos comerciales.",
        desc: "BOFU - 6. Datos, Medición y Optimización de Conversión (15%)",
        subs: [
          { id: "a", name: "Prueba controlada de distintos formatos de propuesta (diseño, tono, estructura)." },
          { id: "b", name: "Comparación de efectividad entre mensajes comerciales." },
          { id: "c", name: "Evaluación de tasa de aceptación y tiempos de respuesta." },
          { id: "d", name: "Documentación de aprendizajes." },
          { id: "e", name: "Escalado de la versión ganadora." }
        ]
      },
      {
        id: "c70",
        title: "70. Cierre e Informe a la Dirección.",
        desc: "BOFU - 6. Datos, Medición y Optimización de Conversión (15%)",
        subs: []
      }
    ],
    system: []
  }
};
