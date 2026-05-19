import { AgentPanel } from "@/components/builds/AgentPanel";
import { requireCustomer } from "@/lib/customer";

export default async function NewBuildPage() {
  await requireCustomer();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF003C] sm:text-sm sm:tracking-[0.22em]">
          Build intake
        </p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
          LS Swap Specialist flow
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-white/68">
          Work through the structured intake, generate a build ticket, and save
          it to your account.
        </p>
      </div>
      <AgentPanel />
    </section>
  );
}
