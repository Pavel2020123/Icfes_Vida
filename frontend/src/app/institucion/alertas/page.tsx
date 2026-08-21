"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../../components/ProtectedRoute";
import {
  IconoAlerta,
  IconoFlechaIzquierda,
  IconoRecargar,
} from "../../../components/Iconos";
import {
  obtenerAlertasRiesgoInstitucion,
  type AlertasRiesgoInstitucion,
  type NivelRiesgo,
} from "../../../lib/api";
import styles from "./alertas.module.css";

type Filtro = "TODAS" | NivelRiesgo;

const AREA_NOMBRES: Record<string, string> = {
  LECTURA_CRITICA: "Lectura Crítica",
  MATEMATICAS: "Matemáticas",
  CIENCIAS_NATURALES: "Ciencias Naturales",
  SOCIALES_CIUDADANAS: "Sociales y Ciudadanas",
  INGLES: "Inglés",
};

const NIVEL_NOMBRES: Record<NivelRiesgo, string> = {
  CRITICA: "Crítica",
  ALTA: "Alta",
  ATENCION: "Atención",
};

const VACIO: AlertasRiesgoInstitucion = {
  generadoEn: "",
  resumen: {
    totalEstudiantes: 0,
    enRiesgo: 0,
    criticas: 0,
    altas: 0,
    atencion: 0,
    sinAlertas: 0,
  },
  alertas: [],
};

function fechaActividad(fecha: string | null) {
  if (!fecha) return "Sin actividad";
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AlertasRiesgoPage() {
  const router = useRouter();
  const [datos, setDatos] = useState<AlertasRiesgoInstitucion>(VACIO);
  const [filtro, setFiltro] = useState<Filtro>("TODAS");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!window.localStorage.getItem("saberplus_token")) {
      router.replace("/login");
      return;
    }
    obtenerAlertasRiesgoInstitucion()
      .then(setDatos)
      .catch((err: Error) => setError(err.message))
      .finally(() => setCargando(false));
  }, [router]);

  const actualizar = async () => {
    setActualizando(true);
    setError("");
    try {
      setDatos(await obtenerAlertasRiesgoInstitucion());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar.");
    } finally {
      setActualizando(false);
    }
  };

  const alertasVisibles = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es");
    return datos.alertas.filter((alerta) => {
      const coincideNivel = filtro === "TODAS" || alerta.nivel === filtro;
      const coincideTexto =
        !texto ||
        alerta.estudiante.nombre.toLocaleLowerCase("es").includes(texto) ||
        alerta.estudiante.correo.toLocaleLowerCase("es").includes(texto) ||
        alerta.estudiante.grupos.some((grupo) =>
          grupo.nombre.toLocaleLowerCase("es").includes(texto),
        );
      return coincideNivel && coincideTexto;
    });
  }, [busqueda, datos.alertas, filtro]);

  return (
    <ProtectedRoute rolesPermitidos={["PROFESOR"]}>
      <div className={styles.page}>
        <main className={styles.container}>
          <header className={styles.header}>
            <div>
              <Link href="/institucion" className={styles.backLink}>
                <IconoFlechaIzquierda size={16} /> Institución
              </Link>
              <div className={styles.titleRow}>
                <span className={styles.titleIcon} aria-hidden="true">
                  <IconoAlerta size={23} />
                </span>
                <div>
                  <h1>Alertas de riesgo</h1>
                  <p>Estudiantes que necesitan seguimiento prioritario.</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              className={styles.refreshButton}
              onClick={actualizar}
              disabled={actualizando}
              title="Actualizar alertas"
            >
              <IconoRecargar size={17} />
              {actualizando ? "Actualizando" : "Actualizar"}
            </button>
          </header>

          <section className={styles.summary} aria-label="Resumen de alertas">
            <button
              type="button"
              className={filtro === "TODAS" ? styles.activeSummary : ""}
              onClick={() => setFiltro("TODAS")}
            >
              <span>En riesgo</span>
              <strong>{datos.resumen.enRiesgo}</strong>
            </button>
            <button
              type="button"
              className={`${styles.criticalMetric} ${filtro === "CRITICA" ? styles.activeSummary : ""}`}
              onClick={() => setFiltro("CRITICA")}
            >
              <span>Críticas</span>
              <strong>{datos.resumen.criticas}</strong>
            </button>
            <button
              type="button"
              className={`${styles.highMetric} ${filtro === "ALTA" ? styles.activeSummary : ""}`}
              onClick={() => setFiltro("ALTA")}
            >
              <span>Altas</span>
              <strong>{datos.resumen.altas}</strong>
            </button>
            <button
              type="button"
              className={`${styles.attentionMetric} ${filtro === "ATENCION" ? styles.activeSummary : ""}`}
              onClick={() => setFiltro("ATENCION")}
            >
              <span>Atención</span>
              <strong>{datos.resumen.atencion}</strong>
            </button>
            <div className={styles.stableMetric}>
              <span>Sin alertas</span>
              <strong>{datos.resumen.sinAlertas}</strong>
            </div>
          </section>

          <section className={styles.toolbar}>
            <div className={styles.segmented} aria-label="Filtrar por nivel">
              {(["TODAS", "CRITICA", "ALTA", "ATENCION"] as Filtro[]).map(
                (opcion) => (
                  <button
                    type="button"
                    key={opcion}
                    className={filtro === opcion ? styles.activeSegment : ""}
                    onClick={() => setFiltro(opcion)}
                  >
                    {opcion === "TODAS" ? "Todas" : NIVEL_NOMBRES[opcion]}
                  </button>
                ),
              )}
            </div>
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar estudiante o grupo"
              aria-label="Buscar estudiante o grupo"
            />
          </section>

          {error && <p className={styles.error}>{error}</p>}

          {cargando ? (
            <div className={styles.state}>Calculando señales de riesgo...</div>
          ) : alertasVisibles.length === 0 ? (
            <div className={styles.state}>
              <strong>Sin alertas en esta vista</strong>
              <span>
                {datos.resumen.enRiesgo === 0
                  ? "Todos los estudiantes están estables por ahora."
                  : "Prueba con otro nivel o término de búsqueda."}
              </span>
            </div>
          ) : (
            <div className={styles.alertList}>
              {alertasVisibles.map((alerta) => (
                <article
                  className={`${styles.alertCard} ${styles[alerta.nivel.toLowerCase()]}`}
                  key={alerta.estudiante.id}
                >
                  <div className={styles.studentHeader}>
                    <div className={styles.studentIdentity}>
                      <div>
                        <h2>{alerta.estudiante.nombre}</h2>
                        <p>{alerta.estudiante.correo}</p>
                      </div>
                      <div className={styles.groups}>
                        {alerta.estudiante.grupos.length > 0 ? (
                          alerta.estudiante.grupos.map((grupo) => (
                            <span key={grupo.id}>{grupo.nombre}</span>
                          ))
                        ) : (
                          <span>Sin grupo</span>
                        )}
                      </div>
                    </div>
                    <span className={styles.levelBadge}>
                      {NIVEL_NOMBRES[alerta.nivel]}
                    </span>
                  </div>

                  <div className={styles.reasons}>
                    {alerta.razones.map((razon) => (
                      <div key={razon.codigo}>
                        <strong>{razon.titulo}</strong>
                        <span>{razon.detalle}</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.metrics}>
                    <div>
                      <span>Última actividad</span>
                      <strong>{fechaActividad(alerta.actividad.ultimaActividad)}</strong>
                    </div>
                    <div>
                      <span>Aciertos recientes</span>
                      <strong>
                        {alerta.actividad.porcentajeAciertosReciente === null
                          ? "Sin muestra"
                          : `${alerta.actividad.porcentajeAciertosReciente}%`}
                      </strong>
                    </div>
                    <div>
                      <span>Diagnóstico</span>
                      <strong>
                        {alerta.diagnostico.porcentaje === null
                          ? "Pendiente"
                          : `${alerta.diagnostico.porcentaje}%`}
                      </strong>
                    </div>
                    <div>
                      <span>Progreso</span>
                      <strong>{alerta.progreso.porcentaje}%</strong>
                    </div>
                    <div>
                      <span>Área prioritaria</span>
                      <strong>
                        {alerta.areaPrioritaria
                          ? AREA_NOMBRES[alerta.areaPrioritaria]
                          : "Por identificar"}
                      </strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <footer className={styles.footer}>
            <span>
              {datos.generadoEn
                ? `Actualizado ${new Date(datos.generadoEn).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}`
                : ""}
            </span>
            <Link href="/institucion/estudiantes">Ver todos los estudiantes</Link>
          </footer>
        </main>
      </div>
    </ProtectedRoute>
  );
}
