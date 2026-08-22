export interface CasoPreguntaPublico {
  id: string;
  titulo: string | null;
  contexto: string;
  imagenUrl: string | null;
  area: string;
}

function resolverImagen(imagenUrl: string) {
  if (
    imagenUrl.startsWith("http://") ||
    imagenUrl.startsWith("https://") ||
    imagenUrl.startsWith("/")
  ) {
    return imagenUrl;
  }
  return `/imagenes/${imagenUrl}`;
}

export default function ContextoCasoPregunta({
  caso,
  ordenEnCaso,
}: {
  caso: CasoPreguntaPublico | null;
  ordenEnCaso?: number | null;
}) {
  if (!caso) return null;

  return (
    <section
      style={{
        marginBottom: 22,
        padding: "16px 18px",
        borderLeft: "4px solid var(--color-secundario, #19a7ce)",
        backgroundColor: "#F2F8FB",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 8,
          flexWrap: "wrap",
        }}
      >
        <h2
          style={{ margin: 0, color: "var(--color-primario, #146c94)", fontSize: 15, fontWeight: 800 }}
        >
          {caso.titulo || "Contexto para las siguientes preguntas"}
        </h2>
        {ordenEnCaso && (
          <span style={{ color: "#5D6C76", fontSize: 11, fontWeight: 700 }}>
            Pregunta {ordenEnCaso} del caso
          </span>
        )}
      </div>
      <p
        style={{
          margin: 0,
          color: "#334650",
          fontSize: 14,
          lineHeight: 1.65,
          whiteSpace: "pre-wrap",
        }}
      >
        {caso.contexto}
      </p>
      {caso.imagenUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolverImagen(caso.imagenUrl)}
          alt={caso.titulo || "Imagen del contexto"}
          style={{
            display: "block",
            maxWidth: "100%",
            maxHeight: 420,
            marginTop: 14,
            objectFit: "contain",
            border: "1px solid #C8D9E1",
          }}
          onError={(event) => (event.currentTarget.style.display = "none")}
        />
      )}
    </section>
  );
}
