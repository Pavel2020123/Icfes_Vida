import type { Stats } from './tipos';

export default function EstadisticasTab({ stats }: { stats: Stats }) {
  return (
          <div style={{ display: 'grid', gap: 24 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#8a9aaa', marginBottom: 10, textTransform: 'uppercase' }}>Hoy</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                {[
                  { label: 'Estudiantes registrados hoy', valor: stats.estudiantesRegistradosHoy, color: '#1C5741' },
                  { label: 'Simulacros resueltos hoy', valor: stats.simulacrosResueltosHoy, color: '#146C94' },
                ].map(s => (
                  <div key={s.label} style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2', textAlign: 'center' }}>
                    <p style={{ fontSize: 44, fontWeight: 900, color: s.color, marginBottom: 8 }}>{s.valor}</p>
                    <p style={{ fontSize: 14, color: '#4a5a6a' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#8a9aaa', marginBottom: 10, textTransform: 'uppercase' }}>Totales</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                {[
                  { label: 'Estudiantes', valor: stats.totalEstudiantes, color: '#146C94' },
                  { label: 'Profesores', valor: stats.totalProfesores, color: '#19A7CE' },
                  { label: 'Instituciones', valor: stats.totalInstituciones, color: '#8DD8FF' },
                  { label: 'Preguntas en banco', valor: stats.totalPreguntas, color: '#AFD3E2' },
                  { label: 'Temas creados', valor: stats.totalTemas, color: '#146C94' },
                  { label: 'Simulacros realizados', valor: stats.totalSimulacros, color: '#19A7CE' },
                ].map(s => (
                  <div key={s.label} style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2', textAlign: 'center' }}>
                    <p style={{ fontSize: 44, fontWeight: 900, color: s.color, marginBottom: 8 }}>{s.valor}</p>
                    <p style={{ fontSize: 14, color: '#4a5a6a' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
  );
}