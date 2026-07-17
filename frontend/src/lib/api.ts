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

function crearEncabezados(): HeadersInit {
  const token = obtenerToken();
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
}

export async function obtenerMiInstitucion() {
  const res = await fetch(`${API_URL}/instituciones/me`, {
    headers: crearEncabezados(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error obteniendo la institución');
  return data;
}

export async function crearInstitucion(
  nombre: string,
  mensajeBienvenida?: string,
  logoUrl?: string,
  colorPrimario?: string,
  colorSecundario?: string,
) {
  const res = await fetch(`${API_URL}/instituciones`, {
    method: 'POST',
    headers: crearEncabezados(),
    body: JSON.stringify({ nombre, mensajeBienvenida, logoUrl, colorPrimario, colorSecundario }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error creando la institución');
  return data;
}

export async function obtenerEstudiantesInstitucion() {
  const res = await fetch(`${API_URL}/instituciones/me/estudiantes`, {
    headers: crearEncabezados(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error obteniendo los estudiantes');
  return data;
}

export async function obtenerAnaliticasInstitucion() {
  const res = await fetch(`${API_URL}/instituciones/me/analiticas`, {
    headers: crearEncabezados(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error obteniendo las analíticas');
  return data;
}

export async function crearEstudianteInstitucion(nombre: string, correo: string, contrasena: string) {
  const res = await fetch(`${API_URL}/instituciones/me/estudiantes`, {
    method: 'POST',
    headers: crearEncabezados(),
    body: JSON.stringify({ nombre, correo, contrasena }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error creando el estudiante');
  return data;
}

export async function agregarEstudianteExistenteInstitucion(correo: string) {
  const res = await fetch(`${API_URL}/instituciones/me/estudiantes/agregar`, {
    method: 'POST',
    headers: crearEncabezados(),
    body: JSON.stringify({ correo }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error agregando el estudiante');
  return data;
}

export async function agregarEstudianteAGrupo(claseId: string, estudianteId: string) {
  const res = await fetch(`${API_URL}/instituciones/me/grupos/${claseId}/estudiantes`, {
    method: 'POST',
    headers: crearEncabezados(),
    body: JSON.stringify({ estudianteId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error agregando el estudiante al grupo');
  return data;
}

export async function quitarEstudianteDeGrupo(claseId: string, estudianteId: string) {
  const res = await fetch(`${API_URL}/instituciones/me/grupos/${claseId}/estudiantes/${estudianteId}`, {
    method: 'DELETE',
    headers: crearEncabezados(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error quitando el estudiante del grupo');
  return data;
}

export async function obtenerGruposInstitucion() {
  const res = await fetch(`${API_URL}/instituciones/me/grupos`, {
    headers: crearEncabezados(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error obteniendo los grupos');
  return data;
}

export async function crearGrupoInstitucion(nombre: string) {
  const res = await fetch(`${API_URL}/instituciones/me/grupos`, {
    method: 'POST',
    headers: crearEncabezados(),
    body: JSON.stringify({ nombre }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error creando el grupo');
  return data;
}

export async function unirseAClase(codigoIngreso: string) {
  const res = await fetch(`${API_URL}/instituciones/unirse`, {
    method: 'POST',
    headers: crearEncabezados(),
    body: JSON.stringify({ codigoIngreso }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al unirse a la clase');
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