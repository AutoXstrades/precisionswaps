import { AgentPanel } from "@/components/builds/AgentPanel";
import { requireCustomer } from "@/lib/customer";

export default async function NewBuildPage() {
  await requireCustomer();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
          Build intake
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">
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
