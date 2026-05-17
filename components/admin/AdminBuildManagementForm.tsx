"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AdminBuildManagementFormProps = {
  buildId: string;
  initialStatus: "ACTIVE" | "COMPLETED" | "CANCELLED";
  initialEstimateMin: number | null;
  initialEstimateMax: number | null;
  initialInternalNotes: string;
};

export function AdminBuildManagementForm({
  buildId,
  initialStatus,
  initialEstimateMin,
  initialEstimateMax,
  initialInternalNotes,
}: AdminBuildManagementFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/builds/${buildId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: formData.get("status"),
        estimate_min: formData.get("estimate_min") || null,
        estimate_max: formData.get("estimate_max") || null,
        internal_notes: formData.get("internal_notes") || "",
      }),
    });
    const data = (await response.json().catch(() => null)) as
      | { error?: string; issues?: Array<{ message: string }> }
      | null;

    setIsSaving(false);

    if (!response.ok) {
      setError(data?.issues?.[0]?.message ?? data?.error ?? "Could not save admin changes.");
      return;
    }

    setSuccess("Admin changes saved.");
    router.refresh();
  }

  return (
    <form className="neon-panel rounded-[8px] p-5" onSubmit={handleSubmit}>
      <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
        Admin controls
      </p>

      {success ? (
        <div className="mt-5 rounded-[8px] border border-emerald-400/40 bg-emerald-400/10 p-3 text-sm font-semibold text-white">
          {success}
        </div>
      ) : null}
      {error ? (
        <div className="mt-5 rounded-[8px] border border-[#FF003C]/50 bg-[#FF003C]/10 p-3 text-sm font-semibold text-white">
          {error}
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-semibold text-white/70">Status</span>
          <select
            name="status"
            required
            defaultValue={initialStatus}
            className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          >
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-white/70">Estimate min</span>
          <input
            name="estimate_min"
            type="number"
            min="0"
            defaultValue={initialEstimateMin ?? ""}
            className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-white/70">Estimate max</span>
          <input
            name="estimate_max"
            type="number"
            min="0"
            defaultValue={initialEstimateMax ?? ""}
            className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-white/70">Internal notes</span>
        <textarea
          name="internal_notes"
          defaultValue={initialInternalNotes}
          className="mt-2 min-h-36 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          placeholder="Admin-only notes, approvals, revised estimate context..."
        />
      </label>

      <button
        type="submit"
        disabled={isSaving}
        className="mt-5 rounded-full bg-[#FF003C] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
