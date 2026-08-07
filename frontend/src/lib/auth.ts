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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const raw = JSON.parse(atob(partes[1]));
    const payload: any = {
      id: raw.sub ?? raw.id,
      nombre: raw.nombre,
      correo: raw.correo,
      rol: raw.rol,
      institucionId: raw.institucionId ?? raw.institucion_id,
    };
    // Basic validation
    if (!payload.id || !payload.correo) return null;
    return payload as TokenPayload;
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
