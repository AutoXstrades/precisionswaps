export default function Loading() {
  return (
    <div className="neon-panel rounded-[8px] p-6">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
        Loading
      </p>
      <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/3 rounded-full bg-[#FF003C] shadow-[0_0_24px_rgba(255,0,60,0.6)]" />
      </div>
    </div>
  );
}
