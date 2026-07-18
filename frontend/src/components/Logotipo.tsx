// Logo real de SaberPlus (no el de la institución — ese ya lo maneja
// ThemeContext). Es un ícono de barras ascendentes: representa el
// progreso/mejora del puntaje, que es literalmente lo que hace la app.
// Vive en un solo lugar para que sea consistente en todo el sitio
// (sidebar, login, footer, etc.) en vez de repetir texto suelto.

interface LogotipoProps {
  size?: number;
  mostrarTexto?: boolean;
  colorTexto?: string;
  colorAcento?: string;
}

export default function Logotipo({
  size = 34,
  mostrarTexto = true,
  colorTexto = '#1a2a3a',
  colorAcento = '#19A7CE',
}: LogotipoProps) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="11" fill="#146C94" />
        <rect x="9" y="21" width="6" height="10" rx="2" fill="#D2E0FB" />
        <rect x="17" y="14" width="6" height="17" rx="2" fill="#ffffff" />
        <rect x="25" y="8" width="6" height="23" rx="2" fill="#19A7CE" />
      </svg>
      {mostrarTexto && (
        <span
          style={{
            fontSize: size * 0.5,
            fontWeight: 800,
            color: colorTexto,
            letterSpacing: -0.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          Saber<span style={{ color: colorAcento }}>Plus</span>
        </span>
      )}
    </div>
  );
}