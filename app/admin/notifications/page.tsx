import { AdminNotificationResolveButton } from "@/components/admin/AdminNotificationResolveButton";
import { formatAdminDate, requireAdmin } from "@/lib/admin";
import { listAdminNotifications } from "@/lib/admin-notifications";

export default async function AdminNotificationsPage() {
  await requireAdmin();
  const notifications = await listAdminNotifications();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
          Admin alerts
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">Notifications</h1>
        <p className="mt-4 max-w-2xl leading-7 text-white/68">
          Review parts workflow alerts, failed push events, missing data, and
          vehicle requests. Resolved items stay available for audit history.
        </p>
      </div>

      <div className="grid gap-4">
        {notifications.length ? (
          notifications.map((notification) => (
            <article key={notification.id} className="neon-panel rounded-[8px] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[#FF003C]/15 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#FF8AA0]">
                      {notification.type}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${
                        notification.resolved
                          ? "bg-emerald-400/12 text-emerald-200"
                          : "bg-white/10 text-white/70"
                      }`}
                    >
                      {notification.resolved ? "Resolved" : "Open"}
                    </span>
                    <span className="text-xs font-semibold text-white/40">
                      {formatAdminDate(notification.createdAt)}
                    </span>
                  </div>
                  <h2 className="mt-4 text-xl font-black text-white">
                    {notification.message}
                  </h2>
                  {notification.metadata ? (
                    <pre className="mt-4 max-h-64 overflow-auto rounded-[8px] border border-white/10 bg-black/45 p-4 text-xs leading-5 text-white/62">
                      {JSON.stringify(notification.metadata, null, 2)}
                    </pre>
                  ) : null}
                </div>
                <AdminNotificationResolveButton
                  notificationId={notification.id}
                  resolved={notification.resolved}
                />
              </div>
            </article>
          ))
        ) : (
          <div className="neon-panel rounded-[8px] p-6 text-sm text-white/52">
            No admin notifications yet.
          </div>
        )}
      </div>
    </section>
  );
}
