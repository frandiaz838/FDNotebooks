"use client";

import { useEffect, useState } from "react";
import { formatearFechaHora } from "@/lib/fechas";

export function Reloj() {
  const [ahora, setAhora] = useState<Date | null>(null);

  useEffect(() => {
    setAhora(new Date());
    const id = setInterval(() => setAhora(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Recién se pinta en el cliente: la hora del server no es la del navegador.
  if (!ahora) return <span className="h-4" />;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {formatearFechaHora(ahora)}
    </span>
  );
}
