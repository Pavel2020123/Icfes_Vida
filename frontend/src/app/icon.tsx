import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#146c94",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: 190,
        fontWeight: 800,
        letterSpacing: 0,
      }}
    >
      SP
    </div>,
    size,
  );
}
