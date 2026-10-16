import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <>
      <Image
        src="/brand/logo-icon-black.svg"
        alt="FD Computación"
        width={1212}
        height={702}
        priority
        className={`logo-claro ${className ?? ""}`}
      />
      <Image
        src="/brand/logo-icon-white.svg"
        alt=""
        aria-hidden
        width={1212}
        height={702}
        priority
        className={`logo-oscuro ${className ?? ""}`}
      />
    </>
  );
}
