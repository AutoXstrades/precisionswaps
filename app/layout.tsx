import type { Metadata, Viewport } from "next";
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
              <Link href="/" className="group min-w-0">
                <p className="truncate text-base font-black uppercase tracking-[0.12em] text-white sm:text-lg sm:tracking-[0.18em]">
                  PrecisionSwaps.co
                </p>
                <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/55 group-hover:text-white/80 sm:text-xs sm:tracking-[0.2em]">
                  Powered by Last Stop Swaps
                </p>
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
