"use client";

import { useEffect, useRef, useState } from "react";

export function MenuDesplegable({
  etiqueta,
  icono,
  children,
}: {
  etiqueta: string;
  icono: React.ReactNode;
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;

    function alApuntar(evento: MouseEvent) {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    }
    function alTeclear(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAbierto(false);
    }

    document.addEventListener("mousedown", alApuntar);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("mousedown", alApuntar);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [abierto]);

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((previo) => !previo)}
        aria-label={etiqueta}
        aria-haspopup="menu"
        aria-expanded={abierto}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        {icono}
      </button>

      {abierto && (
        <div
          role="menu"
          onClick={() => setAbierto(false)}
          className="absolute right-0 top-12 z-30 min-w-48 rounded-xl border border-border bg-card p-1 shadow-lg"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function OpcionMenu({
  onClick,
  activa = false,
  children,
}: {
  onClick: () => void;
  activa?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      {children}
      {activa && (
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-accent stroke-2">
          <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
