'use client';

import { cambiarRolUsuarioAdmin, eliminarUsuarioAdmin } from '../../../lib/api';
import type { Usuario } from './tipos';

export default function UsuariosTab({
  usuarios,
  miId,
  mostrarMensaje,
  cargarDatos,
}: {
  usuarios: Usuario[];
  miId: string | null;
  mostrarMensaje: (msg: string) => void;
  cargarDatos: () => Promise<void>;
}) {
  const cambiarRol = async (usuarioId: string, rol: string) => {
    await cambiarRolUsuarioAdmin(usuarioId, rol);
    mostrarMensaje('Rol actualizado');
    cargarDatos();
  };

  const eliminarUsuario = async (usuarioId: string, nombreUsuario: string) => {
    if (!confirm(`¿Eliminar la cuenta de ${nombreUsuario}? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await eliminarUsuarioAdmin(usuarioId);
    } catch (err) {
      mostrarMensaje(err instanceof Error ? err.message : 'No se pudo eliminar el usuario');
      return;
    }
    mostrarMensaje('Usuario eliminado');
    cargarDatos();
  };

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2' }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2a3a', marginBottom: 20 }}>
        Usuarios registrados — {usuarios.length}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {usuarios.map(u => (
          <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', border: '1px solid #D2E0FB', borderRadius: 10, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <p style={{ fontWeight: 700, color: '#1a2a3a', fontSize: 15, marginBottom: 2 }}>{u.nombre}</p>
              <p style={{ color: '#8a9aaa', fontSize: 13 }}>{u.correo}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#19A7CE', fontWeight: 700 }}>{u.xpTotal} XP</span>
              <select
                value={u.rol ?? 'ESTUDIANTE'}
                onChange={e => cambiarRol(u.id, e.target.value)}
                style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #AFD3E2', fontSize: 13, fontWeight: 600, color: '#146C94', backgroundColor: '#F6F1F1', cursor: 'pointer' }}
              >
                <option value="ESTUDIANTE">Estudiante</option>
                <option value="PROFESOR">Profesor</option>
                <option value="ADMIN">Admin</option>
              </select>
              {u.id !== miId && (
                <button
                  onClick={() => eliminarUsuario(u.id, u.nombre)}
                  title="Eliminar usuario"
                  style={{ background: 'none', border: '1.5px solid #FCD8CD', color: '#BC7C7C', borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}