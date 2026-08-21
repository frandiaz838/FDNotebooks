const BULLETS = [
  {
    icon: (
      <path
        d="m11 3-7 12h6l-1 6 8-12h-6l1-6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    text: "Cada equipo se revisa antes de publicarlo",
  },
  {
    icon: (
      <>
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" />
      </>
    ),
    text: "La probás vos mismo en persona antes de decidir",
  },
  {
    icon: (
      <>
        <path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    text: "Villa Allende y Centro de Córdoba",
  },
];

export function AboutSection() {
  return (
    <section className="card flex flex-col gap-6 p-6 sm:p-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Sobre FD Computación</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Soy Francisco, y ya llevo{" "}
          <strong className="font-semibold text-foreground">más de 100 notebooks vendidas</strong>{" "}
          desde que empecé por Facebook Marketplace. Armé FD Computación para hacerlo de forma más
          prolija: reviso cada equipo antes de publicarlo y coordino todo por WhatsApp para que lo
          pruebes vos mismo, en persona, antes de decidir.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {BULLETS.map((bullet, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-2">
                {bullet.icon}
              </svg>
            </span>
            <p className="pt-1.5 text-sm font-medium text-foreground">{bullet.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
