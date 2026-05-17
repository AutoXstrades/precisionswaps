import { shopPolicies, warrantySummary } from "@/lib/business-info";

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
          Terms and warranty summary
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">
          Service agreement basics
        </h1>
        <p className="mt-4 leading-7 text-white/68">
          This page summarizes key service terms for planning purposes. Final
          written agreements, invoices, and approved work orders control the
          actual service relationship.
        </p>
      </div>

      <div className="neon-panel rounded-[8px] p-6">
        <h2 className="text-2xl font-black text-white">Shop policies</h2>
        <ul className="mt-5 grid gap-3 text-sm leading-6 text-white/68">
          {shopPolicies.map((policy) => (
            <li key={policy} className="border-l-2 border-[#FF003C] pl-3">
              {policy}
            </li>
          ))}
        </ul>
      </div>

      <div className="neon-panel rounded-[8px] p-6">
        <h2 className="text-2xl font-black text-white">Warranty</h2>
        <p className="mt-4 leading-7 text-white/68">{warrantySummary}</p>
      </div>
    </section>
  );
}
