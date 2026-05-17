import Link from "next/link";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeRedirect } from "@/lib/safe-redirect";

type AdminPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  const safeCallbackUrl = safeRedirect(callbackUrl, "/admin/dashboard");

  if (!session?.user) {
    return (
      <section className="mx-auto max-w-md">
        <div className="neon-panel rounded-[8px] p-6">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
            Owner login
          </p>
          <h1 className="mt-3 text-3xl font-black text-white">Nick back office</h1>
          <LoginForm mode="admin" callbackUrl={safeCallbackUrl} />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="neon-panel rounded-[8px] p-6">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
          Owner back office
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">
          Admin access for Nick
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-white/68">
          Open the owner command center for customer builds, AI logs, build
          status tracking, and Clawbot agent team settings.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {["Build Management", "AI Logs", "Agent Team"].map((item) => (
            <div key={item} className="rounded-[8px] border border-white/10 bg-black/45 p-4">
              <p className="text-lg font-black text-white">{item}</p>
              <p className="mt-2 text-sm text-white/50">Available in the back office</p>
            </div>
          ))}
        </div>
        <Link
          href="/admin/dashboard"
          className="mt-8 inline-flex rounded-full border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white/80 hover:border-[#FF003C]/70"
        >
          Open Dashboard
        </Link>
      </div>
    </section>
  );
}
