"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type CustomerLog = {
  id: string;
  buildId: string;
  senderRole: string;
  senderEmail: string;
  message: string;
  timestamp: string | Date;
  reviewed: boolean;
};

type CustomerBuildChatPanelProps = {
  buildId: string;
  initialLogs: CustomerLog[];
};

function formatTimestamp(value: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function CustomerBuildChatPanel({
  buildId,
  initialLogs,
}: CustomerBuildChatPanelProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [logs]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel(`customer-build-logs-${buildId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "customer_logs",
          filter: `build_id=eq.${buildId}`,
        },
        async () => {
          const response = await fetch(`/api/customer-logs/${buildId}`);
          const data = (await response.json().catch(() => null)) as
            | { logs?: CustomerLog[] }
            | null;

          if (response.ok && data?.logs) {
            setLogs(data.logs);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buildId, supabase]);

  async function refreshLogs() {
    const response = await fetch(`/api/customer-logs/${buildId}`);
    const data = (await response.json().catch(() => null)) as
      | { logs?: CustomerLog[] }
      | null;

    if (response.ok && data?.logs) {
      setLogs(data.logs);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setError("Message is required.");
      return;
    }

    setError(null);
    setIsSending(true);

    const response = await fetch(`/api/customer-logs/${buildId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmedMessage }),
    });
    const data = (await response.json().catch(() => null)) as
      | { log?: CustomerLog; error?: string; issues?: Array<{ message?: string }> }
      | null;

    setIsSending(false);

    if (!response.ok || !data?.log) {
      setError(
        data?.issues?.[0]?.message ??
          data?.error ??
          "Could not send this message.",
      );
      return;
    }

    setMessage("");
    const nextLog = data.log;
    setLogs((current) => [...current.filter((log) => log.id !== nextLog.id), nextLog]);
  }

  return (
    <div className="neon-panel rounded-[8px] p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF003C] sm:tracking-[0.22em]">
            Shop conversation
          </p>
          <h2 className="mt-2 text-xl font-black text-white">Build messages</h2>
        </div>
        <button
          type="button"
          onClick={refreshLogs}
          className="min-h-11 rounded-full border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-white/70 hover:border-[#FF003C]/70 hover:text-white"
        >
          Refresh
        </button>
      </div>

      <div
        ref={scrollRef}
        className="mt-5 max-h-96 space-y-3 overflow-y-auto overscroll-contain rounded-[8px] border border-white/10 bg-black/35 p-3"
      >
        {logs.length ? (
          logs.map((log) => (
            <article
              key={log.id}
              className={`rounded-[8px] border p-3 ${
                log.senderRole === "customer"
                  ? "ml-auto border-[#FF003C]/30 bg-[#FF003C]/10"
                  : "border-white/10 bg-white/[0.06]"
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-white/52">
                  {log.senderRole === "admin" ? "Shop" : "You"} | {log.senderEmail}
                </p>
                <p className="text-xs font-semibold text-white/38">
                  {formatTimestamp(log.timestamp)}
                </p>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-white/76">
                {log.message}
              </p>
            </article>
          ))
        ) : (
          <p className="p-4 text-sm text-white/52">
            No messages yet. Send a note to the shop about this build.
          </p>
        )}
      </div>

      {error ? <p className="mt-3 text-sm font-semibold text-[#FF003C]">{error}</p> : null}

      <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            setError(null);
          }}
          className="min-h-28 w-full rounded-[8px] border border-white/10 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-[#FF003C]"
          placeholder="Ask a question or send an update about this build..."
        />
        <button
          type="submit"
          disabled={isSending}
          className="min-h-11 rounded-full bg-[#FF003C] px-5 py-3 text-xs font-black uppercase tracking-[0.1em] text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit sm:text-sm"
        >
          {isSending ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}