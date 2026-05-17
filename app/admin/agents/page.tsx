import { ClawbotSupervisorPanel } from "@/components/admin/ClawbotSupervisorPanel";
import Link from "next/link";
import { formatAdminDate, listAgents, requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function parseSupervisorReport(content: string) {
  try {
    const parsed = JSON.parse(content) as {
      type?: string;
      title?: string;
      report?: string;
    };

    if (parsed.type !== "clawbot_supervisor_report" || !parsed.report) {
      return null;
    }

    return {
      title: parsed.title ?? "Clawbot Supervisor Report",
      report: parsed.report,
    };
  } catch {
    return null;
  }
}

export default async function AdminAgentsPage() {
  await requireAdmin();

  const [agents, latestSupervisorLog] = await Promise.all([
    listAgents(),
    prisma.agentLog.findFirst({
      where: {
        content: {
          contains: "clawbot_supervisor_report",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);
  const parsedLatestReport = latestSupervisorLog
    ? parseSupervisorReport(latestSupervisorLog.content)
    : null;
  const latestReport =
    parsedLatestReport && latestSupervisorLog
      ? {
          ...parsedLatestReport,
          createdAt: latestSupervisorLog.createdAt.toISOString(),
        }
      : null;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
          Agent team
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">AI agent configs</h1>
        <p className="mt-4 max-w-2xl leading-7 text-white/68">
          Review and update agent names, types, roles, and JSON configuration
          used by the LS Specialist and Clawbot team.
        </p>
      </div>

      <ClawbotSupervisorPanel latestReport={latestReport} />

      <div className="neon-panel overflow-hidden rounded-[8px]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead className="border-b border-white/10 bg-black/45 text-xs font-black uppercase tracking-[0.16em] text-white/42">
              <tr>
                <th className="px-5 py-4">Agent</th>
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Updated</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {agents.length ? (
                agents.map((agent) => (
                  <tr key={agent.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-5 py-4 font-black text-white">{agent.name}</td>
                    <td className="px-5 py-4 text-xs font-semibold text-white/42">
                      {agent.id}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-white/72">
                      {agent.type}
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-[#FF003C]">
                      {agent.role}
                    </td>
                    <td className="px-5 py-4 text-sm text-white/50">
                      {formatAdminDate(agent.updatedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/agents/${agent.id}`}
                        className="rounded-full border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/70 hover:border-[#FF003C]/70 hover:text-white"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-8 text-sm text-white/52" colSpan={6}>
                    No agent configs found. Run the Prisma seed to create the
                    default LS Specialist and Clawbot Supervisor entries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-5">
        {agents.length ? (
          agents.map((agent) => (
            <article key={agent.id} className="neon-panel rounded-[8px] p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF003C]">
                    {agent.type} | {agent.role}
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white">{agent.name}</h2>
                </div>
                <Link
                  href={`/admin/agents/${agent.id}`}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/70 hover:border-[#FF003C]/70 hover:text-white"
                >
                  Edit
                </Link>
              </div>
              <pre className="mt-5 overflow-x-auto rounded-[8px] border border-white/10 bg-black/55 p-4 text-sm leading-6 text-white/72">
                {JSON.stringify(agent.configJson, null, 2)}
              </pre>
            </article>
          ))
        ) : (
          <div className="hidden" />
        )}
      </div>
    </section>
  );
}
