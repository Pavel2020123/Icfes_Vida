export const TIPOS_BLOQUE = ['lectura', 'ejemplo', 'consejo', 'resumen'] as const;

export type TipoBloque = (typeof TIPOS_BLOQUE)[number];

export interface BloqueEditor {
  clave: string;
  tipo: TipoBloque;
  titulo: string;
  contenido: string;
}

const PATRON_BLOQUE = /^\s*\[\[BLOQUE(?:\s+([^\]]*))?\]\]\s*$/gim;
const PATRON_ATRIBUTO = /(id|tipo)\s*=\s*"([^"]*)"/gi;
const PATRON_TITULO = /^\s{0,3}#{1,6}\s+(.+?)\s*\n{1,2}/;

function leerAtributos(texto: string | undefined) {
  const atributos: Record<string, string> = {};

  for (const coincidencia of (texto ?? '').matchAll(PATRON_ATRIBUTO)) {
    atributos[coincidencia[1].toLowerCase()] = coincidencia[2];
  }

  return atributos;
}

function esTipoBloque(valor: string | undefined): valor is TipoBloque {
  return TIPOS_BLOQUE.some(tipo => tipo === valor);
}

function crearClave() {
  return `bloque-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function crearBloque(tipo: TipoBloque = 'lectura'): BloqueEditor {
  return { clave: crearClave(), tipo, titulo: '', contenido: '' };
}

function extraerTituloYContenido(contenido: string) {
  const coincidencia = contenido.match(PATRON_TITULO);

  if (!coincidencia) return { titulo: '', contenido: contenido.trim() };

  return {
    titulo: coincidencia[1].trim(),
    contenido: contenido.slice(coincidencia[0].length).trim(),
  };
}

/** Convierte contenido existente a bloques editables, incluidos textos heredados. */
export function deserializarContenido(contenido: string): BloqueEditor[] {
  const normalizado = contenido.replace(/\r\n?/g, '\n');
  const marcadores = Array.from(normalizado.matchAll(PATRON_BLOQUE));

  if (marcadores.length === 0) {
    return [{ ...crearBloque(), ...extraerTituloYContenido(contenido) }];
  }

  return marcadores.map((marcador, indice) => {
    const atributos = leerAtributos(marcador[1]);
    const inicio = (marcador.index ?? 0) + marcador[0].length;
    const final = marcadores[indice + 1]?.index ?? normalizado.length;
    const datos = extraerTituloYContenido(normalizado.slice(inicio, final));

    return {
      clave: atributos.id || crearClave(),
      tipo: esTipoBloque(atributos.tipo) ? atributos.tipo : 'lectura',
      ...datos,
    };
  });
}

function crearIdentificador(titulo: string, tipo: TipoBloque, indice: number, usados: Set<string>) {
  const base = (titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || (indice === 0 ? 'introduccion' : `${tipo}-${indice + 1}`));

  let identificador = base;
  let sufijo = 2;
  while (usados.has(identificador)) {
    identificador = `${base}-${sufijo}`;
    sufijo += 1;
  }
  usados.add(identificador);

  return identificador;
}

/** Genera el único string Markdown que se almacena en Subtema.contenido. */
export function serializarBloques(bloques: BloqueEditor[]) {
  if (bloques.length === 0) return '';

  const usados = new Set<string>();
  const contenidoBloques = bloques.map((bloque, indice) => {
    const identificador = crearIdentificador(bloque.titulo, bloque.tipo, indice, usados);
    const encabezado = bloque.titulo.trim()
      ? `${indice === 0 ? '#' : '##'} ${bloque.titulo.trim()}\n\n`
      : '';

    return `[[BLOQUE id="${identificador}" tipo="${bloque.tipo}"]]\n\n${encabezado}${bloque.contenido.trim()}`.trim();
  });

  return `[[LECCION version="1"]]\n\n${contenidoBloques.join('\n\n')}`;
}
