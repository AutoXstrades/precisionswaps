"use client";

import { useState } from "react";

type ClawbotSupervisorPanelProps = {
  latestReport?: {
    title: string;
    report: string;
    createdAt: string;
  } | null;
};

type SupervisorResponse = {
  title: string;
  report: string;
  createdAt: string;
  error?: string;
};

export function ClawbotSupervisorPanel({
  latestReport,
}: ClawbotSupervisorPanelProps) {
  const [report, setReport] = useState(latestReport ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  async function runSupervisor() {
    setIsRunning(true);
    setError(null);

    const response = await fetch("/api/admin/clawbot/supervisor", {
      method: "POST",
    });
    const data = (await response.json().catch(() => null)) as SupervisorResponse | null;

    setIsRunning(false);

    if (!response.ok || !data) {
      setError(data?.error ?? "Could not run the Clawbot supervisor report.");
      return;
    }

    setReport({
      title: data.title,
      report: data.report,
      createdAt: data.createdAt,
    });
  }

  return (
    <section className="neon-panel rounded-[8px] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF003C]">
            Clawbot supervisor
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">Owner report</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
            Runs the supervisor against recent builds and stores the report in
            agent logs for back-office review.
          </p>
        </div>
        <button
          type="button"
          onClick={runSupervisor}
          disabled={isRunning}
          className="rounded-full bg-[#FF003C] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRunning ? "Running..." : "Run Report"}
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-[8px] border border-[#FF003C]/50 bg-[#FF003C]/10 p-3 text-sm font-semibold text-white">
          {error}
        </div>
      ) : null}

      {report ? (
        <div className="mt-5 rounded-[8px] border border-white/10 bg-black/50 p-4">
          <p className="text-lg font-black text-white">{report.title}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/38">
            {new Date(report.createdAt).toLocaleString()}
          </p>
          <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-7 text-white/70">
            {report.report}
          </pre>
        </div>
      ) : (
        <p className="mt-5 text-sm text-white/52">
          No supervisor report has been generated yet.
        </p>
      )}
    </section>
  );
}
