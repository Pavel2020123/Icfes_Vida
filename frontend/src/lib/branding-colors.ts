const COLOR_TEXTO_OSCURO = "#172733";
const COLOR_TEXTO_CLARO = "#ffffff";
const CONTRASTE_MINIMO = 4.5;

export function normalizarColorHex(color: string | null | undefined, respaldo: string) {
  const valor = color?.trim();
  if (!valor) return respaldo;
  if (/^#[0-9a-f]{6}$/i.test(valor)) return valor.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(valor)) {
    return `#${valor
      .slice(1)
      .split("")
      .map((caracter) => caracter.repeat(2))
      .join("")}`.toLowerCase();
  }
  return respaldo;
}

export function colorTextoLegible(colorFondo: string) {
  const color = normalizarColorHex(colorFondo, "#146c94");
  const contrasteClaro = contraste(color, COLOR_TEXTO_CLARO);
  const contrasteOscuro = contraste(color, COLOR_TEXTO_OSCURO);
  if (
    contrasteClaro < CONTRASTE_MINIMO &&
    contrasteOscuro < CONTRASTE_MINIMO
  ) {
    return "#000000";
  }
  return contrasteClaro >= contrasteOscuro
    ? COLOR_TEXTO_CLARO
    : COLOR_TEXTO_OSCURO;
}

function contraste(colorA: string, colorB: string) {
  const luminanciaA = luminancia(colorA);
  const luminanciaB = luminancia(colorB);
  const clara = Math.max(luminanciaA, luminanciaB);
  const oscura = Math.min(luminanciaA, luminanciaB);
  return (clara + 0.05) / (oscura + 0.05);
}

function luminancia(color: string) {
  const canales = [1, 3, 5].map((inicio) =>
    Number.parseInt(color.slice(inicio, inicio + 2), 16),
  );
  const [rojo, verde, azul] = canales.map((canal) => {
    const valor = canal / 255;
    return valor <= 0.04045
      ? valor / 12.92
      : Math.pow((valor + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rojo + 0.7152 * verde + 0.0722 * azul;
}
