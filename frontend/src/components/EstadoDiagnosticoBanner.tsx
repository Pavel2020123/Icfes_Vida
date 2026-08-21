import Link from "next/link";
import type { AreaDiagnostico, EstadoDiagnostico } from "../lib/api";
import styles from "./EstadoDiagnosticoBanner.module.css";

const AREA_NOMBRES: Record<AreaDiagnostico, string> = {
  LECTURA_CRITICA: "Lectura Crítica",
  MATEMATICAS: "Matemáticas",
  CIENCIAS_NATURALES: "Ciencias Naturales",
  SOCIALES_CIUDADANAS: "Sociales y Ciudadanas",
  INGLES: "Inglés",
};

export default function EstadoDiagnosticoBanner({
  diagnostico,
}: {
  diagnostico: EstadoDiagnostico;
}) {
  const completado = diagnostico.estado === "COMPLETADO";
  const enProgreso = diagnostico.estado === "EN_PROGRESO";
  const prioridad =
    completado && diagnostico.areaPrioritaria
      ? AREA_NOMBRES[diagnostico.areaPrioritaria]
      : "tu área con mayor oportunidad";

  return (
    <section className={styles.banner}>
      <div className={styles.marker} aria-hidden="true">
        {completado ? "✓" : "01"}
      </div>
      <div className={styles.content}>
        <span className={styles.eyebrow}>
          {completado ? "Línea base completada" : "Primer paso"}
        </span>
        <h2>
          {completado
            ? `Tu prioridad es ${prioridad}`
            : enProgreso
              ? "Continúa tu diagnóstico inicial"
              : "Descubre por dónde empezar"}
        </h2>
        <p>
          {completado
            ? `${diagnostico.porcentaje}% general. Usa el resultado para enfocar primero el área con mayor oportunidad de mejora.`
            : enProgreso
              ? `${diagnostico.totalPreguntas} preguntas guardadas en la misma sesión.`
              : "Responde preguntas de las cinco áreas y recibe una prioridad de estudio personal."}
        </p>
      </div>
      {completado && (
        <div className={styles.score}>
          <strong>{diagnostico.porcentaje}%</strong>
          <span>resultado inicial</span>
        </div>
      )}
      <Link href="/diagnostico" className={styles.action}>
        {completado ? "Ver resultado" : enProgreso ? "Continuar" : "Comenzar"}
      </Link>
    </section>
  );
}
