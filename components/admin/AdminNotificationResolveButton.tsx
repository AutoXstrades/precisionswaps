"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminNotificationResolveButtonProps = {
  notificationId: string;
  resolved: boolean;
};

export function AdminNotificationResolveButton({
  notificationId,
  resolved,
}: AdminNotificationResolveButtonProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleResolved() {
    setIsSaving(true);
    setError(null);

    const response = await fetch(`/api/admin/notifications/${notificationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolved: !resolved }),
    });
    const data = (await response.json().catch(() => null)) as
      | { error?: string; issues?: Array<{ message?: string }> }
      | null;

    setIsSaving(false);

    if (!response.ok) {
      setError(
        data?.issues?.[0]?.message ??
          data?.error ??
          "Could not update notification.",
      );
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isSaving}
        onClick={toggleResolved}
        className="min-h-11 rounded-full border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/72 transition hover:border-[#FF003C]/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Saving..." : resolved ? "Reopen" : "Resolve"}
      </button>
      {error ? <p className="text-xs font-semibold text-[#FF003C]">{error}</p> : null}
    </div>
  );
}
