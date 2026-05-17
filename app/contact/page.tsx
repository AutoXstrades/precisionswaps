import Link from "next/link";
import { shopContact } from "@/lib/business-info";

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
          Contact information
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">
          Talk with Last Stop Swaps
        </h1>
        <p className="mt-4 leading-7 text-white/68">
          Use the build intake to prepare your vehicle details before calling,
          or contact the shop directly for scheduling and pickup questions.
        </p>
      </div>

      <div className="neon-panel rounded-[8px] p-6">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.18em] text-white/42">
              Shop
            </dt>
            <dd className="mt-2 text-xl font-black text-white">
              {shopContact.name} - {shopContact.poweredBy}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.18em] text-white/42">
              Phone
            </dt>
            <dd className="mt-2 text-xl font-black text-[#FF003C]">
              {shopContact.phone}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-black uppercase tracking-[0.18em] text-white/42">
              Address
            </dt>
            <dd className="mt-2 text-xl font-black text-white">
              {shopContact.address} | {shopContact.cityState}
            </dd>
          </div>
        </dl>
        <Link
          href="/pricing"
          className="mt-8 inline-flex rounded-full border border-[#FF003C]/70 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white"
        >
          View pricing
        </Link>
      </div>
    </section>
  );
}
