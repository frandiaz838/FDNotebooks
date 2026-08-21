import { buildGenericWhatsAppLink, formatWhatsAppNumberDisplay } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { Logo } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div className="flex items-center gap-2.5">
          <Logo className="h-8 w-auto" />
          <span className="font-bold text-foreground">FD Computación</span>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Contacto</p>
          <a
            href={buildGenericWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 text-sm text-muted hover:text-whatsapp-hover"
          >
            <WhatsAppIcon className="h-4 w-4 shrink-0 fill-whatsapp" />
            {formatWhatsAppNumberDisplay()}
          </a>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-2">
              <path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            Villa Allende y Centro de Córdoba
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Cómo comprar</p>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm text-muted">
            <li>Efectivo (ARS o USD) o transferencia bancaria</li>
            <li>Entrega y prueba siempre en persona</li>
            <li>Coordinamos todo por WhatsApp</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted">
        FD Computación · Compra y venta de notebooks usadas
      </div>
    </footer>
  );
}
