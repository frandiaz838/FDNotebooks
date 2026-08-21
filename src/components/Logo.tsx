import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/logo-icon-black.svg"
      alt="FD Notebooks"
      width={1212}
      height={702}
      priority
      className={className}
    />
  );
}
