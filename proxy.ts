import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { safeRedirect } from "@/lib/safe-redirect";

const customerRoutes = ["/dashboard", "/builds"];
const adminRoutes = [
  "/admin/dashboard",
  "/admin/builds",
  "/admin/users",
  "/admin/agents",
  "/admin/logs",
];

export default auth((request) => {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;
  const user = request.auth?.user;
  const isCustomerRoute = customerRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (pathname === "/admin" && user?.role === "CUSTOMER") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (isCustomerRoute && !user) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", safeRedirect(pathname, "/dashboard"));
    return NextResponse.redirect(loginUrl);
  }

  if (isCustomerRoute && user?.role !== "CUSTOMER") {
    return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
  }

  if (isAdminRoute && !user) {
    const adminUrl = new URL("/admin", nextUrl);
    adminUrl.searchParams.set("callbackUrl", safeRedirect(pathname, "/admin/dashboard"));
    return NextResponse.redirect(adminUrl);
  }

  if (isAdminRoute && user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/builds/:path*", "/admin/:path*"],
};
