"use client";

import { useState } from "react";

export function ShareButton({ title }: { title: string }) {
  const [copiado, setCopiado] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // el usuario cerró el diálogo de compartir, no hacemos nada
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-muted shadow-sm transition-colors hover:text-foreground"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8.6 10.5 6.8-3.9M8.6 13.5l6.8 3.9" strokeLinecap="round" />
      </svg>
      {copiado ? "¡Copiado!" : "Compartir"}
    </button>
  );
}
