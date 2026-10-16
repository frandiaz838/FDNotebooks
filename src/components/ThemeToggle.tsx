"use client";

import { useEffect, useState } from "react";
import { MenuDesplegable, OpcionMenu } from "@/components/MenuDesplegable";

type Tema = "system" | "light" | "dark";

const TEMA_STORAGE_KEY = "fd-tema";

const ICONO_SOL = (
  <>
    <circle cx="12" cy="12" r="4" />
    <path
      d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
      strokeLinecap="round"
    />
  </>
);

const ICONO_LUNA = (
  <path
    d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

function almacenamiento() {
  // En navegación privada el acceso puede tirar excepción.
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function aplicar(tema: Tema) {
  if (tema === "system") {
    delete document.documentElement.dataset.theme;
    return;
  }
  document.documentElement.dataset.theme = tema;
}

export function ThemeToggle() {
  const [tema, setTema] = useState<Tema | null>(null);
  const [sistemaOscuro, setSistemaOscuro] = useState(false);

  useEffect(() => {
    const guardado = almacenamiento()?.getItem(TEMA_STORAGE_KEY);
    setTema(guardado === "light" || guardado === "dark" ? guardado : "system");

    const consulta = window.matchMedia("(prefers-color-scheme: dark)");
    setSistemaOscuro(consulta.matches);

    const alCambiar = (evento: MediaQueryListEvent) => setSistemaOscuro(evento.matches);
    consulta.addEventListener("change", alCambiar);
    return () => consulta.removeEventListener("change", alCambiar);
  }, []);

  function elegir(siguiente: Tema) {
    setTema(siguiente);
    aplicar(siguiente);
    const storage = almacenamiento();
    if (!storage) return;
    if (siguiente === "system") storage.removeItem(TEMA_STORAGE_KEY);
    else storage.setItem(TEMA_STORAGE_KEY, siguiente);
  }

  // Hasta saber la preferencia real no hay nada que dibujar: el server no la
  // conoce y pintaría el ícono equivocado.
  if (!tema) return <span className="h-10 w-10" />;

  const esOscuro = tema === "dark" || (tema === "system" && sistemaOscuro);

  return (
    <MenuDesplegable
      etiqueta="Cambiar tema"
      icono={
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
          {esOscuro ? ICONO_LUNA : ICONO_SOL}
        </svg>
      }
    >
      <OpcionMenu onClick={() => elegir("system")} activa={tema === "system"}>
        Sistema
      </OpcionMenu>
      <OpcionMenu onClick={() => elegir("light")} activa={tema === "light"}>
        Claro
      </OpcionMenu>
      <OpcionMenu onClick={() => elegir("dark")} activa={tema === "dark"}>
        Oscuro
      </OpcionMenu>
    </MenuDesplegable>
  );
}
