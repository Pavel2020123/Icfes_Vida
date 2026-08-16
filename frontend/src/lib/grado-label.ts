export function gradoLabel(grado: 'DECIMO' | 'ONCE' | string | null | undefined): string {
  if (!grado) return '';
  const map: Record<string, string> = {
    DECIMO: '10°',
    ONCE: '11°',
    '10': '10°',
    '11': '11°',
  };
  return map[grado] ?? String(grado);
}

export function gradoIcon(grado: 'DECIMO' | 'ONCE' | string | null | undefined): string {
  if (!grado) return '';
  return grado === 'DECIMO' || grado === '10' ? '🎒' : '🎓';
}

export function gradoBadgeClass(grado: 'DECIMO' | 'ONCE' | string | null | undefined): string {
  if (!grado) return '';
  return grado === 'DECIMO' || grado === '10'
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : 'bg-violet-100 text-violet-700 border-violet-200';
}

export function gradoFullLabel(grado: 'DECIMO' | 'ONCE' | string | null | undefined): string {
  if (!grado) return '';
  return grado === 'DECIMO' || grado === '10' ? '10° Grado' : '11° Grado';
}