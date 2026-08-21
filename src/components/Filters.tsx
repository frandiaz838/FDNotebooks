"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PillSelect } from "@/components/PillSelect";
import { CATEGORIAS } from "@/lib/categorias";

export function Filters({ marcas }: { marcas: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const marca = searchParams.get("marca") ?? "";
  const categoria = searchParams.get("categoria") ?? "";
  const orden = searchParams.get("orden") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <PillSelect value={categoria} onChange={(e) => updateParam("categoria", e.target.value)}>
        <option value="">Todas las categorías</option>
        {CATEGORIAS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </PillSelect>
      <PillSelect value={marca} onChange={(e) => updateParam("marca", e.target.value)}>
        <option value="">Todas las marcas</option>
        {marcas.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </PillSelect>
      <PillSelect value={orden} onChange={(e) => updateParam("orden", e.target.value)}>
        <option value="">Más recientes primero</option>
        <option value="asc">Precio: menor a mayor</option>
        <option value="desc">Precio: mayor a menor</option>
      </PillSelect>
    </div>
  );
}
