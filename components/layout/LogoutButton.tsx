"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setIsSigningOut(true);
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSigningOut}
      className="rounded-full border border-[#FF003C]/50 px-3 py-2 text-sm font-semibold text-white/80 transition hover:border-[#FF003C] hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
    >
      {isSigningOut ? "Logging out..." : "Logout"}
    </button>
  );
}
