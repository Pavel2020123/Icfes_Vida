"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { obtenerToken } from "../../lib/api";
import {
  AREAS_FORMULARIO,
  FORMULARIOS_ICFES,
  esAreaFormulario,
} from "../../lib/formularios-icfes";
import styles from "./page.module.css";

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function FormularioContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busqueda, setBusqueda] = useState("");
  const [verificando, setVerificando] = useState(true);
  const parametroArea = searchParams.get("area");
  const areaKey = esAreaFormulario(parametroArea)
    ? parametroArea
    : "MATEMATICAS";
  const area = FORMULARIOS_ICFES.find((item) => item.key === areaKey)!;

  useEffect(() => {
    if (!obtenerToken()) {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVerificando(false);
  }, [router]);

  const seccionesFiltradas = useMemo(() => {
    const termino = normalizar(busqueda.trim());
    if (!termino) return area.secciones;

    return area.secciones
      .map((seccion) => ({
        ...seccion,
        items: seccion.items.filter((item) =>
          normalizar(
            [
              item.nombre,
              item.formula,
              item.uso,
              item.variables ?? "",
              item.alerta ?? "",
              seccion.titulo,
            ].join(" "),
          ).includes(termino),
        ),
      }))
      .filter((seccion) => seccion.items.length > 0);
  }, [area, busqueda]);

  const totalResultados = seccionesFiltradas.reduce(
    (total, seccion) => total + seccion.items.length,
    0,
  );

  const cambiarArea = (key: string) => {
    setBusqueda("");
    router.replace(`/formulas?area=${key}`, { scroll: false });
  };

  if (verificando) {
    return <div className={styles.loading}>Cargando formulario...</div>;
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
            <p className={styles.eyebrow}>Consulta rápida · {area.etiqueta}</p>
            <h1 className={styles.title}>Formulario de {area.nombre}</h1>
            <p className={styles.description}>{area.descripcion}</p>
          </div>
          <button
            className={`${styles.printButton} ${styles.noPrint}`}
            type="button"
            onClick={() => window.print()}
            title="Imprimir formulario"
          >
            Imprimir
          </button>
        </div>

        <div
          className={`${styles.areaTabs} ${styles.noPrint}`}
          role="tablist"
          aria-label="Área del formulario"
        >
          {AREAS_FORMULARIO.map((opcion) => {
            const activa = opcion.key === area.key;
            return (
              <button
                key={opcion.key}
                type="button"
                role="tab"
                aria-selected={activa}
                className={`${styles.areaTab} ${activa ? styles.areaTabActive : ""}`}
                onClick={() => cambiarArea(opcion.key)}
              >
                <span className={styles.areaName}>{opcion.nombre}</span>
                <span className={styles.areaLabel}>{opcion.etiqueta}</span>
              </button>
            );
          })}
        </div>

        <div className={`${styles.toolbar} ${styles.noPrint}`}>
          <input
            className={styles.search}
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar fórmula o concepto"
            aria-label="Buscar fórmula o concepto"
          />
          <span className={styles.count}>
            {totalResultados} referencia{totalResultados === 1 ? "" : "s"}
          </span>
        </div>

        <div className={styles.layout}>
          <aside className={`${styles.index} ${styles.noPrint}`}>
            <p className={styles.indexTitle}>Contenido</p>
            {seccionesFiltradas.map((seccion) => (
              <a
                key={seccion.id}
                className={styles.indexLink}
                href={`#${seccion.id}`}
              >
                {seccion.titulo}
              </a>
            ))}
            <Link className={styles.studyLink} href={`/estudiar/${area.key}`}>
              Ir al área de estudio
            </Link>
          </aside>

          <div className={styles.content}>
            {seccionesFiltradas.length === 0 ? (
              <div className={styles.empty}>
                No hay referencias que coincidan con “{busqueda}”.
              </div>
            ) : (
              seccionesFiltradas.map((seccion) => (
                <section
                  className={styles.section}
                  id={seccion.id}
                  key={seccion.id}
                >
                  <h2 className={styles.sectionTitle}>{seccion.titulo}</h2>
                  <div className={styles.formulaList}>
                    {seccion.items.map((item) => (
                      <article className={styles.formulaCard} key={item.nombre}>
                        <h3 className={styles.formulaName}>{item.nombre}</h3>
                        <div className={styles.formulaExpression}>
                          {item.formula}
                        </div>
                        <div className={styles.formulaDetail}>
                          {item.uso}
                          {item.variables && (
                            <span className={styles.variables}>
                              {item.variables}
                            </span>
                          )}
                          {item.alerta && (
                            <span className={styles.alert}>{item.alerta}</span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function FormulasPage() {
  return (
    <Suspense
      fallback={<div className={styles.loading}>Cargando formulario...</div>}
    >
      <FormularioContenido />
    </Suspense>
  );
}
