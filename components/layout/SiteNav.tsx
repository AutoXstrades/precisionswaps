import Link from "next/link";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/layout/LogoutButton";

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-white/10 px-3 py-2 transition hover:border-[#FF003C]/70 hover:text-white"
    >
      {label}
    </Link>
  );
}

export async function SiteNav() {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white/70">
      <NavLink href="/" label="Home" />
      <NavLink href="/pricing" label="Pricing" />
      <NavLink href="/contact" label="Contact" />
      {session?.user ? (
        <>
          {role === "CUSTOMER" ? <NavLink href="/dashboard" label="Dashboard" /> : null}
          {role === "ADMIN" ? <NavLink href="/admin/dashboard" label="Admin" /> : null}
          <LogoutButton />
        </>
      ) : (
        <>
          <NavLink href="/login" label="Login" />
          <NavLink href="/signup" label="Sign Up" />
        </>
      )}
    </nav>
  );
}
