import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8 sm:space-y-12">
      <section className="relative overflow-hidden rounded-[8px] border border-white/10 bg-black">
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

        <div className="relative grid max-w-full min-h-[calc(100svh-8rem)] items-center gap-8 px-4 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26.25rem)] lg:px-12">
          <div className="min-w-0 w-full max-w-[calc(100vw_-_4rem)] sm:max-w-3xl">
            <p className="mb-4 text-[0.68rem] font-black uppercase tracking-[0.1em] text-[#FF003C] sm:text-sm sm:tracking-[0.26em]">
              LS swap planning, wired tight
            </p>
            <h1 className="max-w-full break-words text-[clamp(0.98rem,5.2vw,4rem)] font-black leading-[1.08] text-white [overflow-wrap:anywhere] sm:text-6xl lg:text-7xl">
              PrecisionSwaps.co
            </h1>
            <p className="mt-5 max-w-full text-base leading-7 text-white/78 sm:max-w-2xl sm:text-lg sm:leading-8">
              Build a clean LS swap plan with a specialist agent that captures
              your vehicle, engine status, goals, preferences, and budget range
              before turning it into a shop-ready build ticket.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="flex min-h-11 items-center justify-center rounded-full bg-[#FF003C] px-4 py-3 text-center text-xs font-black uppercase leading-5 tracking-[0.02em] text-white shadow-[0_0_32px_rgba(255,0,60,0.45)] transition hover:bg-[#ff2a59] sm:px-6 sm:text-sm sm:tracking-[0.16em]"
              >
                Start Your LS Swap
              </Link>
              <Link
                href="/login"
                className="flex min-h-11 items-center justify-center rounded-full border border-white/18 px-4 py-3 text-center text-xs font-black uppercase leading-5 tracking-[0.02em] text-white/80 transition hover:border-[#FF003C]/70 hover:text-white sm:px-6 sm:text-sm sm:tracking-[0.16em]"
              >
                Log In
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {["Vehicle intake", "Swap guidance", "Build ticket"].map((item) => (
                <div key={item} className="border-l-2 border-[#FF003C] bg-black/42 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-white/82 sm:text-sm sm:tracking-[0.14em]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="neon-panel relative min-w-0 w-full max-w-[calc(100vw_-_4rem)] overflow-hidden rounded-[8px] p-4 sm:max-w-none sm:p-5">
            <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,0,60,0.20),transparent_44%,rgba(0,210,255,0.16))]" />
            <div className="relative flex min-h-[28rem] flex-col justify-between gap-6 sm:min-h-[32.5rem]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/52">
                  LS Swap Specialist
                </p>
                <h2 className="mt-3 break-words text-2xl font-black text-white sm:text-3xl">
                  Full-body agent staging area
                </h2>
              </div>

              <div className="relative mx-auto aspect-[2/3] h-auto w-[min(68vw,13.75rem)] overflow-hidden rounded-[8px] border border-[#FF003C]/45 bg-black/40 shadow-[0_0_54px_rgba(255,0,60,0.24)]">
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
