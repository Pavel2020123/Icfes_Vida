export type AreaGlosario =
  | "LECTURA_CRITICA"
  | "MATEMATICAS"
  | "CIENCIAS_NATURALES"
  | "SOCIALES_CIUDADANAS"
  | "INGLES";

export interface TerminoGlosario {
  termino: string;
  definicion: string;
  ejemplo: string;
  area: AreaGlosario;
  relacionados?: string[];
}

export const AREAS_GLOSARIO: Array<{
  key: AreaGlosario;
  nombre: string;
}> = [
  { key: "LECTURA_CRITICA", nombre: "Lectura Crítica" },
  { key: "MATEMATICAS", nombre: "Matemáticas" },
  { key: "CIENCIAS_NATURALES", nombre: "Ciencias Naturales" },
  { key: "SOCIALES_CIUDADANAS", nombre: "Sociales y Ciudadanas" },
  { key: "INGLES", nombre: "Inglés" },
];

export const TERMINOS_GLOSARIO: TerminoGlosario[] = [
  {
    termino: "Argumento",
    definicion:
      "Razón o conjunto de razones que se presentan para apoyar una afirmación o tesis.",
    ejemplo:
      "Una estadística puede funcionar como argumento a favor de una propuesta.",
    area: "LECTURA_CRITICA",
    relacionados: ["Tesis", "Premisa"],
  },
  {
    termino: "Cohesión",
    definicion:
      "Conexión lingüística entre las partes de un texto mediante pronombres, conectores y repeticiones controladas.",
    ejemplo:
      "La expresión «por esta razón» conecta una causa anterior con su consecuencia.",
    area: "LECTURA_CRITICA",
    relacionados: ["Conector", "Referencia"],
  },
  {
    termino: "Conector",
    definicion:
      "Palabra o expresión que indica la relación lógica entre dos ideas.",
    ejemplo:
      "«Sin embargo» introduce un contraste; «por tanto» introduce una consecuencia.",
    area: "LECTURA_CRITICA",
    relacionados: ["Cohesión", "Contraste"],
  },
  {
    termino: "Contraargumento",
    definicion:
      "Razón que cuestiona, limita o se opone a un argumento presentado.",
    ejemplo:
      "Mostrar un caso que contradice una generalización puede debilitarla.",
    area: "LECTURA_CRITICA",
    relacionados: ["Argumento", "Tesis"],
  },
  {
    termino: "Inferencia",
    definicion:
      "Conclusión obtenida al combinar información explícita del texto con su contexto.",
    ejemplo:
      "Si un personaje entra empapado y guarda un paraguas, puede inferirse que llueve.",
    area: "LECTURA_CRITICA",
    relacionados: ["Contexto", "Información explícita"],
  },
  {
    termino: "Intención comunicativa",
    definicion:
      "Propósito que persigue un emisor al producir un texto, como informar, persuadir o criticar.",
    ejemplo:
      "Un anuncio busca persuadir; una noticia, principalmente informar.",
    area: "LECTURA_CRITICA",
    relacionados: ["Tono", "Audiencia"],
  },
  {
    termino: "Ironía",
    definicion:
      "Recurso en el que el sentido pretendido difiere o se opone al significado literal.",
    ejemplo:
      "Decir «qué puntual» a alguien que llegó una hora tarde puede ser irónico.",
    area: "LECTURA_CRITICA",
    relacionados: ["Tono", "Contexto"],
  },
  {
    termino: "Premisa",
    definicion:
      "Afirmación que sirve como punto de partida para llegar a una conclusión.",
    ejemplo:
      "Si todos los metales conducen y el cobre es metal, esas afirmaciones son premisas.",
    area: "LECTURA_CRITICA",
    relacionados: ["Argumento", "Conclusión"],
  },
  {
    termino: "Tesis",
    definicion:
      "Idea central o postura que un texto argumentativo busca defender.",
    ejemplo:
      "La tesis suele responder qué piensa el autor sobre el problema discutido.",
    area: "LECTURA_CRITICA",
    relacionados: ["Argumento", "Conclusión"],
  },
  {
    termino: "Tono",
    definicion:
      "Actitud del emisor frente al tema o a su audiencia, reconocible en la elección de palabras.",
    ejemplo: "Un tono puede ser crítico, optimista, burlón, solemne o neutral.",
    area: "LECTURA_CRITICA",
    relacionados: ["Ironía", "Intención comunicativa"],
  },
  {
    termino: "Coeficiente",
    definicion:
      "Número que multiplica una variable dentro de una expresión algebraica.",
    ejemplo: "En 5x², el coeficiente de x² es 5.",
    area: "MATEMATICAS",
    relacionados: ["Variable", "Expresión algebraica"],
  },
  {
    termino: "Función",
    definicion:
      "Relación que asigna a cada valor de entrada exactamente un valor de salida.",
    ejemplo: "En f(x) = 2x + 1, cada valor de x produce un único resultado.",
    area: "MATEMATICAS",
    relacionados: ["Variable", "Dominio"],
  },
  {
    termino: "Media aritmética",
    definicion:
      "Medida de tendencia central obtenida al sumar los datos y dividir entre su cantidad.",
    ejemplo: "La media de 2, 4 y 6 es 4.",
    area: "MATEMATICAS",
    relacionados: ["Mediana", "Moda"],
  },
  {
    termino: "Mediana",
    definicion: "Valor central de un conjunto de datos después de ordenarlo.",
    ejemplo: "En 2, 5 y 9, la mediana es 5.",
    area: "MATEMATICAS",
    relacionados: ["Media aritmética", "Moda"],
  },
  {
    termino: "Pendiente",
    definicion:
      "Razón que mide cuánto cambia verticalmente una recta por cada unidad de cambio horizontal.",
    ejemplo: "Una pendiente positiva indica que y aumenta cuando x aumenta.",
    area: "MATEMATICAS",
    relacionados: ["Función", "Tasa de cambio"],
  },
  {
    termino: "Probabilidad",
    definicion:
      "Medida entre 0 y 1 que expresa qué tan posible es que ocurra un evento.",
    ejemplo: "En un dado justo, la probabilidad de obtener 6 es 1/6.",
    area: "MATEMATICAS",
    relacionados: ["Evento", "Espacio muestral"],
  },
  {
    termino: "Proporción",
    definicion: "Igualdad entre dos razones o cocientes.",
    ejemplo: "2/3 = 4/6 forma una proporción.",
    area: "MATEMATICAS",
    relacionados: ["Razón", "Escala"],
  },
  {
    termino: "Rango estadístico",
    definicion:
      "Diferencia entre el dato mayor y el dato menor de un conjunto.",
    ejemplo: "En 3, 5, 8 y 10, el rango es 10 − 3 = 7.",
    area: "MATEMATICAS",
    relacionados: ["Dispersión", "Media aritmética"],
  },
  {
    termino: "Razón",
    definicion: "Comparación entre dos cantidades mediante una división.",
    ejemplo: "Si hay 2 libros por cada 3 estudiantes, la razón es 2:3.",
    area: "MATEMATICAS",
    relacionados: ["Proporción", "Tasa"],
  },
  {
    termino: "Variable",
    definicion:
      "Símbolo que representa un valor desconocido o una cantidad que puede cambiar.",
    ejemplo: "En y = 3x + 2, x e y son variables.",
    area: "MATEMATICAS",
    relacionados: ["Coeficiente", "Función"],
  },
  {
    termino: "Átomo",
    definicion:
      "Unidad básica de un elemento químico que conserva sus propiedades.",
    ejemplo: "Un átomo de carbono tiene seis protones en su núcleo.",
    area: "CIENCIAS_NATURALES",
    relacionados: ["Elemento", "Molécula"],
  },
  {
    termino: "Densidad",
    definicion:
      "Relación entre la masa de una sustancia y el volumen que ocupa.",
    ejemplo: "Un material menos denso que el agua puede flotar sobre ella.",
    area: "CIENCIAS_NATURALES",
    relacionados: ["Masa", "Volumen"],
  },
  {
    termino: "Ecosistema",
    definicion:
      "Conjunto de organismos y factores físicos que interactúan en un lugar.",
    ejemplo:
      "Un humedal incluye seres vivos, agua, suelo, luz y sus relaciones.",
    area: "CIENCIAS_NATURALES",
    relacionados: ["Población", "Hábitat"],
  },
  {
    termino: "Energía",
    definicion:
      "Capacidad de un sistema para producir cambios o realizar trabajo.",
    ejemplo:
      "Al caer, la energía potencial de un objeto se transforma en cinética.",
    area: "CIENCIAS_NATURALES",
    relacionados: ["Trabajo", "Potencia"],
  },
  {
    termino: "Fuerza",
    definicion:
      "Interacción capaz de cambiar el movimiento o deformar un cuerpo.",
    ejemplo: "Una fuerza neta sobre un objeto puede producir aceleración.",
    area: "CIENCIAS_NATURALES",
    relacionados: ["Aceleración", "Masa"],
  },
  {
    termino: "Homeostasis",
    definicion:
      "Capacidad de un organismo para mantener condiciones internas relativamente estables.",
    ejemplo: "La sudoración ayuda a regular la temperatura corporal.",
    area: "CIENCIAS_NATURALES",
    relacionados: ["Retroalimentación", "Organismo"],
  },
  {
    termino: "Molécula",
    definicion:
      "Conjunto de dos o más átomos unidos mediante enlaces químicos.",
    ejemplo:
      "Una molécula de agua está formada por dos hidrógenos y un oxígeno.",
    area: "CIENCIAS_NATURALES",
    relacionados: ["Átomo", "Compuesto"],
  },
  {
    termino: "Población biológica",
    definicion:
      "Conjunto de individuos de la misma especie que habitan un área y tiempo determinados.",
    ejemplo:
      "Todos los frailejones de un páramo pueden estudiarse como una población.",
    area: "CIENCIAS_NATURALES",
    relacionados: ["Ecosistema", "Comunidad"],
  },
  {
    termino: "Reacción química",
    definicion:
      "Proceso en el que unas sustancias se transforman en otras mediante reorganización de átomos.",
    ejemplo:
      "En una ecuación balanceada se conserva el número de átomos de cada elemento.",
    area: "CIENCIAS_NATURALES",
    relacionados: ["Reactivo", "Producto"],
  },
  {
    termino: "Variable experimental",
    definicion:
      "Factor que se modifica, mide o controla durante un experimento.",
    ejemplo:
      "La luz puede ser independiente y el crecimiento de la planta, dependiente.",
    area: "CIENCIAS_NATURALES",
    relacionados: ["Hipótesis", "Grupo control"],
  },
  {
    termino: "Ciudadanía",
    definicion:
      "Condición que reconoce derechos, deberes y participación dentro de una comunidad política.",
    ejemplo:
      "Votar y ejercer control social son formas de participación ciudadana.",
    area: "SOCIALES_CIUDADANAS",
    relacionados: ["Democracia", "Participación"],
  },
  {
    termino: "Constitución",
    definicion:
      "Norma fundamental que organiza el Estado y reconoce principios, derechos y deberes.",
    ejemplo:
      "Las demás normas deben respetar lo establecido por la Constitución.",
    area: "SOCIALES_CIUDADANAS",
    relacionados: ["Estado", "Derechos fundamentales"],
  },
  {
    termino: "Democracia",
    definicion:
      "Sistema político en el que la ciudadanía participa en las decisiones y el control del poder.",
    ejemplo: "Las elecciones son un mecanismo democrático, pero no el único.",
    area: "SOCIALES_CIUDADANAS",
    relacionados: ["Ciudadanía", "Participación"],
  },
  {
    termino: "Derecho fundamental",
    definicion:
      "Derecho esencial para la dignidad y libertad de las personas, con protección reforzada.",
    ejemplo:
      "La vida, la igualdad y el debido proceso son derechos fundamentales.",
    area: "SOCIALES_CIUDADANAS",
    relacionados: ["Constitución", "Tutela"],
  },
  {
    termino: "Estado",
    definicion:
      "Organización política y jurídica que ejerce autoridad sobre una población y un territorio.",
    ejemplo: "El Estado cuenta con instituciones y poderes públicos.",
    area: "SOCIALES_CIUDADANAS",
    relacionados: ["Nación", "Soberanía"],
  },
  {
    termino: "Fuente primaria",
    definicion:
      "Testimonio, objeto o documento producido en la época o por protagonistas del proceso estudiado.",
    ejemplo: "Una carta escrita durante una guerra es una fuente primaria.",
    area: "SOCIALES_CIUDADANAS",
    relacionados: ["Fuente secundaria", "Contexto histórico"],
  },
  {
    termino: "Nación",
    definicion:
      "Comunidad que comparte vínculos históricos, culturales o identitarios.",
    ejemplo:
      "Una nación no siempre coincide exactamente con las fronteras de un Estado.",
    area: "SOCIALES_CIUDADANAS",
    relacionados: ["Estado", "Identidad"],
  },
  {
    termino: "Participación ciudadana",
    definicion:
      "Intervención de las personas en asuntos y decisiones de interés colectivo.",
    ejemplo:
      "Un cabildo abierto permite discutir públicamente asuntos locales.",
    area: "SOCIALES_CIUDADANAS",
    relacionados: ["Ciudadanía", "Democracia"],
  },
  {
    termino: "Soberanía",
    definicion:
      "Autoridad suprema para tomar decisiones dentro de un territorio sin subordinación externa.",
    ejemplo: "En una democracia, la soberanía política se atribuye al pueblo.",
    area: "SOCIALES_CIUDADANAS",
    relacionados: ["Estado", "Territorio"],
  },
  {
    termino: "Territorio",
    definicion:
      "Espacio geográfico sobre el cual una sociedad o Estado ejerce control y construye relaciones.",
    ejemplo:
      "El territorio comprende dimensiones terrestres, marítimas y aéreas.",
    area: "SOCIALES_CIUDADANAS",
    relacionados: ["Estado", "Soberanía"],
  },
  {
    termino: "Adjective",
    definicion: "Word that describes or gives information about a noun.",
    ejemplo: "In «a difficult question», difficult is the adjective.",
    area: "INGLES",
    relacionados: ["Noun", "Adverb"],
  },
  {
    termino: "Adverb",
    definicion: "Word that modifies a verb, an adjective or another adverb.",
    ejemplo: "In «She answered quickly», quickly describes how she answered.",
    area: "INGLES",
    relacionados: ["Adjective", "Verb"],
  },
  {
    termino: "Clause",
    definicion:
      "Group of words containing a subject and a verb, used as part of or as a complete sentence.",
    ejemplo: "«Because it was raining» is a dependent clause.",
    area: "INGLES",
    relacionados: ["Subject", "Verb"],
  },
  {
    termino: "Connector",
    definicion:
      "Word or phrase that shows the logical relationship between ideas.",
    ejemplo: "However signals contrast, while therefore signals a result.",
    area: "INGLES",
    relacionados: ["Clause", "Context clue"],
  },
  {
    termino: "Context clue",
    definicion:
      "Information around an unknown word that helps the reader infer its meaning.",
    ejemplo:
      "Examples, contrasts and synonyms in the sentence can reveal meaning.",
    area: "INGLES",
    relacionados: ["Inference", "Connector"],
  },
  {
    termino: "False cognate",
    definicion:
      "Word that resembles a Spanish word but has a different meaning.",
    ejemplo: "Actually means «en realidad», not «actualmente».",
    area: "INGLES",
    relacionados: ["Cognate", "Context clue"],
  },
  {
    termino: "Modal verb",
    definicion:
      "Auxiliary verb used to express ability, possibility, permission, advice or obligation.",
    ejemplo:
      "Can expresses ability; should gives advice; must expresses obligation.",
    area: "INGLES",
    relacionados: ["Auxiliary verb", "Base verb"],
  },
  {
    termino: "Passive voice",
    definicion:
      "Structure that emphasizes the receiver of an action rather than its performer.",
    ejemplo: "«The test was completed» focuses on the test, not the student.",
    area: "INGLES",
    relacionados: ["Past participle", "Subject"],
  },
  {
    termino: "Phrasal verb",
    definicion:
      "Combination of a verb and a particle whose meaning may differ from the original verb.",
    ejemplo: "Give up means to stop trying.",
    area: "INGLES",
    relacionados: ["Verb", "Context clue"],
  },
  {
    termino: "Tense",
    definicion: "Grammatical form that locates an action or state in time.",
    ejemplo: "Present perfect connects a past action with the present.",
    area: "INGLES",
    relacionados: ["Verb", "Past participle"],
  },
];

export const AREA_NOMBRE_GLOSARIO: Record<AreaGlosario, string> =
  Object.fromEntries(
    AREAS_GLOSARIO.map((area) => [area.key, area.nombre]),
  ) as Record<AreaGlosario, string>;

export function esAreaGlosario(valor: string | null): valor is AreaGlosario {
  return AREAS_GLOSARIO.some((area) => area.key === valor);
}
