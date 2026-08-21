import { buildWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export function WhatsAppButton({
  nombre,
  precio,
  moneda,
}: {
  nombre: string;
  precio: number;
  moneda: string;
}) {
  const href = buildWhatsAppLink(nombre, precio, moneda);

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
