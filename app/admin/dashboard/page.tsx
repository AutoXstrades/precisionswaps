import Link from "next/link";
import { formatAdminDate, requireAdmin } from "@/lib/admin";
import { countUnresolvedAdminNotifications } from "@/lib/admin-notifications";
import { prisma } from "@/lib/prisma";
import { countPendingUniversalParts } from "@/lib/universal-parts";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [
    totalUsers,
    totalBuilds,
    totalLogs,
    unresolvedNotifications,
    universalPartsPending,
    recentBuilds,
    recentLogs,
  ] =
    await Promise.all([
      prisma.user.count(),
      prisma.build.count(),
      prisma.agentLog.count(),
      countUnresolvedAdminNotifications(),
      countPendingUniversalParts(),
      prisma.build.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { email: true },
          },
        },
      }),
      prisma.agentLog.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { email: true },
          },
        },
      }),
    ]);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
          Owner dashboard
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">Back office</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {[
          ["Users", totalUsers],
          ["Builds", totalBuilds],
          ["AI logs", totalLogs],
          ["Open alerts", unresolvedNotifications],
          ["Pending parts", universalPartsPending],
        ].map(([label, value]) => (
          <div key={label} className="neon-panel rounded-[8px] p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-white/45">
              {label}
            </p>
            <p className="mt-3 text-4xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/parts"
          className="neon-panel rounded-[8px] p-5 transition hover:border-[#FF003C]/60"
        >
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF003C]">
            Universal parts
          </p>
          <p className="mt-3 text-sm leading-6 text-white/62">
            Review universal part groups, approval badges, and pending items
            before any customer-facing workflow uses them.
          </p>
        </Link>
        <Link
          href="/admin/notifications"
          className="neon-panel rounded-[8px] p-5 transition hover:border-[#FF003C]/60"
        >
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF003C]">
            Notifications
          </p>
          <p className="mt-3 text-sm leading-6 text-white/62">
            Resolve part approval alerts, empty group warnings, and future
            push-to-customer workflow issues.
          </p>
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="neon-panel rounded-[8px] p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-white">Recent builds</h2>
            <Link href="/admin/builds" className="text-sm font-bold text-[#FF003C]">
              View all
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {recentBuilds.length ? (
              recentBuilds.map((build) => (
                <Link
                  key={build.id}
                  href={`/admin/builds/${build.id}`}
                  className="block rounded-[8px] border border-white/10 bg-black/40 p-4 transition hover:border-[#FF003C]/60"
                >
                  <p className="font-black text-white">
                    {build.vehicleYear} {build.vehicleMake} {build.vehicleModel}
                  </p>
                  <p className="mt-2 text-sm text-white/52">
                    {build.user.email} | {formatAdminDate(build.createdAt)}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-white/52">No builds yet.</p>
            )}
          </div>
        </div>

        <div className="neon-panel rounded-[8px] p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-white">Recent AI activity</h2>
            <Link href="/admin/logs" className="text-sm font-bold text-[#FF003C]">
              View logs
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {recentLogs.length ? (
              recentLogs.map((log) => (
                <div key={log.id} className="rounded-[8px] border border-white/10 bg-black/40 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF003C]">
                    {log.role}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/66">
                    {log.content}
                  </p>
                  <p className="mt-2 text-xs text-white/38">
                    {log.user?.email ?? "System"} | {formatAdminDate(log.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/52">No AI activity yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
