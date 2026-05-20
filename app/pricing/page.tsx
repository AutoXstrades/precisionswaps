import Image from "next/image";
import Link from "next/link";
import {
  cleanupServices,
  pricingTiers,
  shopPolicies,
} from "@/lib/business-info";

export default function PricingPage() {
  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF003C] sm:text-sm sm:tracking-[0.22em]">
            Pricing overview
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            Engine swap, performance, and wiring
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-white/68">
            Full shop price list from PrecisionSwaps.co powered by Last Stop
            Swaps. Mechanical issues are billed separately and final totals
            depend on parts readiness, wiring condition, and vehicle-specific
            fitment needs.
          </p>
        </div>

        <div className="relative aspect-[1005/602] overflow-hidden rounded-[8px] border border-[#FF003C]/30 bg-black shadow-[0_0_42px_rgba(255,0,60,0.18)]">
          <Image
            src="/images/precisionswaps-logo.jpeg"
            alt="PrecisionSwaps.co red engine logo"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {pricingTiers.map((tier) => (
          <article key={tier.label} className="neon-panel rounded-[8px] p-5">
            <h2 className="text-xl font-black text-white">{tier.label}</h2>
            <p className="mt-4 text-3xl font-black text-[#FF003C]">{tier.price}</p>
            <p className="mt-3 text-sm leading-6 text-white/58">{tier.note}</p>
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

      <div className="neon-panel overflow-hidden rounded-[8px]">
        <div className="relative aspect-[1024/1536] w-full bg-black sm:aspect-[4/5] lg:aspect-[1024/1536]">
          <Image
            src="/images/precisionswaps-pricing.png"
            alt="Full PrecisionSwaps.co price list"
            fill
            className="object-contain"
            sizes="100vw"
          />
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
