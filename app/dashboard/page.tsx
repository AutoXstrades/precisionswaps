import Link from "next/link";
import { requireCustomer } from "@/lib/customer";
import { prisma } from "@/lib/prisma";

function formatEstimate(min: number | null, max: number | null) {
  if (!min && !max) {
    return "Estimate pending";
  }

  if (min && max) {
    return `$${min.toLocaleString()}-$${max.toLocaleString()}`;
  }

  return `$${(min ?? max)?.toLocaleString()}`;
}

export default async function DashboardPage() {
  const session = await requireCustomer();

  const builds = await prisma.build.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      vehicleYear: true,
      vehicleMake: true,
      vehicleModel: true,
      goal: true,
      estimateMin: true,
      estimateMax: true,
      updatedAt: true,
    },
  });

  return (
    <section>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
            Customer dashboard
          </p>
          <h1 className="mt-3 text-4xl font-black text-white">Your builds</h1>
          <p className="mt-3 max-w-2xl text-white/60">
            Pick up an existing ticket or start a fresh LS swap intake with the
            specialist agent.
          </p>
        </div>
        <Link
          href="/builds/new"
          className="rounded-full bg-[#FF003C] px-5 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-white"
        >
          Start New Build
        </Link>
      </div>

      {builds.length > 0 ? (
        <div className="mt-8 grid gap-4">
          {builds.map((build) => (
            <Link
              key={build.id}
              href={`/builds/${build.id}`}
              className="neon-panel rounded-[8px] p-5 transition hover:border-[#FF003C]/70"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xl font-black text-white">
                    {build.vehicleYear} {build.vehicleMake} {build.vehicleModel}
                  </p>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/50">
                    {build.goal.toLowerCase()} build
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-lg font-black text-[#FF003C]">
                    {formatEstimate(build.estimateMin, build.estimateMax)}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/42">
                    Updated {build.updatedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="neon-panel mt-8 rounded-[8px] p-8">
          <p className="text-2xl font-black text-white">No builds saved yet</p>
          <p className="mt-3 max-w-2xl leading-7 text-white/62">
            Start a new build to capture the vehicle, drivetrain status, goals,
            preferences, and first estimate range.
          </p>
          <Link
            href="/builds/new"
            className="mt-6 inline-flex rounded-full border border-[#FF003C]/70 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white"
          >
            Start New Build
          </Link>
        </div>
      )}
    </section>
  );
}
