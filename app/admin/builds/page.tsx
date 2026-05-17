import Link from "next/link";
import {
  type AdminBuildFilters,
  formatAdminDate,
  formatCurrencyRange,
  listBuildsWithFilters,
  requireAdmin,
} from "@/lib/admin";

type AdminBuildsPageProps = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    goal?: string;
    sort?: string;
  }>;
};

function normalizeFilters(
  searchParams: Awaited<AdminBuildsPageProps["searchParams"]>,
): AdminBuildFilters {
  return {
    search: searchParams.search ?? "",
    status: ["ACTIVE", "COMPLETED", "CANCELLED"].includes(searchParams.status ?? "")
      ? (searchParams.status as AdminBuildFilters["status"])
      : "ALL",
    goal: ["DAILY", "STREET", "DRAG", "SHOW"].includes(searchParams.goal ?? "")
      ? (searchParams.goal as AdminBuildFilters["goal"])
      : "ALL",
    sort: ["newest", "oldest", "updated"].includes(searchParams.sort ?? "")
      ? (searchParams.sort as AdminBuildFilters["sort"])
      : "newest",
  };
}

export default async function AdminBuildsPage({
  searchParams,
}: AdminBuildsPageProps) {
  await requireAdmin();
  const resolvedSearchParams = await searchParams;
  const filters = normalizeFilters(resolvedSearchParams);
  const builds = await listBuildsWithFilters(filters);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
          All builds
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">Admin builds</h1>
      </div>

      <form className="neon-panel grid gap-4 rounded-[8px] p-5 lg:grid-cols-[1fr_180px_180px_180px_auto]">
        <label className="block">
          <span className="text-sm font-semibold text-white/70">Search</span>
          <input
            name="search"
            defaultValue={filters.search}
            placeholder="Email, vehicle, or build ID"
            className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-white/70">Status</span>
          <select
            name="status"
            defaultValue={filters.status}
            className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-white/70">Goal</span>
          <select
            name="goal"
            defaultValue={filters.goal}
            className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          >
            <option value="ALL">All</option>
            <option value="DAILY">Daily</option>
            <option value="STREET">Street</option>
            <option value="DRAG">Drag</option>
            <option value="SHOW">Show</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-white/70">Sort</span>
          <select
            name="sort"
            defaultValue={filters.sort}
            className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="updated">Recently updated</option>
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-full bg-[#FF003C] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white"
          >
            Apply
          </button>
        </div>
      </form>

      <div className="neon-panel overflow-hidden rounded-[8px]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="border-b border-white/10 bg-black/45 text-xs font-black uppercase tracking-[0.16em] text-white/42">
              <tr>
                <th className="px-5 py-4">Vehicle</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Goal</th>
                <th className="px-5 py-4">Estimate</th>
                <th className="px-5 py-4">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {builds.length ? (
                builds.map((build) => (
                  <tr key={build.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/builds/${build.id}`}
                        className="font-black text-white hover:text-[#FF003C]"
                      >
                        {build.vehicleYear} {build.vehicleMake} {build.vehicleModel}
                      </Link>
                      <p className="mt-1 text-xs text-white/38">{build.id}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-white/66">{build.user.email}</td>
                    <td className="px-5 py-4 text-sm font-black text-[#FF003C]">
                      {build.adminMeta.status.toLowerCase()}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-white/72">
                      {build.goal.toLowerCase()}
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-white">
                      {formatCurrencyRange(build.estimateMin, build.estimateMax)}
                    </td>
                    <td className="px-5 py-4 text-sm text-white/50">
                      {formatAdminDate(build.updatedAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-8 text-sm text-white/52" colSpan={6}>
                    No builds match the current filters.
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
