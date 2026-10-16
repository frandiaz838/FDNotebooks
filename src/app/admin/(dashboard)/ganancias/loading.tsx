function Bloque({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-neutral-soft ${className}`} />;
}

export default function CargandoGanancias() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-label="Cargando ganancias">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Bloque className="h-10 w-64" />
        <Bloque className="h-10 w-72" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Bloque className="col-span-2 h-32" />
        <Bloque className="h-32" />
        <Bloque className="h-32" />
        <Bloque className="h-32" />
        <Bloque className="h-32" />
      </div>

      <Bloque className="h-6 w-96 max-w-full" />
      <Bloque className="h-11 w-full sm:w-80" />
      <Bloque className="h-80 w-full" />
    </div>
  );
}
