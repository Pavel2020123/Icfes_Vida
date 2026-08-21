export interface FaseEstrategia {
  numero: number;
  titulo: string;
  momento: string;
  objetivo: string;
  acciones: string[];
}

export interface TacticaArea {
  key: string;
  nombre: string;
  enfoque: string;
  pasos: string[];
  preguntaControl: string;
}

export interface DistractorExamen {
  titulo: string;
  senal: string;
  respuesta: string;
}

export const FASES_ESTRATEGIA: FaseEstrategia[] = [
  {
    numero: 1,
    titulo: "Preparar la sesión",
    momento: "Primeros minutos",
    objetivo: "Empezar con una meta de tiempo clara y sin errores de lectura.",
    acciones: [
      "Confirma cuántas preguntas tiene el bloque y cuánto tiempo está disponible.",
      "Reserva entre 5 % y 10 % del tiempo para revisar al final.",
      "Lee las instrucciones y reconoce si una pregunta depende de un caso compartido.",
      "Ubica visualmente los textos, tablas o gráficos extensos antes de comenzar.",
    ],
  },
  {
    numero: 2,
    titulo: "Primera vuelta",
    momento: "Asegurar puntos",
    objetivo: "Resolver primero lo que puedes justificar con rapidez.",
    acciones: [
      "Responde las preguntas claras y marca las que necesitan más trabajo.",
      "Si superas ampliamente el promedio de tiempo, elige provisionalmente y continúa.",
      "Descarta opciones incompatibles antes de comparar las dos más plausibles.",
      "Mantén el ritmo por bloques; no revises el reloj después de cada pregunta.",
    ],
  },
  {
    numero: 3,
    titulo: "Segunda vuelta",
    momento: "Resolver las dudosas",
    objetivo:
      "Usar evidencia y eliminación en las preguntas que quedaron marcadas.",
    acciones: [
      "Vuelve primero a las preguntas donde ya descartaste una o más opciones.",
      "Reformula con tus palabras exactamente qué está pidiendo el enunciado.",
      "Busca una evidencia concreta en el texto, gráfico, cálculo o contexto.",
      "Si persiste la duda, elige la opción con mayor respaldo y evita dejarla vacía.",
    ],
  },
  {
    numero: 4,
    titulo: "Cierre y control",
    momento: "Tiempo reservado",
    objetivo:
      "Detectar omisiones y errores mecánicos sin deshacer respuestas sólidas.",
    acciones: [
      "Comprueba que todas las preguntas tengan una respuesta registrada.",
      "Revisa negaciones, unidades, signos y opciones trasladadas incorrectamente.",
      "Cambia una respuesta únicamente cuando encuentres evidencia nueva o un error verificable.",
      "Confirma que el número de la pregunta coincida con el número de la respuesta.",
    ],
  },
];

export const TACTICAS_POR_AREA: TacticaArea[] = [
  {
    key: "LECTURA_CRITICA",
    nombre: "Lectura Crítica",
    enfoque: "Responder desde el texto y no desde la opinión personal.",
    pasos: [
      "Identifica si piden información explícita, inferencia, estructura o valoración.",
      "Ubica las palabras clave del enunciado en el fragmento correspondiente.",
      "Observa conectores, pronombres y cambios de tono.",
      "Descarta opciones más amplias, más extremas o ajenas a lo que el texto permite.",
    ],
    preguntaControl: "¿Qué frase del texto respalda exactamente esta opción?",
  },
  {
    key: "MATEMATICAS",
    nombre: "Matemáticas",
    enfoque: "Traducir la situación antes de operar.",
    pasos: [
      "Separa los datos conocidos de la cantidad que debes encontrar.",
      "Escribe la relación, fórmula o representación antes de reemplazar valores.",
      "Comprueba unidades, signo y orden de magnitud.",
      "Cuando sea más rápido, estima o prueba las opciones en el enunciado.",
    ],
    preguntaControl:
      "¿Mi resultado responde la cantidad y la unidad solicitadas?",
  },
  {
    key: "CIENCIAS_NATURALES",
    nombre: "Ciencias Naturales",
    enfoque: "Conectar evidencia, modelo y fenómeno.",
    pasos: [
      "Reconoce la variable independiente, la dependiente y los controles.",
      "Lee títulos, ejes, unidades y tendencias antes de interpretar un gráfico.",
      "Distingue el dato observado de la explicación propuesta.",
      "Verifica si la conclusión realmente puede obtenerse con el experimento descrito.",
    ],
    preguntaControl:
      "¿Los datos permiten esta conclusión o solo la hacen posible?",
  },
  {
    key: "SOCIALES_CIUDADANAS",
    nombre: "Sociales y Ciudadanas",
    enfoque: "Interpretar actores, contexto e intereses.",
    pasos: [
      "Identifica autor, época, destinatario y propósito de cada fuente.",
      "Separa causas, consecuencias y condiciones del proceso.",
      "Compara perspectivas sin asumir que una fuente es neutral.",
      "En situaciones ciudadanas, relaciona derechos, deberes y mecanismo adecuado.",
    ],
    preguntaControl:
      "¿Desde qué posición habla este actor y qué busca defender?",
  },
  {
    key: "INGLES",
    nombre: "Inglés",
    enfoque:
      "Usar función y contexto antes que traducción palabra por palabra.",
    pasos: [
      "Reconoce si la situación pide informar, advertir, invitar, disculparse o aconsejar.",
      "Usa conectores y palabras cercanas para inferir vocabulario desconocido.",
      "Comprueba sujeto, tiempo verbal y concordancia en cada opción.",
      "Desconfía de falsos cognados y traducciones que suenan literales en español.",
    ],
    preguntaControl:
      "¿Qué opción cumple la función comunicativa dentro de este contexto?",
  },
];

export const DISTRACTORES_EXAMEN: DistractorExamen[] = [
  {
    titulo: "Verdad que no responde",
    senal:
      "La opción contiene un dato correcto, pero no resuelve lo preguntado.",
    respuesta:
      "Repite la pregunta con tus palabras y verifica la relación directa.",
  },
  {
    titulo: "Palabras absolutas",
    senal:
      "Usa expresiones como siempre, nunca, todos o únicamente sin suficiente respaldo.",
    respuesta:
      "Busca si el texto o los datos permiten una afirmación tan general.",
  },
  {
    titulo: "Causa y efecto invertidos",
    senal:
      "Relaciona los elementos correctos, pero cambia cuál produce al otro.",
    respuesta: "Dibuja una flecha desde la causa hacia la consecuencia.",
  },
  {
    titulo: "Dato externo atractivo",
    senal:
      "Parece razonable por conocimiento previo, aunque el caso no lo sustenta.",
    respuesta:
      "Prioriza la información proporcionada y el alcance exacto del enunciado.",
  },
];

export const CHECKLIST_EXAMEN = [
  "Documento de identidad y citación listos.",
  "Lápices, borrador y tajalápiz permitidos preparados.",
  "Lugar de presentación y ruta de llegada confirmados.",
  "Hora de salida definida con margen para imprevistos.",
  "Sueño y alimentación organizados desde el día anterior.",
  "Celular y objetos no permitidos guardados según las indicaciones.",
  "Plan de tiempo y regla para preguntas difíciles definidos.",
  "Respiración breve preparada para recuperar la concentración.",
] as const;
