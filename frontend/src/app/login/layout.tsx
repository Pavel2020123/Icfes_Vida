import type { ReactNode } from "react";
import { crearMetadataPagina } from "../../lib/seo";

export const metadata = crearMetadataPagina({
  titulo: "Iniciar sesión",
  descripcion: "Accede a tu cuenta de SaberPlus.",
  ruta: "/login",
  indexar: false,
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
