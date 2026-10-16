"use client";

import { useEffect, useState } from "react";
import { partesFechaHora } from "@/lib/fechas";

export function RelojHeader() {
  const [ahora, setAhora] = useState<Date | null>(null);

  useEffect(() => {
    setAhora(new Date());

    // Se engancha al cambio de minuto y recién ahí pasa a cada 60s, para que
    // el reloj no quede hasta un minuto atrasado.
    const alProximoMinuto = 60_000 - (Date.now() % 60_000);
    let intervalo: ReturnType<typeof setInterval> | undefined;
    const arranque = setTimeout(() => {
      setAhora(new Date());
      intervalo = setInterval(() => setAhora(new Date()), 60_000);
    }, alProximoMinuto);

    return () => {
      clearTimeout(arranque);
      if (intervalo) clearInterval(intervalo);
    };
  }, []);

  const partes = ahora ? partesFechaHora(ahora) : null;

  return (
    // La cáscara se pinta siempre con el ancho ya reservado: la hora depende
    // del navegador, así que llega un instante después sin mover nada.
    <div className="hidden h-10 items-center gap-2 rounded-full border border-border bg-card px-3.5 sm:inline-flex">
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-4 w-4 shrink-0 fill-none stroke-accent stroke-2"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <span className="flex min-w-[74px] flex-col">
        {partes ? (
          <>
            <time
              dateTime={ahora?.toISOString()}
              aria-label={`${partes.dia}, ${partes.hora}:${partes.minuto}`}
              className="text-[15px] font-bold leading-none tabular-nums text-foreground"
            >
              {partes.hora}
              <span className="dos-puntos-vivos">:</span>
              {partes.minuto}
            </time>
            <span className="mt-1 text-[11px] font-medium uppercase leading-none tracking-wide text-muted">
              {partes.dia}
            </span>
          </>
        ) : (
          <>
            <span className="text-[15px] font-bold leading-none">&nbsp;</span>
            <span className="mt-1 text-[11px] leading-none">&nbsp;</span>
          </>
        )}
      </span>
    </div>
  );
}
