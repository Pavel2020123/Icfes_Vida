export const API_URL = 'http://localhost:3000';

// El backend guarda los logos en disco local y los sirve como
// '/uploads/logos/xxx.png' (ruta relativa). Esta función la convierte en
// una URL absoluta que el navegador sí puede cargar. Si en el futuro
// migramos a Supabase Storage, logoUrl ya vendrá con una URL absoluta
// (http...) y esta función simplemente la deja pasar sin tocarla.
export function obtenerUrlLogo(logoUrl?: string | null): string | null {
  if (!logoUrl) return null;
  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
    return logoUrl;
  }
  return `${API_URL}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`;
}

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

export async function actualizarInstitucion(
  nombre?: string,
  mensajeBienvenida?: string,
  logoUrl?: string,
  colorPrimario?: string,
  colorSecundario?: string,
) {
  const res = await fetch(`${API_URL}/instituciones/me`, {
    method: 'PATCH',
    headers: crearEncabezados(),
    body: JSON.stringify({
      nombre,
      mensajeBienvenida,
      logoUrl,
      colorPrimario,
      colorSecundario,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Error actualizando la institución');
  }

  return data;
}

// Sube (o reemplaza) el logo real de la institución. Se envía como
// multipart/form-data, por eso NO usamos crearEncabezados() aquí: si
// fijamos 'Content-Type': 'application/json' el navegador no puede armar
// el boundary del form-data y el backend no recibe el archivo. Dejamos
// que fetch ponga el Content-Type correcto solo, y mandamos únicamente
// el header de Authorization.
export async function subirLogoInstitucion(archivo: File) {
  const formData = new FormData();
  formData.append('logo', archivo);

  const token = obtenerToken();
  const res = await fetch(`${API_URL}/instituciones/me/logo`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error subiendo el logo');
  return data;
}

export async function eliminarLogoInstitucion() {
  const res = await fetch(`${API_URL}/instituciones/me/logo`, {
    method: 'DELETE',
    headers: crearEncabezados(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error eliminando el logo');
  return data;
}

export async function eliminarInstitucion() {
  const res = await fetch(`${API_URL}/instituciones/me`, {
    method: 'DELETE',
    headers: crearEncabezados(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error eliminando la institución');
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