import { ImageResponse } from "next/og";
import { AppIconMark } from "@/lib/appIcon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<AppIconMark size={size.width} />, { ...size });
}
