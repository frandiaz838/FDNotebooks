"use client";

import { useEffect, useState } from "react";

type Tema = "light" | "dark";

export const TEMA_STORAGE_KEY = "fd-tema";

export function ThemeToggle() {
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => {
    const guardado = localStorageSeguro()?.getItem(TEMA_STORAGE_KEY);
    if (guardado === "light" || guardado === "dark") {
      setTema(guardado);
      return;
    }
    setTema(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);

  function alternar() {
    const siguiente: Tema = tema === "dark" ? "light" : "dark";
    setTema(siguiente);
    document.documentElement.dataset.theme = siguiente;
    localStorageSeguro()?.setItem(TEMA_STORAGE_KEY, siguiente);
  }

  // Hasta saber el tema real no hay nada que dibujar: el server no conoce la
  // preferencia del navegador y pintaría el ícono equivocado.
  if (!tema) return <span className="h-9 w-9" />;

  const esOscuro = tema === "dark";

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={esOscuro ? "Modo claro" : "Modo oscuro"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
        {esOscuro ? (
          <path
            d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path
              d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </button>
  );
}

function localStorageSeguro() {
  // En navegación privada el acceso puede tirar excepción.
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
