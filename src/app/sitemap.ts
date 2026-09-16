import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase/client";

function resolveSiteUrl() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").toString();
  } catch {
    return "http://localhost:3000/";
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = resolveSiteUrl();

  const { data } = await supabase
    .from("notebooks")
    .select("id, actualizado_en")
    .eq("disponible", true);

  const publicaciones = (data ?? []).map((notebook) => ({
    url: `${siteUrl}notebooks/${notebook.id}`,
    lastModified: notebook.actualizado_en,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...publicaciones,
  ];
}
