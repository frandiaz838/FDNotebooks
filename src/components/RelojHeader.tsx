"use client";

import { useEffect, useState } from "react";
import { partesFechaHora } from "@/lib/fechas";

export function RelojHeader() {
  // Arranca con la hora del render (también en el server, que formatea en la
  // misma zona): así el ancho sale completo de entrada y nada se corre cuando
  // el navegador toma la posta.
  const [ahora, setAhora] = useState(() => new Date());

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

  const { dia, hora, minuto } = partesFechaHora(ahora);

  return (
    <div className="hidden h-11 w-fit items-center gap-2 rounded-full border border-border bg-card pl-1.5 pr-4 sm:inline-flex">
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15">
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className="h-4 w-4 fill-none stroke-accent stroke-2"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span
          aria-hidden
          className="punto-en-vivo absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-success"
        />
      </span>

      <span className="flex flex-col gap-0.5">
        <time
          dateTime={ahora.toISOString()}
          aria-label={`${dia}, ${hora}:${minuto}`}
          suppressHydrationWarning
          className="text-[17px] font-bold leading-[1.1] tabular-nums text-foreground"
        >
          {hora}
          <span className="dos-puntos-vivos">:</span>
          {minuto}
        </time>
        <span
          suppressHydrationWarning
          className="text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-muted-suave"
        >
          {dia}
        </span>
      </span>
    </div>
  );
}
