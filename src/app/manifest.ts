import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FD Computación",
    short_name: "FD Computación",
    description: "Tecnología usada, revisada y a buen precio. Consultá por WhatsApp.",
    display: "standalone",
    background_color: "#f6f7fb",
    theme_color: "#1d4ed8",
    icons: [
      {
        src: "/manifest-icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
