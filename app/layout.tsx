import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "@/components/layout/SiteNav";
import { triggerDailyPhotoCleanup } from "@/lib/photo-cleanup-trigger";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrecisionSwaps.co",
  description: "Dark-neon LS swap planning powered by Last Stop Swaps.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await triggerDailyPhotoCleanup();

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-white/10 bg-black/45 backdrop-blur">
            <div className="site-header-inner mx-auto w-full max-w-7xl gap-4 px-4 py-4 sm:px-5 sm:py-5">
              <Link href="/" className="site-header-logo" aria-label="PrecisionSwaps.co home">
                <Image
                  src="/images/precisionswaps-header-banner.jpeg"
                  alt="PrecisionSwaps.co powered by Last Stop Swaps"
                  width={2048}
                  height={433}
                  priority
                  className="site-header-logo-image"
                  sizes="(max-width: 480px) 90vw, (max-width: 768px) 70vw, (max-width: 1024px) 65vw, 28rem"
                />
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