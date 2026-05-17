import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="relative min-h-[76vh] overflow-hidden rounded-[8px] border border-white/10 bg-black">
        <Image
          src="/images/background-engine.jpeg"
          alt="LS engine bay"
          fill
          priority
          className="object-cover opacity-45"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.78)_46%,rgba(0,0,0,0.42)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#050509] to-transparent" />

        <div className="relative grid min-h-[76vh] items-center gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_420px] lg:px-12">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.26em] text-[#FF003C]">
              LS swap planning, wired tight
            </p>
            <h1 className="text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
              PrecisionSwaps.co
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/78">
              Build a clean LS swap plan with a specialist agent that captures
              your vehicle, engine status, goals, preferences, and budget range
              before turning it into a shop-ready build ticket.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-[#FF003C] px-6 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_0_32px_rgba(255,0,60,0.45)] transition hover:bg-[#ff2a59]"
              >
                Start Your LS Swap
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/18 px-6 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-white/80 transition hover:border-[#FF003C]/70 hover:text-white"
              >
                Log In
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {["Vehicle intake", "Swap guidance", "Build ticket"].map((item) => (
                <div key={item} className="border-l-2 border-[#FF003C] bg-black/42 px-4 py-3">
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-white/82">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="neon-panel relative min-h-[560px] overflow-hidden rounded-[8px] p-5">
            <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,0,60,0.20),transparent_44%,rgba(0,210,255,0.16))]" />
            <div className="relative flex min-h-[520px] flex-col justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/52">
                  LS Swap Specialist
                </p>
                <h2 className="mt-3 text-3xl font-black text-white">
                  Full-body agent staging area
                </h2>
              </div>

              <div className="relative mx-auto h-[330px] w-[220px] overflow-hidden rounded-[8px] border border-[#FF003C]/45 bg-black/40 shadow-[0_0_54px_rgba(255,0,60,0.24)]">
                <Image
                  src="/images/ai-agent-avatar.jpeg"
                  alt="AI LS Swap Specialist avatar"
                  fill
                  className="object-cover object-top"
                  sizes="220px"
                />
              </div>

              <div className="rounded-[8px] border border-white/10 bg-black/65 p-4">
                <p className="text-sm font-semibold leading-6 text-white/78">
                  Tell me the vehicle, what drivetrain parts you already have,
                  and whether the goal is daily, street, drag, or show. I will
                  shape the first build ticket from there.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          ["Engine swap labor", "LS, LT, cammed, forced-induction, and harness planning."],
          ["Parts readiness", "Capture what is on hand and what still needs sourcing."],
          ["Owner visibility", "Build tickets and AI notes are ready for the back office."],
        ].map(([title, copy]) => (
          <div key={title} className="neon-panel rounded-[8px] p-5">
            <p className="text-lg font-black text-white">{title}</p>
            <p className="mt-3 text-sm leading-6 text-white/62">{copy}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
