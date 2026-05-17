export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
          Privacy statement
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">
          Customer data disclosure
        </h1>
      </div>

      <div className="neon-panel rounded-[8px] p-6 leading-7 text-white/68">
        <p>
          PrecisionSwaps.co collects account details, vehicle information,
          build preferences, estimate ranges, and AI-generated build summaries
          so customers can save build tickets and the owner can manage shop
          workflow.
        </p>
        <p className="mt-4">
          Passwords are stored as hashes. OpenAI requests are made server-side.
          This app does not connect to CBTuner backend services, databases, or
          APIs.
        </p>
        <p className="mt-4">
          A full legal privacy policy should be reviewed before public launch.
          This placeholder documents the current intended data use.
        </p>
      </div>
    </section>
  );
}
