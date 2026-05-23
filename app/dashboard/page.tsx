import Link from "next/link";
import { getLatestMainVehiclePhoto } from "@/lib/build-photos";
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
      agentLogs: {
        where: {
          content: {
            contains: "build_photo_metadata",
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
        select: {
          content: true,
          createdAt: true,
        },
      },
    },
  });

  return (
    <section>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF003C] sm:text-sm sm:tracking-[0.22em]">
            Customer dashboard
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">Your builds</h1>
          <p className="mt-3 max-w-2xl text-white/60">
            Pick up an existing ticket or start a fresh LS swap intake with the
            specialist agent.
          </p>
        </div>
        <Link
          href="/builds/new"
          className="flex min-h-11 w-full items-center justify-center rounded-full bg-[#FF003C] px-5 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white sm:w-auto sm:tracking-[0.16em]"
        >
          Start New Build
        </Link>
      </div>

      {builds.length > 0 ? (
        <div className="mt-8 grid gap-4">
          {builds.map((build) => {
            const mainPhoto = getLatestMainVehiclePhoto(build.agentLogs);

            return (
              <Link
                key={build.id}
                href={`/builds/${build.id}`}
                className="neon-panel group relative overflow-hidden rounded-[8px] p-5 transition hover:border-[#FF003C]/70"
              >
                <div className="flex min-h-36 flex-col gap-4 pr-0 sm:flex-row sm:items-start sm:justify-between sm:pr-40">
                  <div>
                    <p className="break-words text-xl font-black text-white">
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

                <div className="mt-4 h-28 overflow-hidden rounded-[8px] border border-white/10 bg-black/45 sm:absolute sm:bottom-5 sm:right-5 sm:mt-0 sm:h-28 sm:w-36">
                  {mainPhoto ? (
                    <img
                      src={mainPhoto.dataUrl}
                      alt={`${build.vehicleYear} ${build.vehicleMake} ${build.vehicleModel}`}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs font-black uppercase tracking-[0.12em] text-white/28">
                      Main photo
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
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
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#FF003C]/70 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white sm:w-auto sm:tracking-[0.16em]"
          >
            Start New Build
          </Link>
        </div>
      )}
    </section>
  );
}