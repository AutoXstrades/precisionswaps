"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/layout/LogoutButton";

type NavItem = {
  href: string;
  label: string;
};

type ClientSiteNavProps = {
  links: NavItem[];
  showLogout: boolean;
};

function NavLink({
  href,
  label,
  onClick,
}: NavItem & {
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex min-h-11 items-center rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/72 transition hover:border-[#FF003C]/70 hover:text-white focus-visible:border-[#FF003C] focus-visible:outline-none"
    >
      {label}
    </Link>
  );
}

export function ClientSiteNav({ links, showLogout }: ClientSiteNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="relative sm:static">
      <button
        type="button"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="site-mobile-menu"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white transition hover:border-[#FF003C]/70 focus-visible:border-[#FF003C] focus-visible:outline-none sm:hidden"
      >
        <span className="sr-only">Menu</span>
        <span className="flex h-5 w-5 flex-col justify-center gap-1.5">
          <span
            className={`h-0.5 w-5 rounded-full bg-current transition ${
              isOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-5 rounded-full bg-current transition ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-0.5 w-5 rounded-full bg-current transition ${
              isOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      <nav className="hidden items-center gap-2 sm:flex sm:flex-wrap">
        {links.map((link) => (
          <NavLink key={link.href} {...link} />
        ))}
        {showLogout ? <LogoutButton /> : null}
      </nav>

      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-[9998] bg-black/55 backdrop-blur-sm transition-opacity duration-200 sm:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        id="site-mobile-menu"
        className={`absolute right-0 top-14 z-[10000] w-[min(82vw,20rem)] origin-top-right rounded-[8px] border border-white/10 bg-[#08080f]/95 p-3 shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur transition duration-200 sm:hidden ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        }`}
      >
        <nav className="grid gap-2">
          {links.map((link) => (
            <NavLink key={link.href} {...link} onClick={() => setIsOpen(false)} />
          ))}
          {showLogout ? <LogoutButton /> : null}
        </nav>
      </div>
    </div>
  );
}
