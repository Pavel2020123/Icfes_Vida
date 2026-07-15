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
    const payload = JSON.parse(atob(partes[1]));
    return payload;
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
