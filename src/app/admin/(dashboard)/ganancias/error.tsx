"use client";

export default function ErrorGanancias({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-5 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-soft text-danger">
        <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-none stroke-current stroke-2">
          <path
            d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p className="font-semibold text-foreground">No pudimos cargar tus ventas</p>
      <p className="max-w-sm text-sm text-muted">
        Puede ser un corte momentáneo de la base de datos. Tus datos están guardados: volvé a
        intentar en unos segundos.
      </p>
      {error.digest && <p className="text-xs text-muted">Referencia: {error.digest}</p>}
      <button type="button" onClick={reset} className="btn-secondary mt-1 px-4 py-2 text-sm">
        Reintentar
      </button>
    </div>
  );
}
