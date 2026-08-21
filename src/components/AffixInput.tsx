export function AffixInput({
  prefix,
  suffix,
  ...inputProps
}: {
  prefix?: string;
  suffix?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-sm transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
      {prefix && <span className="text-sm leading-none text-muted select-none">{prefix}</span>}
      <input
        {...inputProps}
        className="w-full min-w-0 border-none bg-transparent p-0 text-sm leading-none text-foreground outline-none"
      />
      {suffix && <span className="text-sm leading-none text-muted select-none">{suffix}</span>}
    </div>
  );
}
