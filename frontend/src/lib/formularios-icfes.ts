export type AreaFormularioKey =
  | "LECTURA_CRITICA"
  | "MATEMATICAS"
  | "CIENCIAS_NATURALES"
  | "SOCIALES_CIUDADANAS"
  | "INGLES";

export interface FormulaReferencia {
  nombre: string;
  formula: string;
  uso: string;
  variables?: string;
  alerta?: string;
}

export interface SeccionFormulario {
  id: string;
  titulo: string;
  items: FormulaReferencia[];
}

export interface FormularioArea {
  key: AreaFormularioKey;
  nombre: string;
  etiqueta: string;
  descripcion: string;
  secciones: SeccionFormulario[];
}

export const FORMULARIOS_ICFES: FormularioArea[] = [
  {
    key: "MATEMATICAS",
    nombre: "Matemáticas",
    etiqueta: "Números, geometría y datos",
    descripcion:
      "Fórmulas frecuentes para modelar cantidades, figuras, funciones y situaciones aleatorias.",
    secciones: [
      {
        id: "numeros-proporciones",
        titulo: "Números y proporciones",
        items: [
          {
            nombre: "Porcentaje de una cantidad",
            formula: "parte = total × porcentaje / 100",
            uso: "Hallar descuentos, impuestos, aumentos o una parte porcentual.",
            alerta: "Convierte 34 % en 0,34 antes de multiplicar.",
          },
          {
            nombre: "Variación porcentual",
            formula: "variación % = (final − inicial) / inicial × 100",
            uso: "Comparar cuánto aumentó o disminuyó una cantidad.",
            alerta: "El denominador siempre es el valor inicial.",
          },
          {
            nombre: "Proporción directa",
            formula: "a / b = c / d  ⇒  a × d = b × c",
            uso: "Resolver escalas, tasas constantes y regla de tres.",
          },
          {
            nombre: "Promedio ponderado",
            formula: "x̄ = Σ(valor × peso) / Σpesos",
            uso: "Combinar notas o grupos que no tienen la misma importancia.",
          },
        ],
      },
      {
        id: "algebra-funciones",
        titulo: "Álgebra y funciones",
        items: [
          {
            nombre: "Pendiente de una recta",
            formula: "m = (y₂ − y₁) / (x₂ − x₁)",
            uso: "Medir la tasa de cambio entre dos puntos.",
            alerta: "Resta las coordenadas en el mismo orden.",
          },
          {
            nombre: "Ecuación de la recta",
            formula: "y = mx + b",
            uso: "Modelar relaciones lineales; m es la pendiente y b el corte con y.",
          },
          {
            nombre: "Fórmula cuadrática",
            formula: "x = (−b ± √(b² − 4ac)) / 2a",
            uso: "Resolver ecuaciones de la forma ax² + bx + c = 0.",
            alerta: "Todo el numerador se divide entre 2a.",
          },
          {
            nombre: "Productos notables",
            formula: "(a ± b)² = a² ± 2ab + b²",
            uso: "Expandir o factorizar expresiones cuadráticas rápidamente.",
          },
        ],
      },
      {
        id: "geometria-medicion",
        titulo: "Geometría y medición",
        items: [
          {
            nombre: "Teorema de Pitágoras",
            formula: "a² + b² = c²",
            uso: "Relacionar los catetos y la hipotenusa de un triángulo rectángulo.",
          },
          {
            nombre: "Área del triángulo",
            formula: "A = base × altura / 2",
            uso: "Calcular la superficie de cualquier triángulo con base y altura.",
          },
          {
            nombre: "Círculo",
            formula: "A = πr²  |  longitud = 2πr",
            uso: "Hallar el área y la longitud de una circunferencia.",
            alerta: "El diámetro es 2r; no lo uses como radio.",
          },
          {
            nombre: "Volumen",
            formula: "prisma: V = Abase × h  |  cilindro: V = πr²h",
            uso: "Calcular la capacidad de prismas y cilindros.",
          },
        ],
      },
      {
        id: "estadistica-probabilidad",
        titulo: "Estadística y probabilidad",
        items: [
          {
            nombre: "Media aritmética",
            formula: "x̄ = Σx / n",
            uso: "Obtener el promedio de un conjunto de datos.",
          },
          {
            nombre: "Probabilidad simple",
            formula: "P(A) = casos favorables / casos posibles",
            uso: "Calcular probabilidades cuando los resultados son equiprobables.",
          },
          {
            nombre: "Complemento",
            formula: "P(no A) = 1 − P(A)",
            uso: "Hallar la probabilidad de que un evento no ocurra.",
          },
          {
            nombre: "Unión de eventos",
            formula: "P(A ∪ B) = P(A) + P(B) − P(A ∩ B)",
            uso: "Calcular que ocurra A, B o ambos sin contar dos veces la intersección.",
          },
        ],
      },
    ],
  },
  {
    key: "CIENCIAS_NATURALES",
    nombre: "Ciencias Naturales",
    etiqueta: "Física, química y ambiente",
    descripcion:
      "Relaciones cuantitativas esenciales y reglas para interpretar fenómenos naturales.",
    secciones: [
      {
        id: "movimiento-fuerzas",
        titulo: "Movimiento y fuerzas",
        items: [
          {
            nombre: "Rapidez media",
            formula: "v = distancia / tiempo",
            uso: "Relacionar cuánto recorre un objeto con el tiempo empleado.",
            alerta: "Convierte primero todas las unidades al mismo sistema.",
          },
          {
            nombre: "Aceleración media",
            formula: "a = (vfinal − vinicial) / tiempo",
            uso: "Medir el cambio de velocidad por unidad de tiempo.",
          },
          {
            nombre: "Segunda ley de Newton",
            formula: "F = m × a",
            uso: "Relacionar fuerza neta, masa y aceleración.",
            variables: "F en newtons, m en kilogramos y a en m/s².",
          },
          {
            nombre: "Peso",
            formula: "peso = m × g",
            uso: "Calcular la fuerza gravitacional sobre una masa.",
            variables: "En la Tierra suele usarse g ≈ 9,8 m/s² o 10 m/s².",
          },
        ],
      },
      {
        id: "energia-electricidad",
        titulo: "Energía y electricidad",
        items: [
          {
            nombre: "Energía cinética",
            formula: "Ec = ½mv²",
            uso: "Calcular la energía asociada al movimiento.",
          },
          {
            nombre: "Energía potencial gravitacional",
            formula: "Ep = mgh",
            uso: "Calcular la energía por la altura respecto a una referencia.",
          },
          {
            nombre: "Ley de Ohm",
            formula: "V = I × R",
            uso: "Relacionar voltaje, corriente y resistencia en un circuito.",
          },
          {
            nombre: "Potencia eléctrica",
            formula: "P = V × I",
            uso: "Calcular la energía eléctrica transferida por unidad de tiempo.",
          },
        ],
      },
      {
        id: "materia-soluciones",
        titulo: "Materia y soluciones",
        items: [
          {
            nombre: "Densidad",
            formula: "ρ = masa / volumen",
            uso: "Comparar cuánta masa hay en un volumen determinado.",
          },
          {
            nombre: "Cantidad de sustancia",
            formula: "moles = masa / masa molar",
            uso: "Convertir una masa de sustancia en número de moles.",
          },
          {
            nombre: "Concentración molar",
            formula: "M = moles de soluto / litros de solución",
            uso: "Expresar la concentración de una solución en mol/L.",
          },
          {
            nombre: "Dilución",
            formula: "C₁V₁ = C₂V₂",
            uso: "Calcular concentración o volumen antes y después de diluir.",
            alerta: "La cantidad de soluto se conserva durante la dilución.",
          },
        ],
      },
      {
        id: "datos-experimentales",
        titulo: "Experimentos y ambiente",
        items: [
          {
            nombre: "Cambio porcentual",
            formula: "cambio % = (final − inicial) / inicial × 100",
            uso: "Comparar tratamientos, poblaciones o mediciones ambientales.",
          },
          {
            nombre: "Variable independiente",
            formula: "causa manipulada → eje x",
            uso: "Identificar el factor que cambia deliberadamente el experimento.",
          },
          {
            nombre: "Variable dependiente",
            formula: "respuesta medida → eje y",
            uso: "Identificar el resultado observado por efecto del tratamiento.",
          },
          {
            nombre: "Control experimental",
            formula: "grupo control + una sola variable modificada",
            uso: "Atribuir un efecto al factor evaluado y no a otra causa.",
          },
        ],
      },
    ],
  },
  {
    key: "LECTURA_CRITICA",
    nombre: "Lectura Crítica",
    etiqueta: "Estructura, inferencia y argumento",
    descripcion:
      "Esquemas de lectura para reconocer ideas, relaciones lógicas e intenciones del texto.",
    secciones: [
      {
        id: "estructura-textual",
        titulo: "Estructura del texto",
        items: [
          {
            nombre: "Tesis y argumento",
            formula: "tesis + razones + evidencias → conclusión",
            uso: "Reconocer qué postura defiende el autor y cómo intenta sostenerla.",
          },
          {
            nombre: "Idea principal",
            formula: "tema + afirmación central = idea principal",
            uso: "Distinguir lo que el texto dice sobre su asunto general.",
          },
          {
            nombre: "Resumen válido",
            formula: "ideas centrales − ejemplos − repeticiones",
            uso: "Elegir la opción que conserva el sentido global sin detalles accesorios.",
          },
          {
            nombre: "Secuencia narrativa",
            formula: "situación inicial → conflicto → transformación → cierre",
            uso: "Ordenar acontecimientos y reconocer el cambio central de una narración.",
          },
        ],
      },
      {
        id: "inferencias",
        titulo: "Inferencias y relaciones",
        items: [
          {
            nombre: "Inferencia respaldada",
            formula: "dato explícito + contexto → conclusión probable",
            uso: "Deducir información que no aparece literalmente sin inventarla.",
            alerta:
              "La respuesta debe poder justificarse con pistas del texto.",
          },
          {
            nombre: "Causa y consecuencia",
            formula:
              "porque / debido a → causa  |  por tanto / así que → efecto",
            uso: "Identificar qué origina un hecho y qué resultado produce.",
          },
          {
            nombre: "Contraste",
            formula: "idea A + pero / sin embargo + idea B",
            uso: "Reconocer una oposición o corrección entre ideas.",
          },
          {
            nombre: "Referencia",
            formula: "pronombre o expresión → antecedente compatible",
            uso: "Determinar a quién o a qué se refiere una palabra dentro del texto.",
          },
        ],
      },
      {
        id: "argumentacion",
        titulo: "Argumentación",
        items: [
          {
            nombre: "Supuesto",
            formula: "premisa implícita + argumento → conclusión",
            uso: "Encontrar la idea no dicha que necesita el razonamiento para funcionar.",
          },
          {
            nombre: "Fortalecer un argumento",
            formula: "evidencia pertinente + fuente confiable → mayor respaldo",
            uso: "Elegir información que hace más probable o sólida la conclusión.",
          },
          {
            nombre: "Debilitar un argumento",
            formula: "contraejemplo o causa alternativa → menor respaldo",
            uso: "Detectar información que cuestiona la relación defendida.",
          },
          {
            nombre: "Generalización apresurada",
            formula: "pocos casos → conclusión sobre todos",
            uso: "Reconocer cuando la evidencia es insuficiente para una afirmación general.",
          },
        ],
      },
      {
        id: "intencion-voz",
        titulo: "Intención y voz",
        items: [
          {
            nombre: "Propósito comunicativo",
            formula: "forma + contenido + destinatario → intención",
            uso: "Distinguir si el texto busca informar, persuadir, criticar o entretener.",
          },
          {
            nombre: "Tono",
            formula: "palabras valorativas + contexto → actitud del emisor",
            uso: "Reconocer tonos como irónico, crítico, optimista o neutral.",
          },
          {
            nombre: "Hecho y opinión",
            formula: "verificable = hecho  |  juicio valorativo = opinión",
            uso: "Separar datos comprobables de valoraciones personales.",
          },
          {
            nombre: "Ironía",
            formula: "significado literal ≠ intención contextual",
            uso: "Detectar cuando se expresa algo para comunicar lo contrario o cuestionarlo.",
          },
        ],
      },
    ],
  },
  {
    key: "SOCIALES_CIUDADANAS",
    nombre: "Sociales y Ciudadanas",
    etiqueta: "Fuentes, territorio y ciudadanía",
    descripcion:
      "Relaciones rápidas para analizar datos sociales, procesos históricos y decisiones ciudadanas.",
    secciones: [
      {
        id: "datos-sociales",
        titulo: "Datos sociales",
        items: [
          {
            nombre: "Densidad de población",
            formula: "densidad = habitantes / área del territorio",
            uso: "Comparar la concentración de población entre territorios.",
          },
          {
            nombre: "Tasa por cada mil",
            formula: "tasa = eventos / población × 1.000",
            uso: "Interpretar natalidad, mortalidad u otros eventos demográficos.",
          },
          {
            nombre: "Variación porcentual",
            formula: "variación % = (final − inicial) / inicial × 100",
            uso: "Comparar cambios de población, empleo, precios o participación.",
          },
          {
            nombre: "Participación porcentual",
            formula: "parte / total × 100",
            uso: "Leer distribuciones en tablas, mapas temáticos y gráficos.",
          },
        ],
      },
      {
        id: "espacio-tiempo",
        titulo: "Espacio y tiempo",
        items: [
          {
            nombre: "Escala cartográfica",
            formula: "distancia real = distancia en mapa × escala",
            uso: "Convertir medidas de un mapa a distancias reales.",
            alerta:
              "Unifica centímetros, metros o kilómetros antes de responder.",
          },
          {
            nombre: "Duración histórica",
            formula: "duración = fecha final − fecha inicial",
            uso: "Comparar periodos y ubicar procesos en el tiempo.",
            alerta: "Al cruzar de a. C. a d. C. no existe el año cero.",
          },
          {
            nombre: "Cambio y permanencia",
            formula: "antes vs. después → cambios + continuidades",
            uso: "Analizar qué se transformó y qué se mantuvo en un proceso histórico.",
          },
          {
            nombre: "Multicausalidad",
            formula:
              "factores políticos + económicos + sociales + culturales → proceso",
            uso: "Evitar explicar un fenómeno histórico mediante una sola causa.",
          },
        ],
      },
      {
        id: "fuentes-perspectivas",
        titulo: "Fuentes y perspectivas",
        items: [
          {
            nombre: "Lectura de una fuente",
            formula: "autor + fecha + propósito + contexto → alcance",
            uso: "Evaluar qué puede demostrar una fuente y cuáles son sus límites.",
          },
          {
            nombre: "Corroboración",
            formula: "fuente A + fuente B independiente → mayor confianza",
            uso: "Contrastar versiones antes de aceptar una afirmación histórica.",
          },
          {
            nombre: "Perspectiva",
            formula:
              "posición del actor + intereses + contexto → punto de vista",
            uso: "Explicar por qué dos actores interpretan distinto el mismo hecho.",
          },
          {
            nombre: "Sesgo",
            formula:
              "selección parcial de información → representación limitada",
            uso: "Detectar omisiones o énfasis que favorecen una postura.",
          },
        ],
      },
      {
        id: "ciudadania",
        titulo: "Ciudadanía y Constitución",
        items: [
          {
            nombre: "Tutela",
            formula:
              "amenaza a derecho fundamental + urgencia → acción de tutela",
            uso: "Reconocer el mecanismo de protección inmediata de derechos fundamentales.",
          },
          {
            nombre: "Ramas del poder",
            formula:
              "legislativa: crea | ejecutiva: administra | judicial: juzga",
            uso: "Distinguir funciones y controles del poder público.",
          },
          {
            nombre: "Conflicto de derechos",
            formula:
              "derecho A vs. derecho B → ponderar contexto y proporcionalidad",
            uso: "Evaluar soluciones que protejan derechos sin imponer daños innecesarios.",
          },
          {
            nombre: "Participación democrática",
            formula:
              "problema público + mecanismo adecuado → incidencia ciudadana",
            uso: "Relacionar elecciones, referendos, cabildos y consultas con su finalidad.",
          },
        ],
      },
    ],
  },
  {
    key: "INGLES",
    nombre: "Inglés",
    etiqueta: "Tiempos, conectores y estructuras",
    descripcion:
      "Patrones gramaticales para reconocer tiempos verbales, relaciones y funciones comunicativas.",
    secciones: [
      {
        id: "tiempos-basicos",
        titulo: "Tiempos básicos",
        items: [
          {
            nombre: "Present simple",
            formula: "subject + base verb (he/she/it: verb-s)",
            uso: "Rutinas, hechos generales y horarios.",
            alerta: "En negativas y preguntas usa do/does + verbo base.",
          },
          {
            nombre: "Present continuous",
            formula: "subject + am/is/are + verb-ing",
            uso: "Acciones en progreso y situaciones temporales.",
          },
          {
            nombre: "Past simple",
            formula: "subject + past verb",
            uso: "Acciones terminadas en un momento pasado definido.",
            alerta: "Después de did o didn't, usa el verbo en forma base.",
          },
          {
            nombre: "Future",
            formula: "will + base verb  |  be going to + base verb",
            uso: "Will para decisiones o predicciones; going to para planes o evidencia.",
          },
        ],
      },
      {
        id: "tiempos-relaciones",
        titulo: "Tiempos y relaciones",
        items: [
          {
            nombre: "Present perfect",
            formula: "have/has + past participle",
            uso: "Experiencias o acciones pasadas conectadas con el presente.",
          },
          {
            nombre: "Passive voice",
            formula: "subject + be + past participle (+ by agent)",
            uso: "Enfatizar la acción o el resultado, no a quien la realiza.",
          },
          {
            nombre: "First conditional",
            formula: "if + present, will + base verb",
            uso: "Consecuencias futuras posibles o probables.",
          },
          {
            nombre: "Second conditional",
            formula: "if + past, would + base verb",
            uso: "Situaciones hipotéticas o poco probables.",
          },
        ],
      },
      {
        id: "comparacion-cantidad",
        titulo: "Comparación y cantidad",
        items: [
          {
            nombre: "Comparative",
            formula: "short adjective-er + than  |  more + adjective + than",
            uso: "Comparar dos personas, objetos o situaciones.",
          },
          {
            nombre: "Superlative",
            formula: "the + adjective-est  |  the most + adjective",
            uso: "Destacar un elemento dentro de un grupo de tres o más.",
          },
          {
            nombre: "Countable nouns",
            formula: "many / few / a few + plural noun",
            uso: "Hablar de objetos que pueden contarse individualmente.",
          },
          {
            nombre: "Uncountable nouns",
            formula: "much / little / a little + uncountable noun",
            uso: "Hablar de sustancias o conceptos que no se cuentan individualmente.",
          },
        ],
      },
      {
        id: "conectores-funciones",
        titulo: "Conectores y funciones",
        items: [
          {
            nombre: "Causa",
            formula: "because + clause  |  because of + noun",
            uso: "Introducir la razón de una situación.",
          },
          {
            nombre: "Resultado",
            formula: "cause; therefore / so, result",
            uso: "Presentar una consecuencia lógica.",
          },
          {
            nombre: "Contraste",
            formula: "although + clause  |  however, new clause",
            uso: "Oponer dos ideas sin negar necesariamente la primera.",
          },
          {
            nombre: "Propósito",
            formula: "to + base verb  |  in order to + base verb",
            uso: "Explicar para qué se realiza una acción.",
          },
        ],
      },
    ],
  },
];

export const AREAS_FORMULARIO = FORMULARIOS_ICFES.map(
  ({ key, nombre, etiqueta }) => ({ key, nombre, etiqueta }),
);

export function esAreaFormulario(
  valor: string | null,
): valor is AreaFormularioKey {
  return FORMULARIOS_ICFES.some((area) => area.key === valor);
}
