import { LOGO_ICON_WHITE_BASE64 } from "@/lib/logoBase64";

const LOGO_ASPECT_RATIO = 1212 / 702;

export function AppIconMark({ size }: { size: number }) {
  const logoWidth = Math.round(size * 0.56);
  const logoHeight = Math.round(logoWidth / LOGO_ASPECT_RATIO);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/png;base64,${LOGO_ICON_WHITE_BASE64}`}
        width={logoWidth}
        height={logoHeight}
        alt=""
      />
    </div>
  );
}
