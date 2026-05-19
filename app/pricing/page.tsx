import Link from "next/link";
import {
  cleanupServices,
  pricingTiers,
  shopPolicies,
} from "@/lib/business-info";

export default function PricingPage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF003C] sm:text-sm sm:tracking-[0.22em]">
          Pricing overview
        </p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
          Swap pricing and build range
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-white/68">
          Core labor ranges for LS and LT swap planning. Final totals depend on
          parts condition, wiring complexity, drivetrain status, sourcing, and
          vehicle-specific fitment needs.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {pricingTiers.map((tier) => (
          <article key={tier.label} className="neon-panel rounded-[8px] p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-white/45">
              Swap tier
            </p>
            <h2 className="mt-3 text-2xl font-black text-white">{tier.label}</h2>
            <p className="mt-4 text-3xl font-black text-[#FF003C]">{tier.price}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="neon-panel rounded-[8px] p-5">
          <h2 className="text-2xl font-black text-white">Cleanup services</h2>
          <div className="mt-5 space-y-3">
            {cleanupServices.map((service) => (
              <div
                key={service.label}
                className="flex items-center justify-between gap-4 border-b border-white/10 pb-3"
              >
                <span className="min-w-0 break-words font-bold text-white/75">{service.label}</span>
                <span className="font-black text-[#FF003C]">{service.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="neon-panel rounded-[8px] p-5">
          <h2 className="text-2xl font-black text-white">Shop policies</h2>
          <ul className="mt-5 grid gap-3 text-sm leading-6 text-white/68">
            {shopPolicies.map((policy) => (
              <li key={policy} className="border-l-2 border-[#FF003C] pl-3">
                {policy}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="neon-panel rounded-[8px] p-6">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF003C] sm:text-sm sm:tracking-[0.22em]">
          Typical total build range
        </p>
        <p className="mt-3 text-3xl font-black text-white sm:text-4xl">$7,500-$10,000</p>
        <p className="mt-3 max-w-2xl leading-7 text-white/62">
          Target completion window is 30 days once required parts, deposit, and
          vehicle access are ready.
        </p>
        <Link
          href="/build"
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#FF003C] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white sm:w-auto sm:tracking-[0.16em]"
        >
          Start build intake
        </Link>
      </div>
    </section>
  );
}
