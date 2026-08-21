const PREGUNTAS = [
  {
    q: "¿Puedo probar la notebook antes de pagar?",
    a: "Sí, siempre. Coordinamos por WhatsApp un encuentro en persona para que la pruebes a fondo — teclado, batería, cámara, wifi — antes de decidir.",
  },
  {
    q: "¿Qué garantía tiene?",
    a: "Tu garantía es probarla vos mismo: antes de decidir, revisás en persona que todo funcione — teclado, batería, cámara, wifi, puertos. Como es una venta entre particulares no hay garantía formal post-venta, pero eso no significa que desaparezca: si después de la compra te surge una duda, una consulta o un problema, me escribís y te ayudo a resolverlo.",
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "Efectivo (en pesos o dólares) o transferencia bancaria.",
  },
  {
    q: "¿Hacen envíos?",
    a: "Las entregas se realizan siempre en persona, coordinando el encuentro en un lugar público a convenir, desde Villa Allende hasta el centro de Córdoba, con costo variable según la distancia.",
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
