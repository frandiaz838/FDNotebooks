import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { FloatingWhatsAppButton } from "@/components/FloatingWhatsAppButton";
import { SiteFooter } from "@/components/SiteFooter";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { RelojHeader } from "@/components/RelojHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function resolveSiteUrl() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
  title: "FD Computación",
  description: "Tecnología usada, revisada y a buen precio. Consultá por WhatsApp.",
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Aplica el tema elegido antes del primer pintado: si esperara a React,
            se vería un flash blanco al entrar en modo oscuro. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("fd-tema");if(t==="dark"||t==="light"){document.documentElement.dataset.theme=t}}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <header className="sticky top-0 z-10 min-h-[var(--header-alto)] border-b border-border bg-card/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo className="h-9 w-auto" />
              <span className="flex flex-col leading-tight">
                <span className="text-base font-bold tracking-tight text-foreground">
                  FD Computación
                </span>
                <span className="text-xs text-muted">Tecnología usada, revisada y a buen precio</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <RelojHeader />
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
        <FloatingWhatsAppButton />
      </body>
    </html>
  );
}
