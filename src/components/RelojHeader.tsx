"use client";

import { useEffect, useState } from "react";
import { formatearFechaHoraCorta } from "@/lib/fechas";

export function RelojHeader() {
  const [ahora, setAhora] = useState<Date | null>(null);

  useEffect(() => {
    setAhora(new Date());

    // Arranca en el cambio de minuto y recién ahí pasa a cada 60s, para que
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

  // El server no conoce la hora del navegador: se reserva el lugar y se pinta
  // recién en el cliente, así no parpadea ni mueve el layout.
  return (
    <span className="hidden min-w-36 text-right text-xs tabular-nums text-muted sm:inline-block">
      {ahora ? formatearFechaHoraCorta(ahora) : ""}
    </span>
  );
}
