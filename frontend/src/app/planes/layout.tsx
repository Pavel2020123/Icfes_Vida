import type { ReactNode } from "react";
import { crearMetadataPagina } from "../../lib/seo";

export const metadata = crearMetadataPagina({
  titulo: "Planes de preparación ICFES para estudiantes y colegios",
  descripcion:
    "Conoce el acceso completo de SaberPlus para estudiantes y los planes institucionales para colegios que preparan las pruebas Saber 11.",
  ruta: "/planes",
});

export default function PlanesLayout({ children }: { children: ReactNode }) {
  return children;
}
