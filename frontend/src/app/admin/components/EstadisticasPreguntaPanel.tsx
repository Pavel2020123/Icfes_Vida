import type { EstadisticasPreguntaAdmin } from "../../../lib/api";
import styles from "./EstadisticasPreguntaPanel.module.css";

const DIFICULTAD_LABEL: Record<
  EstadisticasPreguntaAdmin["dificultadObservada"],
  string
> = {
  SIN_DATOS: "Sin datos",
  FACIL: "Fácil",
  MEDIA: "Media",
  DIFICIL: "Difícil",
};

function fechaLegible(fecha: string | null) {
  if (!fecha) return "Todavía no hay respuestas";
  return new Date(fecha).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EstadisticasPreguntaPanel({
  estadisticas,
  cargando,
  error,
  onActualizar,
}: {
  estadisticas?: EstadisticasPreguntaAdmin;
  cargando: boolean;
  error?: string;
  onActualizar: () => void;
}) {
  if (cargando && !estadisticas) {
    return <p className={styles.message}>Calculando estadísticas reales...</p>;
  }

  if (error && !estadisticas) {
    return (
      <p className={`${styles.message} ${styles.error}`}>
        {error}
        <button className={styles.refresh} type="button" onClick={onActualizar}>
          Reintentar
        </button>
      </p>
    );
  }

  if (!estadisticas) return null;

  return (
    <section className={styles.panel} aria-label="Estadísticas de la pregunta">
      <div className={styles.header}>
        <h4 className={styles.title}>Rendimiento real</h4>
        <button
          className={styles.refresh}
          type="button"
          onClick={onActualizar}
          disabled={cargando}
        >
          {cargando ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}

      {estadisticas.totalIntentos === 0 ? (
        <p className={styles.message}>
          Esta pregunta todavía no ha sido respondida por estudiantes.
        </p>
      ) : (
        <>
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <strong className={styles.metricValue}>
                {estadisticas.totalIntentos}
              </strong>
              <span className={styles.metricLabel}>Intentos</span>
            </div>
            <div className={styles.metric}>
              <strong className={styles.metricValue}>
                {estadisticas.estudiantesUnicos}
              </strong>
              <span className={styles.metricLabel}>Estudiantes únicos</span>
            </div>
            <div className={styles.metric}>
              <strong className={styles.metricValue}>
                {estadisticas.porcentajeAciertos}%
              </strong>
              <span className={styles.metricLabel}>Aciertos</span>
            </div>
            <div className={styles.metric}>
              <strong className={styles.metricValue}>
                {estadisticas.tiempoPromedioSegundos === null
                  ? "—"
                  : `${estadisticas.tiempoPromedioSegundos} s`}
              </strong>
              <span className={styles.metricLabel}>Tiempo promedio</span>
            </div>
          </div>

          <div className={styles.difficulty}>
            <span>
              {estadisticas.correctas} correctas · {estadisticas.incorrectas}{" "}
              incorrectas
            </span>
            <strong>
              Configurada: {estadisticas.pregunta.dificultadConfigurada} ·{" "}
              Observada: {DIFICULTAD_LABEL[estadisticas.dificultadObservada]}
            </strong>
          </div>

          <h5 className={styles.sectionTitle}>Selección de opciones</h5>
          <div className={styles.options}>
            {estadisticas.opciones.map((opcion, indice) => (
              <div className={styles.option} key={opcion.id}>
                <span
                  className={`${styles.optionLetter} ${opcion.esCorrecta ? styles.optionCorrect : ""}`}
                  title={opcion.esCorrecta ? "Respuesta correcta" : undefined}
                >
                  {String.fromCharCode(65 + indice)}
                </span>
                <div className={styles.optionBody}>
                  <span className={styles.optionText}>{opcion.texto}</span>
                  <div className={styles.track}>
                    <div
                      className={`${styles.bar} ${opcion.esCorrecta ? styles.barCorrect : ""}`}
                      style={{ width: `${opcion.porcentaje}%` }}
                    />
                  </div>
                </div>
                <span className={styles.optionValue}>
                  {opcion.porcentaje}% · {opcion.selecciones}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.origins}>
            <div className={styles.origin}>
              <strong>{estadisticas.porOrigen.SIMULACRO}</strong>
              Simulacro
            </div>
            <div className={styles.origin}>
              <strong>{estadisticas.porOrigen.PERSONALIZADO}</strong>
              Aleatorias
            </div>
            <div className={styles.origin}>
              <strong>{estadisticas.porOrigen.PRACTICA}</strong>
              Práctica
            </div>
            <div className={styles.origin}>
              <strong>{estadisticas.porOrigen.DIAGNOSTICO}</strong>
              Diagnóstico
            </div>
          </div>
          <p className={styles.footer}>
            Última respuesta: {fechaLegible(estadisticas.ultimaRespuesta)}
          </p>
        </>
      )}
    </section>
  );
}
