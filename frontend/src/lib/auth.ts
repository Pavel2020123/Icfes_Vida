export type RolUsuario = 'ESTUDIANTE' | 'PROFESOR' | 'ADMIN';

export interface TokenPayload {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  institucionId?: string;
}

export function decodificarToken(token: string | null): TokenPayload | null {
  if (!token) return null;
  try {
    const partes = token.split('.');
    if (partes.length !== 3) return null;
    // Decodificamos sin verificar (cliente). Normalizamos claim 'sub' -> 'id'
    // para mantener compatibilidad con el backend que firma usando 'sub'.
    const raw = JSON.parse(atob(partes[1])) as Record<string, unknown>;
    const id = String(raw.sub ?? raw.id ?? '');
    const nombre = typeof raw.nombre === 'string' ? raw.nombre : '';
    const correo = typeof raw.correo === 'string' ? raw.correo : '';
    const rolRaw = typeof raw.rol === 'string' ? raw.rol : undefined;
    const rol =
      rolRaw === 'ESTUDIANTE' || rolRaw === 'PROFESOR' || rolRaw === 'ADMIN'
        ? rolRaw
        : null;
    const institucionId =
      typeof raw.institucionId === 'string'
        ? raw.institucionId
        : typeof raw.institucion_id === 'string'
        ? raw.institucion_id
        : undefined;

    if (!id || !correo || !rol) return null;

    return {
      id,
      nombre,
      correo,
      rol,
      institucionId,
    };
  } catch {
    return null;
  }
}

export function obtenerRol(): RolUsuario | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('saberplus_token');
  const payload = decodificarToken(token);
  return payload?.rol ?? null;
}

export function obtenerUsuarioId(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('saberplus_token');
  const payload = decodificarToken(token);
  return payload?.id ?? null;
}

export function obtenerInstitucionId(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('saberplus_token');
  const payload = decodificarToken(token);
  return payload?.institucionId ?? null;
}

export function esAdmin(): boolean {
  return obtenerRol() === 'ADMIN';
}

export function esProfesor(): boolean {
  return obtenerRol() === 'PROFESOR';
}

export function esEstudiante(): boolean {
  return obtenerRol() === 'ESTUDIANTE';
}
