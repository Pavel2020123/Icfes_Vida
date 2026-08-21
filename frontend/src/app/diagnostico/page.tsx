"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ContextoCasoPregunta from "../../components/ContextoCasoPregunta";
import {
  finalizarDiagnostico,
  iniciarDiagnostico,
  obtenerEstadoDiagnostico,
  obtenerToken,
  type AreaDiagnostico,
  type EstadoDiagnostico,
  type NivelDiagnostico,
} from "../../lib/api";
import styles from "./diagnostico.module.css";

const AREA_NOMBRES: Record<AreaDiagnostico, string> = {
  LECTURA_CRITICA: "Lectura Crítica",
  MATEMATICAS: "Matemáticas",
  CIENCIAS_NATURALES: "Ciencias Naturales",
  SOCIALES_CIUDADANAS: "Sociales y Ciudadanas",
  INGLES: "Inglés",
};

const NIVEL_NOMBRES: Record<NivelDiagnostico, string> = {
  POR_REFORZAR: "Por reforzar",
  EN_PROCESO: "En proceso",
  FORTALEZA: "Fortaleza",
};

function resolverImagen(imagenUrl: string) {
  if (
    imagenUrl.startsWith("http://") ||
    imagenUrl.startsWith("https://") ||
    imagenUrl.startsWith("/")
  ) {
    return imagenUrl;
  }
  return `/imagenes/${imagenUrl}`;
}

export default function DiagnosticoPage() {
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoDiagnostico | null>(null);
  const [actual, setActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const inicioPreguntaRef = useRef(0);
  const tiemposRef = useRef<Record<string, number>>({});

  const restaurarRespuestas = (datos: EstadoDiagnostico) => {
    if (datos.estado !== "EN_PROGRESO") return;
    const clave = `saberplus_diagnostico_${datos.diagnosticoId}`;
    try {
      const guardado = JSON.parse(localStorage.getItem(clave) ?? "{}");
      if (guardado && typeof guardado === "object") setRespuestas(guardado);
    } catch {
      localStorage.removeItem(clave);
    }
  };

  useEffect(() => {
    if (!obtenerToken()) {
      router.replace("/login");
      return;
    }
    obtenerEstadoDiagnostico()
      .then((datos) => {
        restaurarRespuestas(datos);
        setEstado(datos);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setCargando(false));
  }, [router]);

  useEffect(() => {
    inicioPreguntaRef.current = performance.now();
  }, [actual]);

  const comenzar = async () => {
    setProcesando(true);
    setError("");
    try {
      const datos = await iniciarDiagnostico();
      restaurarRespuestas(datos);
      setEstado(datos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar.");
    } finally {
      setProcesando(false);
    }
  };

  const seleccionar = (
    preguntaId: string,
    respuestaId: string,
    marcaTiempo: number,
  ) => {
    if (tiemposRef.current[preguntaId] === undefined) {
      tiemposRef.current[preguntaId] = Math.min(
        7200,
        Math.max(
          0,
          Math.round((marcaTiempo - inicioPreguntaRef.current) / 1000),
        ),
      );
    }
    setRespuestas((anteriores) => {
      const siguientes = { ...anteriores, [preguntaId]: respuestaId };
      if (estado?.estado === "EN_PROGRESO") {
        localStorage.setItem(
          `saberplus_diagnostico_${estado.diagnosticoId}`,
          JSON.stringify(siguientes),
        );
      }
      return siguientes;
    });
  };

  const finalizar = async () => {
    if (estado?.estado !== "EN_PROGRESO") return;
    const faltantes = estado.preguntas.filter(
      (pregunta) => !respuestas[pregunta.id],
    );
    if (faltantes.length > 0) {
      setError(`Aún te faltan ${faltantes.length} preguntas por responder.`);
      const primeraPendiente = estado.preguntas.findIndex(
        (pregunta) => !respuestas[pregunta.id],
      );
      setActual(primeraPendiente);
      return;
    }

    setProcesando(true);
    setError("");
    try {
      const resultado = await finalizarDiagnostico(
        estado.preguntas.map((pregunta) => ({
          preguntaId: pregunta.id,
          respuestaId: respuestas[pregunta.id],
          tiempoRespuestaSegundos: tiemposRef.current[pregunta.id],
        })),
      );
      localStorage.removeItem(`saberplus_diagnostico_${estado.diagnosticoId}`);
      setEstado(resultado);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo finalizar.");
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return <div className={styles.centerState}>Preparando diagnóstico...</div>;
  }

  if (!estado) {
    return (
      <div className={styles.centerState}>
        <p>{error || "No fue posible cargar el diagnóstico."}</p>
        <Link href="/dashboard">Volver al inicio</Link>
      </div>
    );
  }

  if (estado.estado === "NO_INICIADO") {
    return (
      <div className={styles.page}>
        <header className={styles.topbar}>
          <Link href="/dashboard" className={styles.brand}>
            Saber<span>Plus</span>
          </Link>
          <Link href="/dashboard" className={styles.exitLink}>
            Volver al inicio
          </Link>
        </header>
        <main className={styles.introMain}>
          <section className={styles.introPanel}>
            <div className={styles.stepLabel}>Tu punto de partida</div>
            <h1>Diagnóstico inicial</h1>
            <p className={styles.introCopy}>
              Responde una muestra de las cinco áreas. Con el resultado
              identificaremos tu fortaleza y el área que conviene priorizar.
            </p>
            <div className={styles.facts}>
              <div>
                <strong>15</strong>
                <span>preguntas</span>
              </div>
              <div>
                <strong>5</strong>
                <span>áreas ICFES</span>
              </div>
              <div>
                <strong>Sin límite</strong>
                <span>de tiempo</span>
              </div>
            </div>
            <p className={styles.note}>
              Hazlo sin consultar apuntes: este primer resultado será tu línea
              base de estudio.
            </p>
            {error && <p className={styles.error}>{error}</p>}
            <button
              type="button"
              className={styles.primaryButton}
              onClick={comenzar}
              disabled={procesando}
            >
              {procesando ? "Preparando preguntas..." : "Comenzar diagnóstico"}
            </button>
          </section>
        </main>
      </div>
    );
  }

  if (estado.estado === "COMPLETADO") {
    const prioridad = estado.areaPrioritaria;
    return (
      <div className={styles.page}>
        <header className={styles.topbar}>
          <Link href="/dashboard" className={styles.brand}>
            Saber<span>Plus</span>
          </Link>
          <span className={styles.topbarLabel}>Diagnóstico completado</span>
        </header>
        <main className={styles.resultsMain}>
          <section className={styles.resultHeader}>
            <div>
              <span className={styles.stepLabel}>Tu línea base</span>
              <h1>Ya sabemos por dónde empezar</h1>
              <p>
                Este resultado organiza tus prioridades; no es una predicción
                de tu puntaje final.
              </p>
            </div>
            <div className={styles.score} aria-label={`${estado.porcentaje}%`}>
              <strong>{estado.porcentaje}%</strong>
              <span>{NIVEL_NOMBRES[estado.nivel]}</span>
            </div>
          </section>

          <section className={styles.areaResults}>
            <div className={styles.sectionHeading}>
              <div>
                <h2>Resultado por área</h2>
                <p>
                  {estado.respuestasCorrectas} de {estado.totalPreguntas}{" "}
                  respuestas correctas
                </p>
              </div>
              {prioridad && (
                <div className={styles.priorityCallout}>
                  Prioridad: <strong>{AREA_NOMBRES[prioridad]}</strong>
                </div>
              )}
            </div>
            <div className={styles.areaList}>
              {estado.resultadosPorArea.map((resultado) => (
                <div className={styles.areaRow} key={resultado.area}>
                  <div className={styles.areaMeta}>
                    <strong>{AREA_NOMBRES[resultado.area]}</strong>
                    <span
                      className={`${styles.level} ${styles[resultado.nivel.toLowerCase()]}`}
                    >
                      {NIVEL_NOMBRES[resultado.nivel]}
                    </span>
                  </div>
                  <div className={styles.areaProgressLine}>
                    <div
                      style={{ width: `${resultado.porcentaje}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <span className={styles.areaScore}>
                    {resultado.respuestasCorrectas}/{resultado.totalPreguntas} ·{" "}
                    {resultado.porcentaje}%
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div className={styles.resultActions}>
            {prioridad && (
              <Link
                href={`/estudiar/${prioridad}`}
                className={styles.primaryLink}
              >
                Estudiar área prioritaria
              </Link>
            )}
            <Link href="/dashboard" className={styles.secondaryLink}>
              Ir al dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const pregunta = estado.preguntas[actual];
  const respondidas = Object.keys(respuestas).filter((id) =>
    estado.preguntas.some((item) => item.id === id),
  ).length;
  const progreso = Math.round((respondidas / estado.totalPreguntas) * 100);
  const esUltima = actual === estado.totalPreguntas - 1;

  return (
    <div className={styles.page}>
      <header className={styles.examHeader}>
        <div className={styles.examHeaderInner}>
          <Link href="/dashboard" className={styles.brand}>
            Saber<span>Plus</span>
          </Link>
          <div className={styles.examStatus}>
            <span>Diagnóstico inicial</span>
            <strong>
              {respondidas}/{estado.totalPreguntas} respondidas
            </strong>
          </div>
        </div>
        <div className={styles.globalProgress}>
          <div style={{ width: `${progreso}%` }} />
        </div>
      </header>

      <main className={styles.examMain}>
        <div className={styles.questionMeta}>
          <span>
            Pregunta {actual + 1} de {estado.totalPreguntas}
          </span>
          <strong>{AREA_NOMBRES[pregunta.subtema.tema.area]}</strong>
        </div>

        <section className={styles.questionPanel}>
          <ContextoCasoPregunta
            caso={pregunta.caso}
            ordenEnCaso={pregunta.ordenEnCaso}
          />
          <p className={styles.questionText}>{pregunta.enunciado}</p>
          {pregunta.imagenUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.questionImage}
              src={resolverImagen(pregunta.imagenUrl)}
              alt="Apoyo visual de la pregunta"
              onError={(event) => (event.currentTarget.style.display = "none")}
            />
          )}
          <div className={styles.options}>
            {pregunta.respuestas.map((respuesta, indice) => {
              const seleccionada = respuestas[pregunta.id] === respuesta.id;
              return (
                <button
                  type="button"
                  key={respuesta.id}
                  className={`${styles.option} ${seleccionada ? styles.selectedOption : ""}`}
                  onClick={(event) =>
                    seleccionar(pregunta.id, respuesta.id, event.timeStamp)
                  }
                  aria-pressed={seleccionada}
                >
                  <span>{String.fromCharCode(65 + indice)}</span>
                  <strong>{respuesta.texto}</strong>
                </button>
              );
            })}
          </div>
        </section>

        {error && <p className={styles.error}>{error}</p>}

        <nav className={styles.questionNav} aria-label="Navegación de preguntas">
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setActual((indice) => Math.max(0, indice - 1))}
            disabled={actual === 0}
            aria-label="Pregunta anterior"
            title="Pregunta anterior"
          >
            ‹
          </button>
          <div className={styles.questionIndex}>
            {estado.preguntas.map((item, indice) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setActual(indice)}
                className={`${indice === actual ? styles.currentIndex : ""} ${respuestas[item.id] ? styles.answeredIndex : ""}`}
                aria-label={`Ir a la pregunta ${indice + 1}`}
              >
                {indice + 1}
              </button>
            ))}
          </div>
          {esUltima ? (
            <button
              type="button"
              className={styles.finishButton}
              onClick={finalizar}
              disabled={procesando}
            >
              {procesando ? "Calificando..." : "Finalizar"}
            </button>
          ) : (
            <button
              type="button"
              className={styles.iconButton}
              onClick={() =>
                setActual((indice) =>
                  Math.min(estado.totalPreguntas - 1, indice + 1),
                )
              }
              aria-label="Siguiente pregunta"
              title="Siguiente pregunta"
            >
              ›
            </button>
          )}
        </nav>
      </main>
    </div>
  );
}
