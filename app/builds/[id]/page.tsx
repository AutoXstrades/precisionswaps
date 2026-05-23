import Link from "next/link";
import { notFound } from "next/navigation";
import { MySwapPartsListButton } from "@/components/parts/PlatformPartsCatalog";
import { requireCustomer } from "@/lib/customer";
import { prisma } from "@/lib/prisma";

type BuildPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatEstimate(min: number | null, max: number | null) {
  if (!min && !max) {
    return "Estimate pending";
  }

  if (min && max) {
    return `$${min.toLocaleString()}-$${max.toLocaleString()}`;
  }

  return `$${(min ?? max)?.toLocaleString()}`;
}

export default async function BuildPage({ params }: BuildPageProps) {
  const { id } = await params;
  const session = await requireCustomer();

  const build = await prisma.build.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    select: {
      vehicleYear: true,
      vehicleMake: true,
      vehicleModel: true,
      engineStatus: true,
      goal: true,
      notes: true,
      aiSummary: true,
      estimateMin: true,
      estimateMax: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!build) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
            Build ticket
          </p>
          <h1 className="mt-3 text-4xl font-black text-white">
            {build.vehicleYear} {build.vehicleMake} {build.vehicleModel}
          </h1>
          <p className="mt-3 text-white/58">
            Updated {build.updatedAt.toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/builds/${id}/edit`}
            className="rounded-full bg-[#FF003C] px-5 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-white"
          >
            Edit Build
          </Link>
          <MySwapPartsListButton />
          <Link
            href="/dashboard"
            className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-white/70 hover:border-[#FF003C]/70 hover:text-white"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.7fr_1fr]">
        <div className="neon-panel rounded-[8px] p-5">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-white/48">
            Snapshot
          </p>
          <dl className="mt-5 space-y-4">
            {[
              ["Engine/trans status", build.engineStatus],
              ["Goal", build.goal.toLowerCase()],
              ["Estimate", formatEstimate(build.estimateMin, build.estimateMax)],
              ["Created", build.createdAt.toLocaleDateString()],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-black uppercase tracking-[0.16em] text-white/38">
                  {label}
                </dt>
                <dd className="mt-1 text-lg font-bold text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="neon-panel rounded-[8px] p-5">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
            AI-generated summary
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
        </div>
      </div>
    </section>
  );
}
