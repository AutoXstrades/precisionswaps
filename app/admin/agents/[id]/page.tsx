import Link from "next/link";
import { notFound } from "next/navigation";
import { AgentConfigForm } from "@/components/admin/AgentConfigForm";
import { formatAdminDate, getAgentForAdmin, requireAdmin } from "@/lib/admin";

type AdminAgentEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminAgentEditPage({
  params,
}: AdminAgentEditPageProps) {
  await requireAdmin();
  const { id } = await params;
  const agent = await getAgentForAdmin(id);

  if (!agent) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
            Edit agent
          </p>
          <h1 className="mt-3 text-4xl font-black text-white">{agent.name}</h1>
          <p className="mt-3 text-white/58">
            {agent.type} | Updated {formatAdminDate(agent.updatedAt)}
          </p>
        </div>
        <Link
          href="/admin/agents"
          className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-white/70 hover:border-[#FF003C]/70 hover:text-white"
        >
          All Agents
        </Link>
      </div>

      <AgentConfigForm agent={agent} />
    </section>
  );
}
