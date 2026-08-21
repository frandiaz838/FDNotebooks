import type { Notebook } from "@/lib/types";
import { NotebookCard } from "@/components/NotebookCard";
import { EmptyState } from "@/components/EmptyState";

export function NotebookGrid({ notebooks }: { notebooks: Notebook[] }) {
  if (notebooks.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay notebooks publicadas"
        description="Volvé a pasar pronto, estamos cargando el catálogo."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {notebooks.map((notebook) => (
        <NotebookCard key={notebook.id} notebook={notebook} />
      ))}
    </div>
  );
}
