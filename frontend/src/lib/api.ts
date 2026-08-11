export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

export function obtenerEncabezadosAutenticacion(): HeadersInit {
  const token = obtenerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function crearEncabezadosFormData(): HeadersInit {
  return obtenerEncabezadosAutenticacion();
}

export function crearEncabezados(json = true): HeadersInit {
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...obtenerEncabezadosAutenticacion(),
  };
}

// Helper central: unifica el patrón fetch → parse JSON → if (!res.ok) throw
// que antes se repetía en cada función de este archivo (~30 veces). Recibe
// una ruta relativa (se le antepone API_URL), las opciones normales de
// fetch, y un mensaje de error por defecto para cuando el backend no manda
// uno propio en el body. No cambia ningún mensaje de error existente.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function apiFetch<T = any>(
  ruta: string,
  opciones: RequestInit = {},
  mensajeErrorPorDefecto = 'Ocurrió un error inesperado',
): Promise<T> {
  const res = await fetch(`${API_URL}${ruta}`, opciones);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || mensajeErrorPorDefecto);
  }
  return data;
}

export async function loginUsuario(correo: string, contrasena: string) {
  return apiFetch(
    '/auth/login',
    {
      method: 'POST',
      headers: crearEncabezados(),
      body: JSON.stringify({ correo, contrasena }),
    },
    'Error al iniciar sesión',
  );
}

export async function registrarUsuario(nombre: string, correo: string, contrasena: string) {
  return apiFetch(
    '/auth/registro',
    {
      method: 'POST',
      headers: crearEncabezados(),
      body: JSON.stringify({ nombre, correo, contrasena }),
    },
    'Error al registrarse',
  );
}

export async function obtenerMiInstitucion() {
  return apiFetch(
    '/instituciones/me',
    { headers: crearEncabezados() },
    'Error obteniendo la institución',
  );
}

export async function crearInstitucion(
  nombre: string,
  mensajeBienvenida?: string,
  logoUrl?: string,
  colorPrimario?: string,
  colorSecundario?: string,
) {
  return apiFetch(
    '/instituciones',
    {
      method: 'POST',
      headers: crearEncabezados(),
      body: JSON.stringify({ nombre, mensajeBienvenida, logoUrl, colorPrimario, colorSecundario }),
    },
    'Error creando la institución',
  );
}

export async function obtenerEstudiantesInstitucion() {
  return apiFetch(
    '/instituciones/me/estudiantes',
    { headers: crearEncabezados() },
    'Error obteniendo los estudiantes',
  );
}

export async function obtenerAnaliticasInstitucion() {
  return apiFetch(
    '/instituciones/me/analiticas',
    { headers: crearEncabezados() },
    'Error obteniendo las analíticas',
  );
}

export async function crearEstudianteInstitucion(nombre: string, correo: string, contrasena: string, claseId?: string) {
  return apiFetch(
    '/instituciones/me/estudiantes',
    {
      method: 'POST',
      headers: crearEncabezados(),
      body: JSON.stringify({ nombre, correo, contrasena, claseId: claseId || undefined }),
    },
    'Error creando el estudiante',
  );
}

export async function agregarEstudianteExistenteInstitucion(correo: string, claseId?: string) {
  return apiFetch(
    '/instituciones/me/estudiantes/agregar',
    {
      method: 'POST',
      headers: crearEncabezados(),
      body: JSON.stringify({ correo, claseId: claseId || undefined }),
    },
    'Error agregando el estudiante',
  );
}

// Multipart/form-data: NO usamos crearEncabezados() porque fijar
// 'Content-Type': 'application/json' rompería el boundary del form-data.
// Dejamos que el navegador ponga el Content-Type correcto solo y mandamos
// únicamente el header de Authorization.
export async function importarEstudiantesCsvInstitucion(archivo: File, claseId?: string) {
  const formData = new FormData();
  formData.append('archivo', archivo);
  if (claseId) formData.append('claseId', claseId);

  const token = obtenerToken();
  return apiFetch(
    '/instituciones/me/estudiantes/importar-csv',
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    },
    'Error importando el archivo CSV',
  );
}

export async function agregarEstudianteAGrupo(claseId: string, estudianteId: string) {
  return apiFetch(
    `/instituciones/me/grupos/${claseId}/estudiantes`,
    {
      method: 'POST',
      headers: crearEncabezados(),
      body: JSON.stringify({ estudianteId }),
    },
    'Error agregando el estudiante al grupo',
  );
}

export async function quitarEstudianteDeGrupo(claseId: string, estudianteId: string) {
  return apiFetch(
    `/instituciones/me/grupos/${claseId}/estudiantes/${estudianteId}`,
    {
      method: 'DELETE',
      headers: crearEncabezados(),
    },
    'Error quitando el estudiante del grupo',
  );
}

export async function obtenerGruposInstitucion() {
  return apiFetch(
    '/instituciones/me/grupos',
    { headers: crearEncabezados() },
    'Error obteniendo los grupos',
  );
}

export async function crearGrupoInstitucion(nombre: string, grado: 'DECIMO' | 'ONCE') {
  return apiFetch(
    '/instituciones/me/grupos',
    {
      method: 'POST',
      headers: crearEncabezados(),
      body: JSON.stringify({ nombre, grado }),
    },
    'Error creando el grupo',
  );
}

export async function actualizarGrupoInstitucion(claseId: string, nombre: string) {
  return apiFetch(
    `/instituciones/me/grupos/${claseId}`,
    {
      method: 'PATCH',
      headers: crearEncabezados(),
      body: JSON.stringify({ nombre }),
    },
    'Error actualizando el grupo',
  );
}

export async function eliminarGrupoInstitucion(claseId: string) {
  return apiFetch(
    `/instituciones/me/grupos/${claseId}`,
    {
      method: 'DELETE',
      headers: crearEncabezados(),
    },
    'Error eliminando el grupo',
  );
}

export async function unirseAClase(codigoIngreso: string) {
  return apiFetch(
    '/instituciones/unirse',
    {
      method: 'POST',
      headers: crearEncabezados(),
      body: JSON.stringify({ codigoIngreso }),
    },
    'Error al unirse a la clase',
  );
}

export async function actualizarInstitucion(
  nombre?: string,
  mensajeBienvenida?: string,
  logoUrl?: string,
  colorPrimario?: string,
  colorSecundario?: string,
) {
  return apiFetch(
    '/instituciones/me',
    {
      method: 'PATCH',
      headers: crearEncabezados(),
      body: JSON.stringify({
        nombre,
        mensajeBienvenida,
        logoUrl,
        colorPrimario,
        colorSecundario,
      }),
    },
    'Error actualizando la institución',
  );
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
  return apiFetch(
    '/instituciones/me/logo',
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    },
    'Error subiendo el logo',
  );
}

export async function eliminarLogoInstitucion() {
  return apiFetch(
    '/instituciones/me/logo',
    {
      method: 'DELETE',
      headers: crearEncabezados(),
    },
    'Error eliminando el logo',
  );
}

export async function eliminarInstitucion() {
  return apiFetch(
    '/instituciones/me',
    {
      method: 'DELETE',
      headers: crearEncabezados(),
    },
    'Error eliminando la institución',
  );
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

export async function obtenerHistorialSimulacros() {
  return apiFetch(
    '/simulacros/historial',
    { headers: crearEncabezados() },
    'Error obteniendo el historial de simulacros',
  );
}

export async function obtenerProgresoSimulacros() {
  return apiFetch(
    '/simulacros/progreso',
    { headers: crearEncabezados() },
    'Error obteniendo el progreso',
  );
}

export async function obtenerTemasPorArea(area: string) {
  return apiFetch(
    `/simulacros/temas?area=${area}`,
    {},
    'Error obteniendo los temas',
  );
}

export async function obtenerPreguntasDeSubtema(subtemaId: string) {
  return apiFetch(
    `/admin/preguntas/${subtemaId}`,
    { headers: crearEncabezados() },
    'Error obteniendo las preguntas',
  );
}

export async function marcarProgresoSubtema(subtemaId: string, porcentaje: number) {
  return apiFetch(
    '/simulacros/progreso',
    {
      method: 'POST',
      headers: crearEncabezados(),
      body: JSON.stringify({ subtemaId, porcentaje }),
    },
    'Error guardando el progreso',
  );
}

// Caso especial: necesitamos inspeccionar status+data de una respuesta 403
// SIN que se lance una excepción (para distinguir "plan vencido" de un
// error genérico). Por eso NO usa apiFetch aquí, a diferencia del resto de
// funciones de este archivo.
export async function calificarSimulacroDeArea(
  area: string,
  respuestas: { preguntaId: string; respuestaId: string }[],
) {
  const res = await fetch(`${API_URL}/simulacros/calificar`, {
    method: 'POST',
    headers: crearEncabezados(),
    body: JSON.stringify({ area, respuestas }),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// ─── MURO DE PAGO (punto 5) ──────────────────────────────────
export async function obtenerPerfilCompleto() {
  return apiFetch(
    '/auth/perfil',
    { headers: crearEncabezados() },
    'Error obteniendo el perfil',
  );
}

// El backend responde 403 con { codigo: 'PLAN_VENCIDO', mensaje } cuando la
// prueba gratis de 3 días de un estudiante individual ya terminó.
// NOTA: esta función se usa junto a llamadas fetch hechas a mano en
// simulacro/page.tsx, simulacro-personalizado/page.tsx y
// estudiar/[area]/page.tsx, que necesitan inspeccionar status+data de una
// respuesta 403 SIN que se lance una excepción. Por eso no pasa por
// apiFetch (que siempre lanza en !res.ok) — queda pendiente para cuando
// migremos esas páginas a la capa de datos.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function esRespuestaPlanVencido(status: number, data: any): boolean {
  return status === 403 && data?.codigo === 'PLAN_VENCIDO';
}

// ─── VERIFICACIÓN DE CORREO (punto 7) ────────────────────────
export async function verificarCorreo(token: string) {
  // El "token" viene siempre de la URL que el usuario abre desde su
  // correo (?token=xxxx), nunca hay que escribirlo ni guardarlo a mano.
  return apiFetch(
    '/auth/verificar-correo',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    },
    'No se pudo confirmar el correo',
  );
}

export async function reenviarVerificacionCorreo(correo: string) {
  return apiFetch(
    '/auth/reenviar-verificacion',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo }),
    },
    'No se pudo reenviar el correo',
  );
}

// El backend responde 403 con { codigo: 'CORREO_NO_VERIFICADO', mensaje }
// cuando un estudiante individual intenta estudiar sin confirmar su correo.
// Ver la nota en esRespuestaPlanVencido: mismo motivo para no pasar por
// apiFetch.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function esRespuestaCorreoNoVerificado(status: number, data: any): boolean {
  return status === 403 && data?.codigo === 'CORREO_NO_VERIFICADO';
}

// ─── RECUPERACIÓN DE CONTRASEÑA (punto 8) ────────────────────
export async function solicitarRecuperacionContrasena(correo: string) {
  return apiFetch(
    '/auth/solicitar-recuperacion',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo }),
    },
    'No se pudo enviar el correo de recuperación',
  );
}

export async function restablecerContrasena(token: string, nuevaContrasena: string) {
  return apiFetch(
    '/auth/restablecer-contrasena',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, nuevaContrasena }),
    },
    'No se pudo restablecer la contraseña',
  );
}

// ─── PANEL DE ADMINISTRACIÓN ──────────────────────────────────
export async function obtenerEstadisticasAdmin() {
  return apiFetch('/admin/estadisticas', { headers: crearEncabezados() }, 'Error obteniendo estadísticas');
}

export async function obtenerTemasAdmin() {
  return apiFetch('/admin/temas', { headers: crearEncabezados() }, 'Error obteniendo los temas');
}

export async function obtenerUsuariosAdmin() {
  return apiFetch('/admin/usuarios', { headers: crearEncabezados() }, 'Error obteniendo los usuarios');
}

export async function crearTemaAdmin(nombre: string, area: string) {
  return apiFetch(
    '/admin/temas',
    { method: 'POST', headers: crearEncabezados(), body: JSON.stringify({ nombre, area }) },
    'Error creando el tema',
  );
}

export async function eliminarTemaAdmin(id: string) {
  return apiFetch(`/admin/temas/${id}`, { method: 'DELETE', headers: crearEncabezados() }, 'Error eliminando el tema');
}

export async function crearSubtemaAdmin(nombre: string, temaId: string) {
  return apiFetch(
    '/admin/subtemas',
    { method: 'POST', headers: crearEncabezados(), body: JSON.stringify({ nombre, temaId }) },
    'Error creando el subtema',
  );
}

export async function eliminarSubtemaAdmin(id: string) {
  return apiFetch(`/admin/subtemas/${id}`, { method: 'DELETE', headers: crearEncabezados() }, 'Error eliminando el subtema');
}

export async function actualizarContenidoSubtemaAdmin(
  subtemaId: string,
  contenido: string,
  videoUrl: string,
  imagenUrl: string,
) {
  return apiFetch(
    `/admin/subtemas/${subtemaId}/contenido`,
    {
      method: 'PATCH',
      headers: crearEncabezados(),
      body: JSON.stringify({ contenido, videoUrl, imagenUrl }),
    },
    'Error guardando el contenido',
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function actualizarInteractivoSubtemaAdmin(subtemaId: string, datosInteractivo: any) {
  return apiFetch(
    `/admin/subtemas/${subtemaId}/interactivo`,
    {
      method: 'PATCH',
      headers: crearEncabezados(),
      body: JSON.stringify({ tipoInteractivo: 'CLOZE', datosInteractivo }),
    },
    'Error guardando el ejercicio interactivo',
  );
}

export async function obtenerPreguntasAdmin(subtemaId: string) {
  return apiFetch(`/admin/preguntas/${subtemaId}`, { headers: crearEncabezados() }, 'Error obteniendo las preguntas');
}

export async function eliminarPreguntaAdmin(id: string) {
  return apiFetch(`/admin/preguntas/${id}`, { method: 'DELETE', headers: crearEncabezados() }, 'Error eliminando la pregunta');
}

interface RespuestaPreguntaAdmin {
  texto: string;
  esCorrecta: boolean;
}

export async function crearPreguntaAdmin(
  enunciado: string,
  subtemaId: string,
  dificultad: string,
  imagenUrl: string | null,
  respuestas: RespuestaPreguntaAdmin[],
) {
  return apiFetch(
    '/admin/preguntas',
    {
      method: 'POST',
      headers: crearEncabezados(),
      body: JSON.stringify({ enunciado, subtemaId, dificultad, imagenUrl, respuestas }),
    },
    'Error creando la pregunta',
  );
}

export async function crearPreguntaAleatoriaAdmin(
  area: string,
  enunciado: string,
  imagenUrl: string | null,
  respuestas: RespuestaPreguntaAdmin[],
) {
  return apiFetch(
    '/admin/preguntas-aleatorias',
    {
      method: 'POST',
      headers: crearEncabezados(),
      body: JSON.stringify({ area, enunciado, imagenUrl, respuestas }),
    },
    'Error agregando la pregunta al banco',
  );
}

export async function cambiarRolUsuarioAdmin(usuarioId: string, rol: string) {
  return apiFetch(
    `/admin/usuarios/${usuarioId}/rol`,
    { method: 'PATCH', headers: crearEncabezados(), body: JSON.stringify({ rol }) },
    'Error actualizando el rol',
  );
}

export async function eliminarUsuarioAdmin(usuarioId: string) {
  return apiFetch(`/admin/usuarios/${usuarioId}`, { method: 'DELETE', headers: crearEncabezados() }, 'No se pudo eliminar el usuario');
}

// ─── CALENDARIO ICFES (admin) ─────────────────────────────────
export async function obtenerCalendarioIcfesAdmin() {
  return apiFetch('/calendario-icfes/admin', { headers: crearEncabezados() }, 'Error obteniendo el calendario');
}

export async function crearFechaCalendarioIcfesAdmin(datos: {
  anio: number;
  calendario: string;
  fechaExamen: string;
}) {
  return apiFetch(
    '/calendario-icfes/admin',
    { method: 'POST', headers: crearEncabezados(), body: JSON.stringify(datos) },
    'No se pudo guardar la fecha',
  );
}

export async function actualizarFechaCalendarioIcfesAdmin(id: string, fechaExamen: string) {
  return apiFetch(
    `/calendario-icfes/admin/${id}`,
    { method: 'PATCH', headers: crearEncabezados(), body: JSON.stringify({ fechaExamen }) },
    'No se pudo actualizar la fecha',
  );
}

export async function eliminarFechaCalendarioIcfesAdmin(id: string) {
  return apiFetch(
    `/calendario-icfes/admin/${id}`,
    { method: 'DELETE', headers: crearEncabezados() },
    'No se pudo eliminar la fecha',
  );
}

// ─── PAGOS (ePayco) — punto 9: muro de pago del estudiante individual ───
export interface DatosCheckoutEpayco {
  factura: string;
  publicKey: string;
  test: boolean;
  amount: number;
  currency: string;
  country: string;
  name: string;
  description: string;
  email: string;
  nombre: string;
}

export async function crearOrdenPagoIndividual(grado: 'DECIMO' | 'ONCE') {
  return apiFetch<DatosCheckoutEpayco>(
    '/pagos/crear-orden',
    { method: 'POST', headers: crearEncabezados(), body: JSON.stringify({ grado }) },
    'No se pudo iniciar el pago',
  );
}

export interface EstadoOrdenPago {
  factura: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'PENDIENTE_BANCO' | 'FALLIDA';
  monto: number;
  grado: 'DECIMO' | 'ONCE';
  fechaActualizacion: string;
}

export async function obtenerEstadoOrdenPago(factura: string) {
  return apiFetch<EstadoOrdenPago>(
    `/pagos/estado/${factura}`,
    { headers: crearEncabezados() },
    'No se pudo consultar el estado del pago',
  );
}

// ─── PUNTO 11 DEL ROADMAP: formulario "Hablar con ventas" ───────
export interface DatosLeadVentas {
  nombreColegio: string;
  nombreContacto: string;
  correo: string;
  telefono?: string;
  ciudad?: string;
  linea: 'ONCE' | 'BACHILLERATO';
  plan: 'Básico' | 'Plus' | 'Colegio';
  numeroEstudiantesAprox?: number;
  mensaje?: string;
}

export async function crearLeadVentas(datos: DatosLeadVentas) {
  return apiFetch<{ ok: boolean; id: string }>(
    '/ventas/contacto',
    {
      method: 'POST',
      headers: crearEncabezados(),
      body: JSON.stringify(datos),
    },
    'No se pudo enviar tu solicitud. Intenta de nuevo.',
  );
}