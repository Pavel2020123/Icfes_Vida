import type { ReactNode } from "react";
import { crearMetadataPagina } from "../../lib/seo";

export const metadata = crearMetadataPagina({
  titulo: "Crear cuenta para preparar las pruebas Saber 11",
  descripcion:
    "Crea tu cuenta en SaberPlus y comienza tu preparación para el ICFES con diagnóstico, contenido por áreas y simulacros.",
  ruta: "/registro",
});

export default function RegistroLayout({ children }: { children: ReactNode }) {
  return children;
}
