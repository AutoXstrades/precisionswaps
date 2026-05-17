import Link from "next/link";
import Image from "next/image";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <section className="grid min-h-[68vh] items-center gap-8 lg:grid-cols-[440px_1fr]">
      <div className="neon-panel rounded-[8px] p-6">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
          Create account
        </p>
        <h1 className="mt-3 text-3xl font-black text-white">
          Start your build
        </h1>
        <SignupForm />
        <p className="mt-5 text-sm text-white/58">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-white hover:text-[#FF003C]">
            Log in
          </Link>
        </p>
      </div>

      <div className="relative hidden min-h-[560px] overflow-hidden rounded-[8px] border border-white/10 bg-black lg:block">
        <Image
          src="/images/background-engine.jpeg"
          alt="Performance engine bay"
          fill
          className="object-cover opacity-72"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-black/88" />
      </div>
    </section>
  );
}
