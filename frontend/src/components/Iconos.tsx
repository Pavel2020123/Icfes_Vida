// Íconos SVG livianos (estilo trazo, sin relleno) para no depender de una
// librería externa. Todos aceptan `size` y `color`/`currentColor` vía CSS.

interface IconoProps {
  size?: number;
  color?: string;
}

const propsBase = (size: number, color: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: color,
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function IconoUsuarioMas({ size = 18, color = 'currentColor' }: IconoProps) {
  return (
    <svg {...propsBase(size, color)}>
      <path d="M11 14c-3.9 0-7 1.6-7 4v2h11" />
      <circle cx="9" cy="7" r="4" />
      <path d="M18 8v6M15 11h6" />
    </svg>
  );
}

export function IconoUsuarios({ size = 18, color = 'currentColor' }: IconoProps) {
  return (
    <svg {...propsBase(size, color)}>
      <circle cx="9" cy="7.5" r="3.5" />
      <path d="M2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
      <path d="M16 5.2c1.6.4 2.8 1.8 2.8 3.5 0 1.7-1.2 3.1-2.8 3.5" />
      <path d="M18.5 14.7c2.2.6 3.5 2.1 3.5 4.3" />
    </svg>
  );
}

export function IconoGrupo({ size = 18, color = 'currentColor' }: IconoProps) {
  return (
    <svg {...propsBase(size, color)}>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M3 10.5h18" />
      <path d="M8 7V5.2A1.2 1.2 0 0 1 9.2 4h5.6A1.2 1.2 0 0 1 16 5.2V7" />
    </svg>
  );
}

export function IconoGrafico({ size = 18, color = 'currentColor' }: IconoProps) {
  return (
    <svg {...propsBase(size, color)}>
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  );
}

export function IconoMas({ size = 16, color = 'currentColor' }: IconoProps) {
  return (
    <svg {...propsBase(size, color)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconoVinculo({ size = 18, color = 'currentColor' }: IconoProps) {
  return (
    <svg {...propsBase(size, color)}>
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M11 7.5 12.6 5.9a3.2 3.2 0 0 1 4.6 4.6L15.6 12" />
      <path d="M13 16.5 11.4 18.1a3.2 3.2 0 0 1-4.6-4.6L8.4 12" />
    </svg>
  );
}

export function IconoLlave({ size = 18, color = 'currentColor' }: IconoProps) {
  return (
    <svg {...propsBase(size, color)}>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12 19 4M16 5.5 18 7.5M14 7.5 15.5 9" />
    </svg>
  );
}

export function IconoFlechaIzquierda({ size = 16, color = 'currentColor' }: IconoProps) {
  return (
    <svg {...propsBase(size, color)}>
      <path d="M19 12H5" />
      <path d="M11 18 5 12l6-6" />
    </svg>
  );
}

export function IconoLapiz({ size = 16, color = 'currentColor' }: IconoProps) {
  return (
    <svg {...propsBase(size, color)}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function IconoBasura({ size = 16, color = 'currentColor' }: IconoProps) {
  return (
    <svg {...propsBase(size, color)}>
      <path d="M4 7h16" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function IconoSubir({ size = 18, color = 'currentColor' }: IconoProps) {
  return (
    <svg {...propsBase(size, color)}>
      <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}