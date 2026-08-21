const PREGUNTAS = [
  {
    q: "¿Puedo probar la notebook antes de pagar?",
    a: "Sí, siempre. Coordinamos por WhatsApp un encuentro en persona para que la pruebes a fondo — teclado, batería, cámara, wifi — antes de decidir.",
  },
  {
    q: "¿Qué garantía tiene?",
    a: "No ofrezco garantía formal post-venta, y por eso es tan importante que la pruebes bien antes de llevártela: cada equipo lo reviso a fondo y te muestro que funciona todo en el momento de la entrega.",
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "Efectivo (en pesos o dólares) o transferencia bancaria.",
  },
  {
    q: "¿Hacen envíos?",
    a: "No, la entrega es siempre en persona, coordinando el encuentro en Villa Allende o el centro de Córdoba.",
  },
];

export function FaqSection() {
  return (
    <section className="card flex flex-col gap-1 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-foreground">Preguntas frecuentes</h2>
      <div className="mt-3 flex flex-col divide-y divide-border">
        {PREGUNTAS.map((item) => (
          <details key={item.q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-foreground">
              {item.q}
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0 fill-none stroke-muted stroke-2 transition-transform group-open:rotate-180"
              >
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
