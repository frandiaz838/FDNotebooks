import { ImageResponse } from "next/og";
import { LOGO_ICON_WHITE_BASE64 } from "@/lib/logoBase64";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: 96,
          background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${LOGO_ICON_WHITE_BASE64}`}
          width={168}
          height={97}
          alt=""
          style={{ marginBottom: 40 }}
        />
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>FD Computación</div>
        <div style={{ fontSize: 32, marginTop: 20, color: "rgba(255,255,255,0.85)" }}>
          Tecnología usada, revisada y a buen precio
        </div>
      </div>
    ),
    { ...size }
  );
}
