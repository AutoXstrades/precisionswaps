import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          builds: true,
          agentLogs: true,
        },
      },
    },
  });

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
          User management
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">Admin users</h1>
        <p className="mt-4 max-w-2xl leading-7 text-white/68">
          Review customer and admin accounts without exposing password hashes or
          private auth metadata.
        </p>
      </div>

      <div className="neon-panel overflow-hidden rounded-[8px]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="border-b border-white/10 bg-black/45 text-xs font-black uppercase tracking-[0.16em] text-white/42">
              <tr>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Builds</th>
                <th className="px-5 py-4">AI logs</th>
                <th className="px-5 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.length ? (
                users.map((user) => (
                  <tr key={user.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-5 py-4 font-black text-white">{user.email}</td>
                    <td className="px-5 py-4 text-sm font-black text-[#FF003C]">
                      {user.role.toLowerCase()}
                    </td>
                    <td className="px-5 py-4 text-sm text-white/66">
                      {user._count.builds}
                    </td>
                    <td className="px-5 py-4 text-sm text-white/66">
                      {user._count.agentLogs}
                    </td>
                    <td className="px-5 py-4 text-sm text-white/50">
                      {user.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-8 text-sm text-white/52" colSpan={5}>
                    No users found. Run the Prisma seed to create the first
                    admin account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
