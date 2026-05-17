import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/layout/SiteNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrecisionSwaps.co",
  description: "Dark-neon LS swap planning powered by Last Stop Swaps.",
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
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/" className="group">
                <p className="text-lg font-black uppercase tracking-[0.18em] text-white">
                  PrecisionSwaps.co
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55 group-hover:text-white/80">
                  Powered by Last Stop Swaps
                </p>
              </Link>
              <SiteNav />
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10">
            {children}
          </main>

          <footer className="border-t border-white/10 bg-black/40">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
              <p>PrecisionSwaps.co - Powered by Last Stop Swaps</p>
              <p>Contact: info@precisionswaps.co | Memphis, TN</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
