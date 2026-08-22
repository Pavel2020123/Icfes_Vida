'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MenuLateral from '../../components/MenuLateral';
import {
  obtenerPlanEstudioSemanal,
  obtenerProgresoSimulacros,
  obtenerToken,
  type DiaPlanEstudio,
  type PlanEstudioSemanal,
} from '../../lib/api';
import { decodificarToken } from '../../lib/auth';
import styles from './plan-estudio.module.css';

const AREAS: Record<string, string> = {
  LECTURA_CRITICA: 'Lectura Crítica',
  MATEMATICAS: 'Matemáticas',
  CIENCIAS_NATURALES: 'Ciencias Naturales',
  SOCIALES_CIUDADANAS: 'Sociales y Ciudadanas',
  INGLES: 'Inglés',
};

const TIPOS: Record<DiaPlanEstudio['tipo'], string> = {
  ESTUDIO: 'Estudio',
  SIMULACRO: 'Simulacro',
  DESCANSO: 'Recuperación',
  EXAMEN: 'Examen',
};

interface Progreso {
  porcentajeGeneral: number;
  temasCompletados: number;
  totalSubtemas: number;
}

function fechaDesdeClave(valor: string) {
  return new Date(`${valor}T12:00:00`);
}

function fechaCorta(valor: string) {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(fechaDesdeClave(valor));
}

function EstadoVacio({ plan }: { plan: Exclude<PlanEstudioSemanal, { estado: 'LISTO' }> }) {
  const contenidos = {
    DIAGNOSTICO_PENDIENTE: {
      titulo: 'Primero necesitamos conocerte',
      texto: 'Completa el diagnóstico inicial para priorizar las áreas que más necesitas reforzar.',
      href: '/diagnostico',
      accion: 'Hacer diagnóstico',
    },
    FECHA_PENDIENTE: {
      titulo: 'Falta la fecha de la convocatoria',
      texto: 'Cuando el administrador active la fecha real del ICFES, tu plan se generará automáticamente.',
      href: '/dashboard',
      accion: 'Volver al inicio',
    },
    CONVOCATORIA_FINALIZADA: {
      titulo: 'Esta convocatoria ya finalizó',
      texto: 'Tu siguiente plan aparecerá cuando se active una nueva convocatoria ICFES.',
      href: '/dashboard',
      accion: 'Volver al inicio',
    },
    SIN_CONTENIDO: {
      titulo: 'Todavía no hay contenido disponible',
      texto: 'Tu plan se preparará en cuanto se publiquen subtemas para estudiar.',
      href: '/dashboard',
      accion: 'Volver al inicio',
    },
    TODO_COMPLETADO: {
      titulo: 'Completaste todos los subtemas',
      texto: 'Mantén el ritmo con un simulacro personalizado mientras llega contenido nuevo.',
      href: '/simulacro-personalizado',
      accion: 'Hacer simulacro',
    },
  } as const;
  const contenido = contenidos[plan.estado];

  return (
    <section className={styles.emptyState}>
      <span className={styles.emptyLabel}>PLAN SEMANAL</span>
      <h1>{contenido.titulo}</h1>
      <p>{contenido.texto}</p>
      <Link href={contenido.href}>{contenido.accion}</Link>
    </section>
  );
}

export default function PlanEstudioPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('Estudiante');
  const [plan, setPlan] = useState<PlanEstudioSemanal | null>(null);
  const [progreso, setProgreso] = useState<Progreso>({
    porcentajeGeneral: 0,
    temasCompletados: 0,
    totalSubtemas: 0,
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const usuario = decodificarToken(obtenerToken());
    if (!usuario) {
      router.push('/login');
      return;
    }
    if (usuario.rol !== 'ESTUDIANTE') {
      router.push('/dashboard');
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNombre(usuario.nombre || 'Estudiante');
    Promise.all([
      obtenerPlanEstudioSemanal(),
      obtenerProgresoSimulacros().catch(() => null),
    ])
      .then(([planDatos, progresoDatos]) => {
        setPlan(planDatos);
        if (progresoDatos) setProgreso(progresoDatos);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo cargar el plan semanal.',
        );
      })
      .finally(() => setCargando(false));
  }, [router]);

  if (cargando) {
    return <div className={styles.loading}>Preparando tu semana...</div>;
  }

  return (
    <div className={styles.page}>
      <MenuLateral
        nombre={nombre}
        progresoGeneral={progreso.porcentajeGeneral}
        temasCompletados={progreso.temasCompletados}
        totalSubtemas={progreso.totalSubtemas}
      />

      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <strong>Plan semanal</strong>
          <Link href="/dashboard">Volver al inicio</Link>
        </div>
      </nav>

      <main className={styles.main}>
        {error ? (
          <div className={styles.error}>{error}</div>
        ) : plan && plan.estado !== 'LISTO' ? (
          <EstadoVacio plan={plan} />
        ) : plan?.estado === 'LISTO' ? (
          <>
            <header className={styles.heading}>
              <div>
                <span className={styles.eyebrow}>AGENDA PERSONALIZADA</span>
                <h1>Esta es tu semana, {nombre.split(' ')[0]}</h1>
                <p>
                  Del {fechaCorta(plan.semana.inicio)} al {fechaCorta(plan.semana.fin)}
                </p>
              </div>
              <div className={styles.examCounter}>
                <strong>{plan.convocatoria.diasRestantes}</strong>
                <span>días para el ICFES {plan.convocatoria.calendario}</span>
              </div>
            </header>

            <section className={styles.summary}>
              <div className={styles.summaryIntro}>
                <span>Progreso semanal</span>
                <strong>
                  {plan.resumen.sesionesCompletadas} de {plan.resumen.sesionesObjetivo} sesiones
                </strong>
              </div>
              <div className={styles.progressTrack} aria-label={`${plan.resumen.porcentaje}% completado`}>
                <div style={{ width: `${plan.resumen.porcentaje}%` }} />
              </div>
              <div className={styles.summaryMeta}>
                <div>
                  <span>Área prioritaria</span>
                  <strong>{plan.diagnostico.areaPrioritaria ? AREAS[plan.diagnostico.areaPrioritaria] : 'General'}</strong>
                </div>
                <div>
                  <span>Tiempo estimado</span>
                  <strong>{plan.resumen.minutosObjetivoSemanal} min</strong>
                </div>
                <div>
                  <span>Diagnóstico</span>
                  <strong>{Math.round(plan.diagnostico.porcentaje)}%</strong>
                </div>
              </div>
            </section>

            <section className={styles.agenda}>
              <div className={styles.agendaTitle}>
                <div>
                  <span>ACTIVIDADES</span>
                  <h2>Agenda de la semana</h2>
                </div>
                <p>Se actualiza cada lunes</p>
              </div>

              <div className={styles.dayList}>
                {plan.dias.map((dia) => (
                  <article
                    className={`${styles.dayRow} ${dia.completada ? styles.completed : ''}`}
                    key={dia.id}
                  >
                    <time dateTime={dia.fecha}>{fechaCorta(dia.fecha)}</time>
                    <span className={`${styles.type} ${styles[dia.tipo.toLowerCase()]}`}>
                      {TIPOS[dia.tipo]}
                    </span>
                    <div className={styles.dayContent}>
                      <strong>{dia.titulo}</strong>
                      <p>{dia.detalle}</p>
                    </div>
                    <div className={styles.dayStatus}>
                      {dia.completada ? (
                        <span className={styles.done}>Completada</span>
                      ) : dia.minutos > 0 ? (
                        <span>{dia.minutos} min</span>
                      ) : null}
                      {dia.accion && !dia.completada && (
                        <Link href={dia.accion.href}>{dia.accion.etiqueta}</Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
