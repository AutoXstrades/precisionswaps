import { PlatformPartsCatalog } from "@/components/parts/PlatformPartsCatalog";

export default function PartsPage() {
  return (
    <section className="space-y-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF003C] sm:text-sm sm:tracking-[0.22em]">
          Completed swap platforms
        </p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
          Platform Parts Lists
        </h1>
        <p className="mt-4 leading-7 text-white/66">
          Browse PrecisionSwaps.co platform parts lists by vehicle. Open a
          platform to view the first page of its parts list, then download the
          original PDF when you are ready.
        </p>
      </div>

      <PlatformPartsCatalog />
    </section>
  );
}
