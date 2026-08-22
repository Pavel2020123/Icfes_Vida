import type { MetadataRoute } from "next";
import { URL_SITIO } from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/planes", "/registro", "/terminos", "/privacidad"],
      disallow: [
        "/admin",
        "/cambiar-contrasena-inicial",
        "/dashboard",
        "/diagnostico",
        "/estrategia-examen",
        "/estudiar",
        "/formulas",
        "/glosario",
        "/historial-respuestas",
        "/institucion",
        "/login",
        "/pagos",
        "/perfil",
        "/plan-estudio",
        "/planes/resultado-pago",
        "/preguntas-aleatorias",
        "/recuperar-contrasena",
        "/referidos",
        "/registro/confirmar",
        "/restablecer-contrasena",
        "/resultados",
        "/simulacro",
        "/unirse-clase",
        "/verificar-correo",
        "/api",
      ],
    },
    sitemap: new URL("/sitemap.xml", URL_SITIO).toString(),
    host: URL_SITIO.origin,
  };
}
