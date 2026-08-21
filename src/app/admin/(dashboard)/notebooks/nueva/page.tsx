import { NotebookForm } from "@/components/NotebookForm";

export default function NuevaNotebookPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-foreground">Nueva notebook</h1>
      <NotebookForm mode="crear" />
    </div>
  );
}
