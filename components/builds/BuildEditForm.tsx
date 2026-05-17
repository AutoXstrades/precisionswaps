"use client";

import type { BuildGoal } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type EditableBuild = {
  id: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  engineStatus: string;
  goal: BuildGoal;
  notes: string | null;
  estimateMin: number | null;
  estimateMax: number | null;
};

type BuildEditFormProps = {
  build: EditableBuild;
};

const goalOptions: Array<{ label: string; value: BuildGoal }> = [
  { label: "Daily", value: "DAILY" },
  { label: "Street", value: "STREET" },
  { label: "Drag", value: "DRAG" },
  { label: "Show", value: "SHOW" },
];

export function BuildEditForm({ build }: BuildEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/builds/${build.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicle_year: formData.get("vehicle_year"),
        vehicle_make: formData.get("vehicle_make"),
        vehicle_model: formData.get("vehicle_model"),
        engine_status: formData.get("engine_status"),
        goal: formData.get("goal"),
        notes: formData.get("notes"),
        estimate_min: formData.get("estimate_min") || null,
        estimate_max: formData.get("estimate_max") || null,
      }),
    });
    const data = (await response.json().catch(() => null)) as
      | { error?: string; issues?: Array<{ message: string }> }
      | null;

    setIsSaving(false);

    if (!response.ok) {
      setError(data?.issues?.[0]?.message ?? data?.error ?? "Could not update build.");
      return;
    }

    router.push(`/builds/${build.id}`);
    router.refresh();
  }

  return (
    <form className="neon-panel rounded-[8px] p-6" onSubmit={handleSubmit}>
      {error ? (
        <div className="mb-5 rounded-[8px] border border-[#FF003C]/50 bg-[#FF003C]/10 p-3 text-sm font-semibold text-white">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-semibold text-white/70">Vehicle year</span>
          <input
            name="vehicle_year"
            type="number"
            min="1900"
            max="2100"
            required
            defaultValue={build.vehicleYear}
            className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-white/70">Vehicle make</span>
          <input
            name="vehicle_make"
            required
            defaultValue={build.vehicleMake}
            className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-white/70">Vehicle model</span>
          <input
            name="vehicle_model"
            required
            defaultValue={build.vehicleModel}
            className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-white/70">Engine status</span>
          <input
            name="engine_status"
            required
            defaultValue={build.engineStatus}
            className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-white/70">Goal</span>
          <select
            name="goal"
            required
            defaultValue={build.goal}
            className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          >
            {goalOptions.map((goal) => (
              <option key={goal.value} value={goal.value}>
                {goal.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-white/70">Estimate min</span>
          <input
            name="estimate_min"
            type="number"
            min="0"
            defaultValue={build.estimateMin ?? ""}
            className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-white/70">Estimate max</span>
          <input
            name="estimate_max"
            type="number"
            min="0"
            defaultValue={build.estimateMax ?? ""}
            className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-white/70">Notes</span>
        <textarea
          name="notes"
          defaultValue={build.notes ?? ""}
          className="mt-2 min-h-40 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
        />
      </label>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-[#FF003C] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Build"}
        </button>
        <Link
          href={`/builds/${build.id}`}
          className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-white/70 hover:border-[#FF003C]/70 hover:text-white"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
