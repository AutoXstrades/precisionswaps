import { auth } from "@/auth";
import { ClientSiteNav } from "@/components/layout/ClientSiteNav";

export async function SiteNav() {
  const session = await auth();
  const role = session?.user?.role;
  const links = [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
  ];

  if (session?.user && role === "CUSTOMER") {
    links.push({ href: "/dashboard", label: "Dashboard" });
  }

  if (session?.user && role === "ADMIN") {
    links.push({ href: "/admin/dashboard", label: "Admin" });
  }

  if (!session?.user) {
    links.push({ href: "/login", label: "Login" }, { href: "/signup", label: "Sign Up" });
  }

  return <ClientSiteNav links={links} showLogout={Boolean(session?.user)} />;
}
