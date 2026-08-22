"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  actualizarAnuncioAdmin,
  crearAnuncioAdmin,
  eliminarAnuncioAdmin,
  obtenerAnunciosAdmin,
  type AnuncioAdmin,
  type AudienciaAnuncio,
  type DatosAnuncio,
  type TipoAnuncio,
} from "../../../lib/api";
import { IconoBasura, IconoLapiz, IconoMas } from "../../../components/Iconos";
import styles from "./AnunciosTab.module.css";

interface Props {
  mostrarMensaje: (mensaje: string) => void;
}

interface FormularioAnuncio {
  titulo: string;
  contenido: string;
  tipo: TipoAnuncio;
  audiencia: AudienciaAnuncio;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  destacado: boolean;
}

function fechaLocal(fecha = new Date()) {
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function formularioInicial(): FormularioAnuncio {
  return {
    titulo: "",
    contenido: "",
    tipo: "INFORMACION",
    audiencia: "TODOS",
    fechaInicio: fechaLocal(),
    fechaFin: "",
    activo: true,
    destacado: false,
  };
}

function fechaCorta(fecha: string) {
  return new Date(fecha).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function estadoAnuncio(anuncio: AnuncioAdmin) {
  const ahora = Date.now();
  if (!anuncio.activo)
    return { texto: "Inactivo", clase: styles.statusInactive };
  if (new Date(anuncio.fechaInicio).getTime() > ahora) {
    return { texto: "Programado", clase: styles.statusScheduled };
  }
  if (anuncio.fechaFin && new Date(anuncio.fechaFin).getTime() < ahora) {
    return { texto: "Finalizado", clase: styles.statusExpired };
  }
  return { texto: "Publicado", clase: styles.statusActive };
}

const etiquetasTipo: Record<TipoAnuncio, string> = {
  INFORMACION: "Información",
  IMPORTANTE: "Importante",
  EVENTO: "Evento",
};

const etiquetasAudiencia: Record<AudienciaAnuncio, string> = {
  TODOS: "Todos",
  ESTUDIANTES: "Estudiantes",
  PROFESORES: "Profesores",
};

const clasesTipo: Record<TipoAnuncio, string> = {
  INFORMACION: styles.accentInfo,
  IMPORTANTE: styles.accentImportant,
  EVENTO: styles.accentEvent,
};

export default function AnunciosTab({ mostrarMensaje }: Props) {
  const [anuncios, setAnuncios] = useState<AnuncioAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formulario, setFormulario] =
    useState<FormularioAnuncio>(formularioInicial);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      setAnuncios(await obtenerAnunciosAdmin());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los anuncios.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let vigente = true;
    obtenerAnunciosAdmin()
      .then((datos) => {
        if (vigente) setAnuncios(datos);
      })
      .catch((err: unknown) => {
        if (vigente) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los anuncios.",
          );
        }
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, []);

  const resumen = useMemo(() => {
    const activos = anuncios.filter(
      (anuncio) => estadoAnuncio(anuncio).texto === "Publicado",
    ).length;
    return {
      total: anuncios.length,
      activos,
      lecturas: anuncios.reduce(
        (total, anuncio) => total + anuncio._count.lecturas,
        0,
      ),
    };
  }, [anuncios]);

  const abrirNuevo = () => {
    setEditandoId(null);
    setFormulario(formularioInicial());
    setError("");
    setFormularioVisible(true);
  };

  const abrirEdicion = (anuncio: AnuncioAdmin) => {
    setEditandoId(anuncio.id);
    setFormulario({
      titulo: anuncio.titulo,
      contenido: anuncio.contenido,
      tipo: anuncio.tipo,
      audiencia: anuncio.audiencia,
      fechaInicio: fechaLocal(new Date(anuncio.fechaInicio)),
      fechaFin: anuncio.fechaFin ? fechaLocal(new Date(anuncio.fechaFin)) : "",
      activo: anuncio.activo,
      destacado: anuncio.destacado,
    });
    setError("");
    setFormularioVisible(true);
  };

  const datosParaGuardar = (): DatosAnuncio => ({
    ...formulario,
    titulo: formulario.titulo.trim(),
    contenido: formulario.contenido.trim(),
    fechaInicio: new Date(formulario.fechaInicio).toISOString(),
    fechaFin: formulario.fechaFin
      ? new Date(formulario.fechaFin).toISOString()
      : null,
  });

  const guardar = async (event: FormEvent) => {
    event.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const datos = datosParaGuardar();
      if (editandoId) {
        await actualizarAnuncioAdmin(editandoId, datos);
        mostrarMensaje("Anuncio actualizado.");
      } else {
        await crearAnuncioAdmin(datos);
        mostrarMensaje("Anuncio creado.");
      }
      setFormularioVisible(false);
      await cargar();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el anuncio.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const cambiarActivo = async (anuncio: AnuncioAdmin) => {
    try {
      await actualizarAnuncioAdmin(anuncio.id, { activo: !anuncio.activo });
      mostrarMensaje(
        anuncio.activo ? "Anuncio desactivado." : "Anuncio activado.",
      );
      await cargar();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cambiar el estado.",
      );
    }
  };

  const eliminar = async (anuncio: AnuncioAdmin) => {
    if (!window.confirm(`¿Eliminar el anuncio “${anuncio.titulo}”?`)) return;
    try {
      await eliminarAnuncioAdmin(anuncio.id);
      mostrarMensaje("Anuncio eliminado.");
      if (editandoId === anuncio.id) setFormularioVisible(false);
      await cargar();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el anuncio.",
      );
    }
  };

  return (
    <section className={styles.shell}>
      <div className={styles.heading}>
        <div>
          <h2>Tablón de anuncios</h2>
          <p>Publicaciones para estudiantes y profesores.</p>
        </div>
        <button
          className={styles.primaryButton}
          type="button"
          onClick={abrirNuevo}
        >
          <IconoMas size={16} /> Nuevo anuncio
        </button>
      </div>

      <div className={styles.summary} aria-label="Resumen de anuncios">
        <div className={styles.metric}>
          <span>Total</span>
          <strong>{resumen.total}</strong>
        </div>
        <div className={styles.metric}>
          <span>Publicados</span>
          <strong>{resumen.activos}</strong>
        </div>
        <div className={styles.metric}>
          <span>Lecturas</span>
          <strong>{resumen.lecturas}</strong>
        </div>
      </div>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <div
        className={`${styles.workspace} ${formularioVisible ? styles.workspaceWithForm : ""}`}
      >
        <div className={styles.list} aria-live="polite">
          {cargando ? (
            <div className={styles.empty}>Cargando anuncios...</div>
          ) : anuncios.length === 0 ? (
            <div className={styles.empty}>Aún no hay anuncios publicados.</div>
          ) : (
            anuncios.map((anuncio) => {
              const estado = estadoAnuncio(anuncio);
              return (
                <article
                  key={anuncio.id}
                  className={styles.announcement}
                  data-inactive={!anuncio.activo}
                >
                  <div className={clasesTipo[anuncio.tipo]} />
                  <div className={styles.announcementBody}>
                    <div className={styles.titleRow}>
                      <h3>{anuncio.titulo}</h3>
                      {anuncio.destacado && (
                        <span className={styles.badge}>Destacado</span>
                      )}
                      <span className={`${styles.status} ${estado.clase}`}>
                        {estado.texto}
                      </span>
                    </div>
                    <p>{anuncio.contenido}</p>
                    <div className={styles.meta}>
                      <span>{etiquetasTipo[anuncio.tipo]}</span>
                      <span>·</span>
                      <span>{etiquetasAudiencia[anuncio.audiencia]}</span>
                      <span>·</span>
                      <span>Desde {fechaCorta(anuncio.fechaInicio)}</span>
                      {anuncio.fechaFin && (
                        <span>hasta {fechaCorta(anuncio.fechaFin)}</span>
                      )}
                      <span>·</span>
                      <span>{anuncio._count.lecturas} lecturas</span>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() => void cambiarActivo(anuncio)}
                    >
                      {anuncio.activo ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      className={styles.iconButton}
                      type="button"
                      title="Editar anuncio"
                      aria-label={`Editar ${anuncio.titulo}`}
                      onClick={() => abrirEdicion(anuncio)}
                    >
                      <IconoLapiz />
                    </button>
                    <button
                      className={styles.iconButton}
                      type="button"
                      title="Eliminar anuncio"
                      aria-label={`Eliminar ${anuncio.titulo}`}
                      onClick={() => void eliminar(anuncio)}
                    >
                      <IconoBasura />
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {formularioVisible && (
          <aside
            className={styles.formPanel}
            aria-label={editandoId ? "Editar anuncio" : "Nuevo anuncio"}
          >
            <div className={styles.formHeader}>
              <h3>{editandoId ? "Editar anuncio" : "Nuevo anuncio"}</h3>
              <button
                className={styles.iconButton}
                type="button"
                aria-label="Cerrar formulario"
                title="Cerrar"
                onClick={() => setFormularioVisible(false)}
              >
                ×
              </button>
            </div>
            <form
              className={styles.form}
              onSubmit={(event) => void guardar(event)}
            >
              <div className={styles.field}>
                <label htmlFor="anuncio-titulo">Título</label>
                <input
                  id="anuncio-titulo"
                  maxLength={120}
                  required
                  value={formulario.titulo}
                  onChange={(event) =>
                    setFormulario({ ...formulario, titulo: event.target.value })
                  }
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="anuncio-contenido">Contenido</label>
                <textarea
                  id="anuncio-contenido"
                  maxLength={3000}
                  required
                  value={formulario.contenido}
                  onChange={(event) =>
                    setFormulario({
                      ...formulario,
                      contenido: event.target.value,
                    })
                  }
                />
              </div>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label htmlFor="anuncio-tipo">Tipo</label>
                  <select
                    id="anuncio-tipo"
                    value={formulario.tipo}
                    onChange={(event) =>
                      setFormulario({
                        ...formulario,
                        tipo: event.target.value as TipoAnuncio,
                      })
                    }
                  >
                    <option value="INFORMACION">Información</option>
                    <option value="IMPORTANTE">Importante</option>
                    <option value="EVENTO">Evento</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor="anuncio-audiencia">Audiencia</label>
                  <select
                    id="anuncio-audiencia"
                    value={formulario.audiencia}
                    onChange={(event) =>
                      setFormulario({
                        ...formulario,
                        audiencia: event.target.value as AudienciaAnuncio,
                      })
                    }
                  >
                    <option value="TODOS">Todos</option>
                    <option value="ESTUDIANTES">Estudiantes</option>
                    <option value="PROFESORES">Profesores</option>
                  </select>
                </div>
              </div>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label htmlFor="anuncio-inicio">Publicar desde</label>
                  <input
                    id="anuncio-inicio"
                    type="datetime-local"
                    required
                    value={formulario.fechaInicio}
                    onChange={(event) =>
                      setFormulario({
                        ...formulario,
                        fechaInicio: event.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="anuncio-fin">Finalizar</label>
                  <input
                    id="anuncio-fin"
                    type="datetime-local"
                    value={formulario.fechaFin}
                    onChange={(event) =>
                      setFormulario({
                        ...formulario,
                        fechaFin: event.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className={styles.checkRow}>
                <label>
                  <input
                    type="checkbox"
                    checked={formulario.activo}
                    onChange={(event) =>
                      setFormulario({
                        ...formulario,
                        activo: event.target.checked,
                      })
                    }
                  />{" "}
                  Activo
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formulario.destacado}
                    onChange={(event) =>
                      setFormulario({
                        ...formulario,
                        destacado: event.target.checked,
                      })
                    }
                  />{" "}
                  Destacado
                </label>
              </div>
              <div className={styles.formActions}>
                <button
                  className={styles.primaryButton}
                  type="submit"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar anuncio"}
                </button>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => setFormularioVisible(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </aside>
        )}
      </div>
    </section>
  );
}
