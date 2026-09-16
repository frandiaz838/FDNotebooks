"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";

export function AdminHeader() {
  const pathname = usePathname();
  const isListado = pathname === "/admin";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {isListado ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Panel de administración
            </p>
            <span className="text-xl font-bold text-foreground">Mis publicaciones</span>
          </>
        ) : (
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
              <path d="M15 19 8 12l7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Volver al listado
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3">
        {isListado && (
          <>
            <Link
              href="/admin/notebooks/nueva"
              className="btn-accent col-span-2 order-first sm:order-none sm:w-auto"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2.5]">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              Nueva publicación
            </Link>
            <Link href="/admin/ganancias" className="btn-secondary sm:w-auto">
              Ganancias
            </Link>
          </>
        )}
        <LogoutButton className={isListado ? "sm:w-auto" : "col-span-2 sm:w-auto"} />
      </div>
    </div>
  );
}
