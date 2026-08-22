import { ImageResponse } from "next/og";

export const alt = "SaberPlus, preparación para las pruebas Saber 11";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "78px 88px",
        background: "#f6f1f1",
        color: "#172b35",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ width: 730, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 42,
            color: "#146c94",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          PREPARACIÓN SABER 11
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            lineHeight: 1.08,
            fontWeight: 800,
            letterSpacing: 0,
          }}
        >
          Estudia con una ruta clara hacia el ICFES
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 30,
            color: "#526a75",
            fontSize: 25,
            lineHeight: 1.4,
          }}
        >
          Diagnóstico, plan semanal, simulacros y seguimiento real.
        </div>
      </div>

      <div
        style={{
          width: 270,
          height: 270,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 18,
          padding: 48,
          borderRadius: 54,
          background: "#146c94",
          boxShadow: "0 28px 60px rgba(20,108,148,0.24)",
        }}
      >
        <div
          style={{
            width: 42,
            height: 76,
            borderRadius: 10,
            background: "#d2e0fb",
          }}
        />
        <div
          style={{
            width: 42,
            height: 126,
            borderRadius: 10,
            background: "#ffffff",
          }}
        />
        <div
          style={{
            width: 42,
            height: 176,
            borderRadius: 10,
            background: "#49c4b0",
          }}
        />
      </div>
    </div>,
    size,
  );
}
