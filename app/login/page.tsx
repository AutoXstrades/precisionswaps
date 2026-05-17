import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeRedirect } from "@/lib/safe-redirect";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;
  const safeCallbackUrl = safeRedirect(callbackUrl, "/dashboard");

  return (
    <section className="grid min-h-[68vh] items-center gap-8 lg:grid-cols-[1fr_440px]">
      <div className="relative hidden min-h-[560px] overflow-hidden rounded-[8px] border border-white/10 bg-black lg:block">
        <Image
          src="/images/business-flyer-theme.png"
          alt="PrecisionSwaps service flyer"
          fill
          className="object-cover opacity-70"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/35 to-black/88" />
      </div>

      <div className="neon-panel rounded-[8px] p-6">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
          Customer login
        </p>
        <h1 className="mt-3 text-3xl font-black text-white">Welcome back</h1>
        <LoginForm callbackUrl={safeCallbackUrl} />
        <p className="mt-5 text-sm text-white/58">
          Need an account?{" "}
          <Link href="/signup" className="font-bold text-white hover:text-[#FF003C]">
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
}
