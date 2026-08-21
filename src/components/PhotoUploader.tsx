"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export function PhotoUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "No se pudieron subir las fotos.");
      onChange([...value, ...body.urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo fotos.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        disabled={uploading}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragActive
            ? "border-accent bg-accent-soft"
            : "border-border bg-slate-50 hover:border-accent/60 hover:bg-accent-soft/40"
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-border">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-accent stroke-2">
            <path
              d="M12 16V4m0 0 4 4m-4-4-4 4M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="text-sm font-medium text-foreground">
          {uploading ? "Subiendo fotos..." : "Arrastrá las fotos acá o hacé clic para elegirlas"}
        </p>
        <p className="text-xs text-muted">JPG o PNG · se optimizan automáticamente</p>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        disabled={uploading}
        className="hidden"
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((url, index) => (
            <div key={url} className="group relative flex flex-col gap-1.5">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-slate-100">
                <Image src={url} alt="" fill sizes="150px" className="object-cover" />
                {index === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-foreground/85 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Portada
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="text-muted hover:text-foreground disabled:opacity-30"
                  aria-label="Mover antes"
                >
                  ← Antes
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="text-danger hover:underline"
                >
                  Quitar
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  className="text-muted hover:text-foreground disabled:opacity-30"
                  aria-label="Mover después"
                >
                  Después →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
