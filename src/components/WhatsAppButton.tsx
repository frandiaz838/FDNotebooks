import { buildWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export function WhatsAppButton({
  nombre,
  precio,
  moneda,
  compact = false,
}: {
  nombre: string;
  precio: number;
  moneda: string;
  compact?: boolean;
}) {
  const href = buildWhatsAppLink(nombre, precio, moneda);

  if (compact) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-whatsapp px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-whatsapp-hover"
      >
        <WhatsAppIcon className="h-4 w-4 fill-current" />
        Consultar
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-6 py-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-whatsapp-hover"
    >
      <WhatsAppIcon className="h-6 w-6 fill-current" />
      Consultar por WhatsApp
    </a>
  );
}
