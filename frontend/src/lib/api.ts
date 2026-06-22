const API_URL = 'http://localhost:3000';

export async function loginUsuario(correo: string, contrasena: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contrasena }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');
  return data;
}

export async function registrarUsuario(nombre: string, correo: string, contrasena: string, rol: string = 'ESTUDIANTE') {
  const res = await fetch(`${API_URL}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, correo, contrasena, rol }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al registrarse');
  return data;
}

export function guardarToken(token: string) {
  localStorage.setItem('saberplus_token', token);
}

export function obtenerToken(): string | null {
  return localStorage.getItem('saberplus_token');
}

export function cerrarSesion() {
  localStorage.removeItem('saberplus_token');
}