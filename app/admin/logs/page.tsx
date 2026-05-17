import Link from "next/link";
import { formatAdminDate, requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminLogsPage() {
  await requireAdmin();

  const logs = await prisma.agentLog.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { email: true },
      },
      build: {
        select: {
          id: true,
          vehicleYear: true,
          vehicleMake: true,
          vehicleModel: true,
        },
      },
    },
  });

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
          AI logs
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">Agent activity</h1>
      </div>

      <div className="grid gap-4">
        {logs.length ? (
          logs.map((log) => (
            <article key={log.id} className="neon-panel rounded-[8px] p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF003C]">
                  {log.role}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/38">
                  {formatAdminDate(log.createdAt)}
                </p>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/66">
                {log.content}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/38">
                <span>{log.user?.email ?? "System"}</span>
                {log.build ? (
                  <Link href={`/admin/builds/${log.build.id}`} className="text-[#FF003C]">
                    {log.build.vehicleYear} {log.build.vehicleMake} {log.build.vehicleModel}
                  </Link>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <div className="neon-panel rounded-[8px] p-6">
            <p className="text-white/62">No agent logs have been written yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
