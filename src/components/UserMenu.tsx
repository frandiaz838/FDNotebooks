"use client";

import { usePathname, useRouter } from "next/navigation";
import { MenuDesplegable, OpcionMenu } from "@/components/MenuDesplegable";

export function UserMenu() {
  const pathname = usePathname();
  const router = useRouter();

  if (!pathname.startsWith("/admin") || pathname === "/admin/login") return null;

  async function cerrarSesion() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <MenuDesplegable
      etiqueta="Menú de usuario"
      icono={
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
          <circle cx="12" cy="8" r="4" />
          <path d="M5 21a7 7 0 0 1 14 0" strokeLinecap="round" />
        </svg>
      }
    >
      <OpcionMenu onClick={cerrarSesion}>Cerrar sesión</OpcionMenu>
    </MenuDesplegable>
  );
}
