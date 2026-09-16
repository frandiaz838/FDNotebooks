import { ImageResponse } from "next/og";
import { LOGO_ICON_WHITE_BASE64 } from "@/lib/logoBase64";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORIAS = ["Notebooks", "PC de escritorio", "Consolas", "Monitores", "Celulares"];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #1d4ed8 0%, #6d28d9 55%, #7c3aed 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 128,
            height: 128,
            borderRadius: 32,
            background: "rgba(255,255,255,0.14)",
            border: "2px solid rgba(255,255,255,0.35)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${LOGO_ICON_WHITE_BASE64}`}
            width={88}
            height={51}
            alt=""
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 66,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.12,
            }}
          >
            <span>Tecnología usada,</span>
            <span>revisada y a buen precio</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, maxWidth: 1000 }}>
            {CATEGORIAS.map((categoria) => (
              <div
                key={categoria}
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: "white",
                  background: "rgba(255,255,255,0.16)",
                  borderRadius: 999,
                  padding: "10px 22px",
                }}
              >
                {categoria}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
