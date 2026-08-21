"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { obtenerToken } from "../../lib/api";
import {
  CHECKLIST_EXAMEN,
  DISTRACTORES_EXAMEN,
  FASES_ESTRATEGIA,
  TACTICAS_POR_AREA,
} from "../../lib/estrategia-examen";
import styles from "./page.module.css";

function limitar(valor: number, minimo: number, maximo: number) {
  return Math.min(
    Math.max(Number.isFinite(valor) ? valor : minimo, minimo),
    maximo,
  );
}

export default function EstrategiaExamenPage() {
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);
  const [preguntas, setPreguntas] = useState(100);
  const [minutos, setMinutos] = useState(240);
  const [reserva, setReserva] = useState(20);
  const [areaActiva, setAreaActiva] = useState("LECTURA_CRITICA");
  const [checklist, setChecklist] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    if (!obtenerToken()) {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVerificando(false);
  }, [router]);

  const plan = useMemo(() => {
    const tiempoReserva = Math.min(reserva, Math.max(minutos - 1, 0));
    const trabajo = Math.max(minutos - tiempoReserva, 1);
    const segundosPorPregunta = Math.round((trabajo * 60) / preguntas);
    const cortes = [25, 50, 75].map((porcentaje) => ({
      porcentaje,
      pregunta: Math.ceil((preguntas * porcentaje) / 100),
      minuto: Math.round((trabajo * porcentaje) / 100),
    }));
    return { tiempoReserva, trabajo, segundosPorPregunta, cortes };
  }, [minutos, preguntas, reserva]);

  const tactica =
    TACTICAS_POR_AREA.find((item) => item.key === areaActiva) ??
    TACTICAS_POR_AREA[0];

  const alternarChecklist = (indice: number) => {
    setChecklist((actual) => {
      const siguiente = new Set(actual);
      if (siguiente.has(indice)) siguiente.delete(indice);
      else siguiente.add(indice);
      return siguiente;
    });
  };

  if (verificando) {
    return <div className={styles.loading}>Cargando estrategia...</div>;
  }

  return (
    <div className={styles.page}>
      <header className={`${styles.header} ${styles.noPrint}`}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/dashboard">
            Saber<span className={styles.brandAccent}>Plus</span>
          </Link>
          <Link className={styles.backLink} href="/dashboard">
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.titleRow}>
          <div>
            <p className={styles.eyebrow}>Plan de ejecución Saber 11</p>
            <h1 className={styles.title}>Guía de estrategia de examen</h1>
            <p className={styles.description}>
              Organización del tiempo, método de respuesta y controles para
              tomar decisiones con evidencia durante cada sesión.
            </p>
          </div>
          <button
            className={`${styles.printButton} ${styles.noPrint}`}
            type="button"
            onClick={() => window.print()}
            title="Imprimir guía"
          >
            Imprimir
          </button>
        </div>

        <section className={styles.planner}>
          <div className={styles.plannerHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Planificador</p>
              <h2 className={styles.sectionTitle}>Distribución del tiempo</h2>
            </div>
            <p className={styles.plannerHint}>
              Tiempo útil: {plan.trabajo} min · Revisión: {plan.tiempoReserva}{" "}
              min
            </p>
          </div>

          <div className={`${styles.plannerInputs} ${styles.noPrint}`}>
            <label className={styles.field}>
              Preguntas
              <input
                className={styles.input}
                type="number"
                min={1}
                max={500}
                value={preguntas}
                onChange={(event) =>
                  setPreguntas(limitar(Number(event.target.value), 1, 500))
                }
              />
            </label>
            <label className={styles.field}>
              Minutos disponibles
              <input
                className={styles.input}
                type="number"
                min={10}
                max={600}
                value={minutos}
                onChange={(event) => {
                  const nuevosMinutos = limitar(
                    Number(event.target.value),
                    10,
                    600,
                  );
                  setMinutos(nuevosMinutos);
                  setReserva((actual) =>
                    Math.min(actual, Math.max(nuevosMinutos - 1, 0)),
                  );
                }}
              />
            </label>
            <label className={styles.field}>
              Minutos para revisión
              <input
                className={styles.input}
                type="number"
                min={0}
                max={Math.min(120, minutos - 1)}
                value={reserva}
                onChange={(event) =>
                  setReserva(
                    limitar(
                      Number(event.target.value),
                      0,
                      Math.min(120, minutos - 1),
                    ),
                  )
                }
              />
            </label>
          </div>

          <div className={styles.metrics} aria-live="polite">
            <div className={styles.metric}>
              <strong className={styles.metricValue}>
                {plan.segundosPorPregunta} s
              </strong>
              <span className={styles.metricLabel}>Promedio por pregunta</span>
            </div>
            {plan.cortes.map((corte) => (
              <div className={styles.metric} key={corte.porcentaje}>
                <strong className={styles.metricValue}>
                  P{corte.pregunta} · min {corte.minuto}
                </strong>
                <span className={styles.metricLabel}>
                  Control al {corte.porcentaje} % del bloque
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Ruta de trabajo</p>
              <h2 className={styles.sectionTitle}>Las cuatro fases</h2>
            </div>
            <p className={styles.sectionHint}>
              Primera vuelta para asegurar; segunda vuelta para decidir.
            </p>
          </div>
          <div className={styles.phaseGrid}>
            {FASES_ESTRATEGIA.map((fase) => (
              <article className={styles.phaseCard} key={fase.numero}>
                <div className={styles.phaseNumber}>{fase.numero}</div>
                <div>
                  <p className={styles.phaseMoment}>{fase.momento}</p>
                  <h3 className={styles.phaseTitle}>{fase.titulo}</h3>
                  <p className={styles.phaseObjective}>{fase.objetivo}</p>
                  <ul className={styles.actionList}>
                    {fase.acciones.map((accion) => (
                      <li key={accion}>{accion}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Decisión por área</p>
              <h2 className={styles.sectionTitle}>Tácticas específicas</h2>
            </div>
          </div>
          <div
            className={`${styles.areaTabs} ${styles.noPrint}`}
            role="tablist"
            aria-label="Táctica por área"
          >
            {TACTICAS_POR_AREA.map((area) => (
              <button
                className={`${styles.areaTab} ${areaActiva === area.key ? styles.areaTabActive : ""}`}
                key={area.key}
                type="button"
                role="tab"
                aria-selected={areaActiva === area.key}
                onClick={() => setAreaActiva(area.key)}
              >
                {area.nombre}
              </button>
            ))}
          </div>
          <div className={styles.tacticPanel}>
            <div>
              <h3 className={styles.tacticName}>{tactica.nombre}</h3>
              <p className={styles.tacticFocus}>{tactica.enfoque}</p>
              <p className={styles.controlQuestion}>
                {tactica.preguntaControl}
              </p>
            </div>
            <ul className={styles.tacticList}>
              {tactica.pasos.map((paso) => (
                <li key={paso}>{paso}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Control de opciones</p>
              <h2 className={styles.sectionTitle}>Distractores frecuentes</h2>
            </div>
          </div>
          <div className={styles.distractorList}>
            {DISTRACTORES_EXAMEN.map((distractor) => (
              <article className={styles.distractor} key={distractor.titulo}>
                <strong className={styles.distractorTitle}>
                  {distractor.titulo}
                </strong>
                <span className={styles.distractorSignal}>
                  {distractor.senal}
                </span>
                <span className={styles.distractorResponse}>
                  {distractor.respuesta}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Preparación final</p>
              <h2 className={styles.sectionTitle}>Checklist del examen</h2>
            </div>
            <p className={styles.sectionHint}>
              {checklist.size} de {CHECKLIST_EXAMEN.length} listos
            </p>
          </div>
          <div className={styles.checklist}>
            {CHECKLIST_EXAMEN.map((item, indice) => {
              const marcado = checklist.has(indice);
              return (
                <label
                  className={`${styles.checkItem} ${marcado ? styles.checked : ""}`}
                  key={item}
                >
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={marcado}
                    onChange={() => alternarChecklist(indice)}
                  />
                  {item}
                </label>
              );
            })}
          </div>
        </section>

        <nav className={`${styles.toolLinks} ${styles.noPrint}`}>
          <Link className={styles.toolLink} href="/formulas">
            Abrir formulario por área
          </Link>
          <Link className={styles.toolLink} href="/glosario">
            Abrir glosario
          </Link>
          <Link className={styles.toolLink} href="/preguntas-aleatorias">
            Practicar estrategia
          </Link>
        </nav>
      </main>
    </div>
  );
}
