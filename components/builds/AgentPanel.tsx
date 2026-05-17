"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type BuildGoal = "DAILY" | "STREET" | "DRAG" | "SHOW";

type IntakeState = {
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  engineStatus: string;
  goal?: BuildGoal;
  preferences: string[];
  notes: string;
};

type SpecialistResult = {
  nextQuestion: string;
  explanation: string;
  summary: string;
  estimateMin: number;
  estimateMax: number;
  buildId?: string;
};

const engineOptions = [
  "I have engine and transmission",
  "I have the engine only",
  "I need engine and transmission sourced",
  "Not sure yet",
];

const goalOptions: Array<{ label: string; value: BuildGoal }> = [
  { label: "Daily", value: "DAILY" },
  { label: "Street", value: "STREET" },
  { label: "Drag", value: "DRAG" },
  { label: "Show", value: "SHOW" },
];

const preferenceOptions = [
  "LS preferred",
  "LT preferred",
  "Cammed setup",
  "Boost ready",
  "Keep it simple",
  "Budget conscious",
];

function formatEstimate(min?: number, max?: number) {
  if (!min || !max) {
    return "Estimate pending";
  }

  return `$${min.toLocaleString()}-$${max.toLocaleString()}`;
}

export function AgentPanel() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [intake, setIntake] = useState<IntakeState>({
    vehicleYear: "",
    vehicleMake: "",
    vehicleModel: "",
    engineStatus: "",
    preferences: [],
    notes: "",
  });
  const [result, setResult] = useState<SpecialistResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const speech =
    result?.nextQuestion ??
    [
      "What year, make, and model are we swapping?",
      "Do you already have the engine and transmission, or do they need to be sourced?",
      "What is the main goal for the build?",
      "Lock in the major preferences so I can shape the first ticket.",
      "Review the build ticket and save it when it looks right.",
    ][step];

  function updateIntake(next: Partial<IntakeState>) {
    setIntake((current) => ({ ...current, ...next }));
    setError(null);
  }

  function togglePreference(preference: string) {
    setIntake((current) => ({
      ...current,
      preferences: current.preferences.includes(preference)
        ? current.preferences.filter((item) => item !== preference)
        : [...current.preferences, preference],
    }));
    setError(null);
  }

  function handleVehicleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!intake.vehicleYear || !intake.vehicleMake || !intake.vehicleModel) {
      setError("Year, make, and model are required.");
      return;
    }

    setStep(1);
  }

  async function generateTicket(saveBuild: boolean) {
    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/agent/ls-specialist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicleYear: intake.vehicleYear,
        vehicleMake: intake.vehicleMake,
        vehicleModel: intake.vehicleModel,
        engineStatus: intake.engineStatus,
        goal: intake.goal,
        preferences: intake.preferences,
        notes: intake.notes,
        saveBuild,
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | (SpecialistResult & { error?: string })
      | null;

    setIsLoading(false);

    if (!response.ok || !data) {
      setError(data?.error ?? "The specialist could not generate this ticket yet.");
      return;
    }

    setResult(data);

    if (saveBuild && data.buildId) {
      router.push(`/builds/${data.buildId}`);
      router.refresh();
      return;
    }

    setStep(4);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <aside className="neon-panel relative min-h-[620px] overflow-hidden rounded-[8px] p-5">
        <div className="absolute inset-0 bg-[linear-gradient(150deg,rgba(255,0,60,0.18),transparent_50%,rgba(0,210,255,0.14))]" />
        <div className="relative flex min-h-[580px] flex-col justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/50">
              LS Swap Specialist
            </p>
            <h2 className="mt-3 text-2xl font-black text-white">Agent intake</h2>
          </div>

          <div className="relative mx-auto h-[340px] w-[230px] overflow-hidden rounded-[8px] border border-[#FF003C]/45 bg-black/45 shadow-[0_0_54px_rgba(255,0,60,0.22)]">
            <Image
              src="/images/ai-agent-avatar.jpeg"
              alt="AI LS Swap Specialist"
              fill
              className="object-cover object-top"
              sizes="230px"
            />
          </div>

          <div className="rounded-[8px] border border-white/10 bg-black/70 p-4">
            <p className="text-sm font-semibold leading-6 text-white/78">{speech}</p>
            {result?.explanation ? (
              <p className="mt-3 text-sm leading-6 text-white/52">{result.explanation}</p>
            ) : null}
          </div>
        </div>
      </aside>

      <section className="neon-panel rounded-[8px] p-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {["Vehicle", "Drivetrain", "Goal", "Preferences", "Ticket"].map((label, index) => (
            <span
              key={label}
              className={`rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${
                index === step
                  ? "border-[#FF003C] text-white"
                  : index < step
                    ? "border-white/20 text-white/62"
                    : "border-white/10 text-white/35"
              }`}
            >
              {label}
            </span>
          ))}
        </div>

        {error ? (
          <div className="mb-5 rounded-[8px] border border-[#FF003C]/50 bg-[#FF003C]/10 p-3 text-sm font-semibold text-white">
            {error}
          </div>
        ) : null}

        {step === 0 ? (
          <form className="grid gap-4 sm:grid-cols-3" onSubmit={handleVehicleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-white/70">Year</span>
              <input
                value={intake.vehicleYear}
                onChange={(event) => updateIntake({ vehicleYear: event.target.value })}
                className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
                placeholder="1999"
                inputMode="numeric"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-white/70">Make</span>
              <input
                value={intake.vehicleMake}
                onChange={(event) => updateIntake({ vehicleMake: event.target.value })}
                className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
                placeholder="Chevrolet"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-white/70">Model</span>
              <input
                value={intake.vehicleModel}
                onChange={(event) => updateIntake({ vehicleModel: event.target.value })}
                className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
                placeholder="Silverado"
              />
            </label>
            <div className="sm:col-span-3">
              <button className="rounded-full bg-[#FF003C] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white">
                Continue
              </button>
            </div>
          </form>
        ) : null}

        {step === 1 ? (
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              {engineOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    updateIntake({ engineStatus: option });
                    setStep(2);
                  }}
                  className="rounded-[8px] border border-white/10 bg-black/45 p-4 text-left font-bold text-white/78 transition hover:border-[#FF003C]/70 hover:text-white"
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="mt-5 text-sm font-bold text-white/50 hover:text-white"
            >
              Back to vehicle
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <div className="grid gap-3 sm:grid-cols-4">
              {goalOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    updateIntake({ goal: option.value });
                    setStep(3);
                  }}
                  className="rounded-[8px] border border-white/10 bg-black/45 p-4 text-center font-black uppercase tracking-[0.14em] text-white/78 transition hover:border-[#FF003C]/70 hover:text-white"
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-5 text-sm font-bold text-white/50 hover:text-white"
            >
              Back to drivetrain
            </button>
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <div className="grid gap-3 sm:grid-cols-3">
              {preferenceOptions.map((option) => {
                const isSelected = intake.preferences.includes(option);

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => togglePreference(option)}
                    className={`rounded-[8px] border p-4 text-left font-bold transition ${
                      isSelected
                        ? "border-[#FF003C] bg-[#FF003C]/12 text-white"
                        : "border-white/10 bg-black/45 text-white/70 hover:border-[#FF003C]/70 hover:text-white"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            <label className="mt-5 block">
              <span className="text-sm font-semibold text-white/70">Notes/preferences</span>
              <textarea
                value={intake.notes}
                onChange={(event) => updateIntake({ notes: event.target.value })}
                className="mt-2 min-h-32 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
                placeholder="Cam, boost, budget ceiling, parts already bought, wiring concerns..."
              />
            </label>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => generateTicket(false)}
                disabled={isLoading}
                className="rounded-full bg-[#FF003C] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Generating..." : "Generate Build Ticket"}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white/70 hover:border-[#FF003C]/70 hover:text-white"
              >
                Back
              </button>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div>
            <div className="rounded-[8px] border border-white/10 bg-black/45 p-5">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
                Draft build ticket
              </p>
              <h3 className="mt-3 text-2xl font-black text-white">
                {intake.vehicleYear} {intake.vehicleMake} {intake.vehicleModel}
              </h3>
              <p className="mt-3 text-lg font-black text-[#FF003C]">
                {formatEstimate(result?.estimateMin, result?.estimateMax)}
              </p>
              <pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-7 text-white/72">
                {result?.summary}
              </pre>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => generateTicket(true)}
                disabled={isLoading}
                className="rounded-full bg-[#FF003C] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Saving..." : "Save Build Ticket"}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white/70 hover:border-[#FF003C]/70 hover:text-white"
              >
                Edit Preferences
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
