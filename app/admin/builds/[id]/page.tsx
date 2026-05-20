import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminBuildManagementForm } from "@/components/admin/AdminBuildManagementForm";
import { AdminCustomerLogPanel } from "@/components/admin/AdminCustomerLogPanel";
import {
  formatAdminDate,
  formatCurrencyRange,
  getBuildForAdmin,
  requireAdmin,
} from "@/lib/admin";
import { listCustomerLogsForAdmin } from "@/lib/customer-logs";

type AdminBuildDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminBuildDetailPage({
  params,
}: AdminBuildDetailPageProps) {
  await requireAdmin();
  const { id } = await params;
  const build = await getBuildForAdmin(id);

  if (!build) {
    notFound();
  }

  const customerLogs = await listCustomerLogsForAdmin(build.id);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
            Build detail
          </p>
          <h1 className="mt-3 text-4xl font-black text-white">
            {build.vehicleYear} {build.vehicleMake} {build.vehicleModel}
          </h1>
          <p className="mt-3 text-white/58">{build.user.email}</p>
        </div>
        <Link
          href="/admin/builds"
          className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-white/70 hover:border-[#FF003C]/70 hover:text-white"
        >
          All Builds
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.76fr_1fr]">
        <div className="space-y-5">
          <div className="neon-panel rounded-[8px] p-5">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-white/45">
              Read-only customer data
            </p>
            <dl className="mt-5 space-y-4">
              {[
                ["Customer", build.user.email],
                ["Vehicle year", build.vehicleYear],
                ["Vehicle make", build.vehicleMake],
                ["Vehicle model", build.vehicleModel],
                ["Engine/trans status", build.engineStatus],
                ["Goal", build.goal.toLowerCase()],
                ["Current estimate", formatCurrencyRange(build.estimateMin, build.estimateMax)],
                ["Admin status", build.adminMeta.status.toLowerCase()],
                ["Created", formatAdminDate(build.createdAt)],
                ["Updated", formatAdminDate(build.updatedAt)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-black uppercase tracking-[0.16em] text-white/38">
                    {label}
                  </dt>
                  <dd className="mt-1 text-base font-bold text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <AdminBuildManagementForm
            buildId={build.id}
            initialStatus={build.adminMeta.status}
            initialEstimateMin={build.estimateMin}
            initialEstimateMax={build.estimateMax}
            initialInternalNotes={build.adminMeta.internalNotes}
          />

          <AdminCustomerLogPanel buildId={build.id} initialLogs={customerLogs} />
        </div>

        <div className="space-y-5">
          <div className="neon-panel rounded-[8px] p-5">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
              AI summary
            </p>
            <pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-7 text-white/72">
              {build.aiSummary ?? "No AI summary saved yet."}
            </pre>
            {build.notes ? (
              <div className="mt-6 rounded-[8px] border border-white/10 bg-black/45 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/42">
                  Customer notes
                </p>
                <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-white/64">
                  {build.notes}
                </pre>
              </div>
            ) : null}
            {build.adminMeta.internalNotes ? (
              <div className="mt-6 rounded-[8px] border border-[#FF003C]/30 bg-[#FF003C]/10 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF003C]">
                  Internal admin notes
                </p>
                <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-white/74">
                  {build.adminMeta.internalNotes}
                </pre>
              </div>
            ) : null}
          </div>

          <div className="neon-panel rounded-[8px] p-5">
            <h2 className="text-xl font-black text-white">Recent agent logs</h2>
            <div className="mt-5 space-y-3">
              {build.agentLogs.length ? (
                build.agentLogs.map((log) => (
                  <div key={log.id} className="rounded-[8px] border border-white/10 bg-black/40 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF003C]">
                      {log.role} | {formatAdminDate(log.createdAt)}
                    </p>
                    <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/66">
                      {log.content}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/52">No agent logs for this build yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
