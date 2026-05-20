import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "@/components/layout/SiteNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrecisionSwaps.co",
  description: "Dark-neon LS swap planning powered by Last Stop Swaps.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-white/10 bg-black/45 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-5 sm:py-5">
              <Link href="/" className="group flex min-w-0 items-center gap-3">
                <span className="relative h-11 w-28 shrink-0 overflow-hidden rounded-[6px] border border-[#FF003C]/25 bg-black/55 sm:h-14 sm:w-40">
                  <Image
                    src="/images/precisionswaps-logo.jpeg"
                    alt="PrecisionSwaps.co powered by Last Stop Swaps"
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="(max-width: 640px) 112px, 160px"
                  />
                </span>
                <span className="hidden min-w-0 sm:block">
                  <span className="block truncate text-lg font-black uppercase tracking-[0.18em] text-white">
                    PrecisionSwaps.co
                  </span>
                  <span className="block truncate text-xs font-semibold uppercase tracking-[0.2em] text-white/55 group-hover:text-white/80">
                    Powered by Last Stop Swaps
                  </span>
                </span>
              </Link>
              <SiteNav />
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-5 sm:py-10">
            {children}
          </main>

          <footer className="border-t border-white/10 bg-black/40">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p>PrecisionSwaps.co - Powered by Last Stop Swaps</p>
              <p>Contact: info@precisionswaps.co | Memphis, TN</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
