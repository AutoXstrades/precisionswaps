"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { safeRedirect } from "@/lib/safe-redirect";

type LoginFormProps = {
  mode?: "customer" | "admin";
  callbackUrl?: string;
};

export function LoginForm({ mode = "customer", callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const redirectTo = safeRedirect(
    callbackUrl,
    mode === "admin" ? "/admin/dashboard" : "/dashboard",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Email or password is incorrect.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-semibold text-white/70">Email</span>
        <input
          name="email"
          type="email"
          required
          className="mt-2 min-h-11 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          placeholder={mode === "admin" ? "nick@example.com" : "you@example.com"}
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-white/70">Password</span>
        <input
          name="password"
          type="password"
          required
          className="mt-2 min-h-11 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          placeholder="Password"
        />
      </label>
      {error ? <p className="text-sm font-semibold text-[#FF003C]">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-11 w-full rounded-full bg-[#FF003C] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60 sm:tracking-[0.16em]"
      >
        {isSubmitting ? "Signing In..." : "Log In"}
      </button>
    </form>
  );
}
