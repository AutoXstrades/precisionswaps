"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type UniversalPartApprovalButtonProps = {
  partId: string;
  approved: boolean;
};

export function UniversalPartApprovalButton({
  partId,
  approved,
}: UniversalPartApprovalButtonProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleApproval() {
    setIsSaving(true);
    setError(null);

    const response = await fetch(`/api/admin/parts/${partId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: !approved }),
    });
    const data = (await response.json().catch(() => null)) as
      | { error?: string; issues?: Array<{ message?: string }> }
      | null;

    setIsSaving(false);

    if (!response.ok) {
      setError(data?.issues?.[0]?.message ?? data?.error ?? "Could not update part.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isSaving}
        onClick={toggleApproval}
        className="min-h-11 rounded-full border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/72 transition hover:border-[#FF003C]/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Saving..." : approved ? "Mark Pending" : "Approve"}
      </button>
      {error ? <p className="text-xs font-semibold text-[#FF003C]">{error}</p> : null}
    </div>
  );
}
