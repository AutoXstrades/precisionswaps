"use client";

import type { AgentType } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AgentConfigFormProps = {
  agent: {
    id: string;
    name: string;
    type: AgentType;
    role: "system" | "user" | "assistant";
    configJson: unknown;
  };
};

const agentTypes: AgentType[] = [
  "LS_SPECIALIST",
  "CLAWBOT_SUPERVISOR",
  "CLAWBOT_WORKER",
];
const agentRoles = ["system", "user", "assistant"] as const;

export function AgentConfigForm({ agent }: AgentConfigFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const configText = String(formData.get("config") ?? "");
    let parsedConfig: unknown;

    try {
      parsedConfig = JSON.parse(configText);
    } catch {
      setError("Config must be valid JSON.");
      return;
    }

    if (!parsedConfig || typeof parsedConfig !== "object" || Array.isArray(parsedConfig)) {
      setError("Config JSON must be an object.");
      return;
    }

    setIsSaving(true);

    const response = await fetch(`/api/admin/agents/${agent.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.get("name"),
        type: formData.get("type"),
        role: formData.get("role"),
        config: parsedConfig,
      }),
    });
    const data = (await response.json().catch(() => null)) as
      | { error?: string; issues?: Array<{ message: string }> }
      | null;

    setIsSaving(false);

    if (!response.ok) {
      setError(data?.issues?.[0]?.message ?? data?.error ?? "Could not update agent.");
      return;
    }

    setSuccess("Agent configuration saved.");
    router.refresh();
  }

  return (
    <form className="neon-panel rounded-[8px] p-6" onSubmit={handleSubmit}>
      {success ? (
        <div className="mb-5 rounded-[8px] border border-emerald-400/40 bg-emerald-400/10 p-3 text-sm font-semibold text-white">
          {success}
        </div>
      ) : null}
      {error ? (
        <div className="mb-5 rounded-[8px] border border-[#FF003C]/50 bg-[#FF003C]/10 p-3 text-sm font-semibold text-white">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-semibold text-white/70">Agent name</span>
          <input
            name="name"
            required
            defaultValue={agent.name}
            className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-white/70">Agent type</span>
          <select
            name="type"
            required
            defaultValue={agent.type}
            className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          >
            {agentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-white/70">Agent role</span>
          <select
            name="role"
            required
            defaultValue={agent.role}
            className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          >
            {agentRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-white/70">Config JSON</span>
        <textarea
          name="config"
          required
          spellCheck={false}
          defaultValue={JSON.stringify(agent.configJson, null, 2)}
          className="mt-2 min-h-[380px] w-full rounded-[8px] border border-white/10 bg-black/70 px-4 py-3 font-mono text-sm leading-6 text-white outline-none transition focus:border-[#FF003C]"
        />
      </label>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-[#FF003C] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Agent"}
        </button>
        <Link
          href="/admin/agents"
          className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-white/70 hover:border-[#FF003C]/70 hover:text-white"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
