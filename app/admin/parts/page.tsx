import { UniversalPartApprovalButton } from "@/components/admin/UniversalPartApprovalButton";
import { requireAdmin } from "@/lib/admin";
import { auditUniversalPartsForNotifications, listUniversalPartGroups } from "@/lib/universal-parts";

export default async function AdminUniversalPartsPage() {
  await requireAdmin();
  const [groups, audit] = await Promise.all([
    listUniversalPartGroups(),
    auditUniversalPartsForNotifications(),
  ]);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
          Parts workflow
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">Universal parts</h1>
        <p className="mt-4 max-w-2xl leading-7 text-white/68">
          Universal parts are not tied to a specific vehicle. The agent can
          mention approved parts, but pending items stay blocked until an admin
          approves them.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="neon-panel rounded-[8px] p-5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-white/45">
            Pending approvals
          </p>
          <p className="mt-3 text-4xl font-black text-white">
            {audit.pendingPartCount}
          </p>
        </div>
        <div className="neon-panel rounded-[8px] p-5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-white/45">
            Empty groups
          </p>
          <p className="mt-3 text-4xl font-black text-white">
            {audit.emptyGroupCount}
          </p>
        </div>
      </div>

      <div className="grid gap-5">
        {groups.map((group) => (
          <article key={group.id} className="neon-panel rounded-[8px] p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF003C]">
                  Universal group
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">{group.name}</h2>
              </div>
              <p className="text-sm font-bold text-white/52">
                {group.parts.length} part{group.parts.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead className="border-b border-white/10 text-xs font-black uppercase tracking-[0.14em] text-white/42">
                  <tr>
                    <th className="py-3 pr-4">Part</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="py-3 pl-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {group.parts.length ? (
                    group.parts.map((part) => (
                      <tr key={part.id}>
                        <td className="py-4 pr-4 font-black text-white">{part.name}</td>
                        <td className="px-4 py-4 text-sm leading-6 text-white/62">
                          {part.description ?? "No description yet."}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.1em] ${
                              part.approved
                                ? "bg-emerald-400/12 text-emerald-200"
                                : "bg-[#FF003C]/15 text-[#FF8AA0]"
                            }`}
                          >
                            {part.status}
                          </span>
                        </td>
                        <td className="py-4 pl-4">
                          <UniversalPartApprovalButton
                            partId={part.id}
                            approved={part.approved}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-6 text-sm text-white/52" colSpan={4}>
                        This group is empty. Add parts through seed data or a
                        future admin create flow.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
