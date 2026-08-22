"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  completarTutorial,
  obtenerEstadoTutorial,
  obtenerToken,
} from "../lib/api";
import { decodificarToken, type RolUsuario } from "../lib/auth";
import styles from "./TutorialPrimerIngreso.module.css";

interface PasoTutorial {
  selector?: string;
  etiqueta: string;
  titulo: string;
  descripcion: string;
  consejo?: string;
}

interface Rectangulo {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface PosicionPanel {
  top: number;
  left: number;
  width: number;
  ubicacion: "arriba" | "abajo" | "izquierda" | "derecha" | "movil";
}

const PASOS_ESTUDIANTE: PasoTutorial[] = [
  {
    etiqueta: "BIENVENIDA",
    titulo: "Tu preparación empieza con una ruta clara",
    descripcion:
      "SaberPlus organiza tu estudio con datos reales: tu diagnóstico, la fecha del examen y el avance que logras cada semana.",
    consejo: "Este recorrido toma menos de un minuto.",
  },
  {
    selector: '[data-tutorial="convocatoria"]',
    etiqueta: "FECHA DEL EXAMEN",
    titulo: "Siempre sabrás cuánto tiempo queda",
    descripcion:
      "La cuenta regresiva usa la convocatoria activa del calendario A o B y te ayuda a mantener el ritmo correcto.",
  },
  {
    selector: '[data-tutorial="diagnostico"]',
    etiqueta: "PUNTO DE PARTIDA",
    titulo: "El diagnóstico conoce tus prioridades",
    descripcion:
      "Aquí verás tu nivel inicial y el área que necesita más atención. Esa información alimenta tus recomendaciones.",
  },
  {
    selector: '[data-tutorial="plan-semanal"]',
    etiqueta: "RUTA PERSONAL",
    titulo: "Una semana pensada para ti",
    descripcion:
      "Tu plan combina los temas prioritarios con el tiempo que falta para el ICFES. Se renueva cada lunes y marca lo que completas.",
    consejo: "Empieza por la actividad indicada para hoy.",
  },
  {
    selector: '[data-tutorial="progreso"]',
    etiqueta: "AVANCE REAL",
    titulo: "Tu constancia queda visible",
    descripcion:
      "Cada subtema terminado actualiza este indicador. Úsalo para medir el recorrido completo, no solo una sesión aislada.",
  },
  {
    selector: '[data-tutorial="practica"]',
    etiqueta: "PRÁCTICA FLEXIBLE",
    titulo: "Entrena sin esperar un simulacro completo",
    descripcion:
      "Mezcla preguntas de una o varias áreas cuando quieras practicar rápido o comprobar si ya dominas un tema.",
  },
  {
    selector: '[data-tutorial="areas-estudio"]',
    etiqueta: "CONTENIDO",
    titulo: "Explora cada área paso a paso",
    descripcion:
      "Entra a los módulos para estudiar teoría, recursos y preguntas. El porcentaje de cada área te muestra dónde continuar.",
  },
  {
    selector: '[data-tutorial="menu-principal"]',
    etiqueta: "NAVEGACIÓN",
    titulo: "Todo está a un clic",
    descripcion:
      "Desde el menú encuentras el plan semanal, diagnóstico, fórmulas, glosario, estrategia de examen, historial y este recorrido.",
  },
  {
    etiqueta: "TODO LISTO",
    titulo: "Ya tienes el mapa. Ahora construye el hábito.",
    descripcion:
      "Vuelve cada día, completa la actividad recomendada y usa los resultados para ajustar tu preparación.",
    consejo:
      "Puedes repetir este recorrido desde Ayuda y recorrido en el menú.",
  },
];

const PASOS_PROFESOR: PasoTutorial[] = [
  {
    etiqueta: "BIENVENIDA",
    titulo: "Tu centro de seguimiento académico",
    descripcion:
      "SaberPlus reúne la gestión de estudiantes y la información que necesitas para acompañarlos antes del ICFES.",
    consejo: "Este recorrido toma menos de un minuto.",
  },
  {
    selector: '[data-tutorial="panel-profesor"]',
    etiqueta: "PANEL DEL PROFESOR",
    titulo: "Empieza desde una vista sencilla",
    descripcion:
      "Este es tu punto de entrada. Desde aquí puedes ir al espacio institucional y volver al panel cuando lo necesites.",
  },
  {
    selector: '[data-tutorial="gestion-profesor"]',
    etiqueta: "GESTIÓN ACADÉMICA",
    titulo: "Tus tareas principales, siempre visibles",
    descripcion:
      "Administra estudiantes y grupos, revisa alertas de riesgo y entra a la identidad de tu institución sin buscar entre pantallas.",
    consejo:
      "Las alertas te ayudan a intervenir antes de que un estudiante se desconecte.",
  },
  {
    selector: '[data-tutorial="menu-principal"]',
    etiqueta: "NAVEGACIÓN",
    titulo: "El menú reúne toda la institución",
    descripcion:
      "Aquí encontrarás el panel institucional, estudiantes, grupos, alertas de riesgo, tu perfil y la opción para repetir esta guía.",
  },
  {
    etiqueta: "TODO LISTO",
    titulo: "Acompaña con información, no con suposiciones",
    descripcion:
      "Empieza revisando tu institución y luego entra a las alertas para identificar quién necesita apoyo primero.",
    consejo:
      "Puedes repetir este recorrido desde Ayuda y recorrido en el menú.",
  },
];

export default function TutorialPrimerIngreso() {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [rol, setRol] = useState<RolUsuario | null>(null);
  const [indice, setIndice] = useState(0);
  const [rectangulo, setRectangulo] = useState<Rectangulo | null>(null);
  const [posicion, setPosicion] = useState<PosicionPanel | null>(null);

  const pasos = useMemo(
    () => (rol === "PROFESOR" ? PASOS_PROFESOR : PASOS_ESTUDIANTE),
    [rol],
  );
  const paso = pasos[indice];
  const esFinal = indice === pasos.length - 1;
  const esPresentacion = !paso?.selector;

  const iniciar = useCallback((rolActual: RolUsuario) => {
    if (rolActual !== "ESTUDIANTE" && rolActual !== "PROFESOR") return;
    setRol(rolActual);
    setIndice(0);
    setRectangulo(null);
    setPosicion(null);
    setAbierto(true);
  }, []);

  useEffect(() => {
    if (pathname !== "/dashboard" || !obtenerToken()) return;
    let vigente = true;
    const temporizador = window.setTimeout(() => {
      obtenerEstadoTutorial()
        .then((estado) => {
          if (vigente && estado.pendiente) iniciar(estado.rol);
        })
        .catch(() => undefined);
    }, 650);

    return () => {
      vigente = false;
      window.clearTimeout(temporizador);
    };
  }, [iniciar, pathname]);

  useEffect(() => {
    const repetir = () => {
      if (pathname !== "/dashboard") return;
      const usuario = decodificarToken(obtenerToken());
      if (usuario) iniciar(usuario.rol);
    };
    window.addEventListener("saberplus:iniciar-tutorial", repetir);
    return () =>
      window.removeEventListener("saberplus:iniciar-tutorial", repetir);
  }, [iniciar, pathname]);

  const calcularPosicion = useCallback(() => {
    if (!abierto || !paso?.selector) {
      setRectangulo(null);
      setPosicion(null);
      return;
    }
    const elemento = document.querySelector<HTMLElement>(paso.selector);
    if (!elemento) return;
    const rect = elemento.getBoundingClientRect();
    const margenFoco = 7;
    const foco = {
      top: Math.max(8, rect.top - margenFoco),
      left: Math.max(8, rect.left - margenFoco),
      width: Math.min(window.innerWidth - 16, rect.width + margenFoco * 2),
      height: Math.min(window.innerHeight - 16, rect.height + margenFoco * 2),
    };
    setRectangulo(foco);

    const ancho = Math.min(390, window.innerWidth - 32);
    const alto = panelRef.current?.offsetHeight ?? 300;
    const espacio = 18;
    const limitar = (valor: number, minimo: number, maximo: number) =>
      Math.min(Math.max(valor, minimo), Math.max(minimo, maximo));

    if (window.innerWidth <= 700) {
      setPosicion({
        top: Math.max(16, window.innerHeight - alto - 16),
        left: 16,
        width: ancho,
        ubicacion: "movil",
      });
    } else if (rect.bottom + espacio + alto < window.innerHeight - 12) {
      setPosicion({
        top: rect.bottom + espacio,
        left: limitar(
          rect.left + rect.width / 2 - ancho / 2,
          16,
          window.innerWidth - ancho - 16,
        ),
        width: ancho,
        ubicacion: "abajo",
      });
    } else if (rect.top - espacio - alto > 12) {
      setPosicion({
        top: rect.top - espacio - alto,
        left: limitar(
          rect.left + rect.width / 2 - ancho / 2,
          16,
          window.innerWidth - ancho - 16,
        ),
        width: ancho,
        ubicacion: "arriba",
      });
    } else if (rect.right + espacio + ancho < window.innerWidth - 12) {
      setPosicion({
        top: limitar(
          rect.top + rect.height / 2 - alto / 2,
          16,
          window.innerHeight - alto - 16,
        ),
        left: rect.right + espacio,
        width: ancho,
        ubicacion: "derecha",
      });
    } else {
      setPosicion({
        top: limitar(
          rect.top + rect.height / 2 - alto / 2,
          16,
          window.innerHeight - alto - 16,
        ),
        left: Math.max(16, rect.left - ancho - espacio),
        width: ancho,
        ubicacion: "izquierda",
      });
    }
  }, [abierto, paso]);

  useEffect(() => {
    if (!abierto || !paso?.selector) return;
    const elemento = document.querySelector<HTMLElement>(paso.selector);
    if (!elemento) return;
    const rect = elemento.getBoundingClientRect();
    if (rect.top < 80 || rect.bottom > window.innerHeight - 80) {
      elemento.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    const temporizador = window.setTimeout(calcularPosicion, 380);
    window.addEventListener("resize", calcularPosicion);
    window.addEventListener("scroll", calcularPosicion, true);
    return () => {
      window.clearTimeout(temporizador);
      window.removeEventListener("resize", calcularPosicion);
      window.removeEventListener("scroll", calcularPosicion, true);
    };
  }, [abierto, calcularPosicion, paso?.selector]);

  useEffect(() => {
    if (!abierto) return;
    const temporizador = window.setTimeout(() => {
      calcularPosicion();
      panelRef.current?.focus();
    }, 20);
    return () => window.clearTimeout(temporizador);
  }, [abierto, calcularPosicion, indice]);

  const buscarPaso = useCallback(
    (desde: number, direccion: 1 | -1) => {
      let siguiente = desde;
      while (siguiente >= 0 && siguiente < pasos.length) {
        const candidato = pasos[siguiente];
        if (!candidato.selector || document.querySelector(candidato.selector)) {
          return siguiente;
        }
        siguiente += direccion;
      }
      return direccion === 1 ? pasos.length - 1 : 0;
    },
    [pasos],
  );

  const avanzar = useCallback(() => {
    if (esFinal) {
      setAbierto(false);
      void completarTutorial().catch(() => undefined);
      return;
    }
    setIndice((actual) => buscarPaso(actual + 1, 1));
  }, [buscarPaso, esFinal]);

  const retroceder = useCallback(() => {
    setIndice((actual) => buscarPaso(actual - 1, -1));
  }, [buscarPaso]);

  const omitir = useCallback(() => {
    setAbierto(false);
    void completarTutorial().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const manejarTeclado = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") omitir();
      if (evento.key === "ArrowRight" || evento.key === "Enter") avanzar();
      if (evento.key === "ArrowLeft" && indice > 0) retroceder();
    };
    window.addEventListener("keydown", manejarTeclado);
    return () => window.removeEventListener("keydown", manejarTeclado);
  }, [abierto, avanzar, indice, omitir, retroceder]);

  if (!abierto || !paso) return null;

  return createPortal(
    <div className={styles.tourLayer} aria-live="polite">
      {rectangulo ? (
        <div
          className={styles.spotlight}
          style={rectangulo}
          aria-hidden="true"
        />
      ) : (
        <div className={styles.backdrop} aria-hidden="true" />
      )}

      <div
        ref={panelRef}
        className={`${styles.panel} ${esPresentacion ? styles.presentation : ""}`}
        style={
          posicion
            ? { top: posicion.top, left: posicion.left, width: posicion.width }
            : undefined
        }
        data-placement={posicion?.ubicacion ?? "centro"}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-titulo"
        tabIndex={-1}
      >
        <button
          className={styles.closeButton}
          onClick={omitir}
          aria-label="Cerrar tutorial"
          title="Cerrar tutorial"
        >
          ×
        </button>

        {esPresentacion && (
          <div className={styles.routeVisual} aria-hidden="true">
            <span className={styles.routeLine} />
            <span>1</span>
            <span>2</span>
            <span>3</span>
          </div>
        )}

        <span className={styles.eyebrow}>{paso.etiqueta}</span>
        <h2 id="tutorial-titulo">{paso.titulo}</h2>
        <p className={styles.description}>{paso.descripcion}</p>
        {paso.consejo && <p className={styles.tip}>{paso.consejo}</p>}

        <div
          className={styles.progress}
          aria-label={`Paso ${indice + 1} de ${pasos.length}`}
        >
          {pasos.map((_, pasoIndice) => (
            <span
              key={pasoIndice}
              className={pasoIndice <= indice ? styles.progressActive : ""}
            />
          ))}
        </div>

        <div className={styles.footer}>
          <button className={styles.skipButton} onClick={omitir}>
            Omitir tutorial
          </button>
          <div className={styles.navigation}>
            {indice > 0 && (
              <button className={styles.previousButton} onClick={retroceder}>
                Anterior
              </button>
            )}
            <button className={styles.nextButton} onClick={avanzar}>
              {esFinal ? "Empezar" : "Siguiente"}
              {!esFinal && <span aria-hidden="true">→</span>}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
