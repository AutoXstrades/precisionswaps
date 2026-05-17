"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="neon-panel rounded-[8px] p-6">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
        Something went wrong
      </p>
      <h1 className="mt-3 text-3xl font-black text-white">The page could not load.</h1>
      <p className="mt-4 max-w-2xl leading-7 text-white/62">
        Check the database connection and environment variables, then try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-[#FF003C] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white"
      >
        Try Again
      </button>
    </div>
  );
}
