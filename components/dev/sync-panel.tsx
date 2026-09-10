"use client";

import { useState, useTransition } from "react";
import { syncScrapers, type SyncState } from "@/app/dev/actions";
import type { ScraperResult } from "@/lib/admin";

function resultRow(name: string, r: ScraperResult) {
  return (
    <div key={name} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5">
      <span className="font-medium capitalize">{name}</span>
      <span className="text-xs text-mint">
        <b>{r.added}</b> added · <b>{r.updated}</b> updated · <b>{r.skipped}</b> skipped
        {r.errors.length > 0 && <span className="text-red-400"> · {r.errors.length} err</span>}
      </span>
    </div>
  );
}

export function SyncPanel() {
  const [state, setState] = useState<SyncState>({ status: "idle" });
  const [, startTransition] = useTransition();

  const running = state.status === "running";

  async function run() {
    if (running) return;
    setState({ status: "running" });
    startTransition(async () => {
      const res = await syncScrapers();
      setState(res);
    });
  }

  return (
    <div className="mt-6 space-y-5">
      <p className="text-sm text-mint">
        Scrapes all states (JAIS, JAKIM, Johor, Kedah) for new sermons. Takes a while.
      </p>

      <button
        onClick={run}
        disabled={running}
        className="btn-gold inline-flex items-center gap-2 rounded-full px-6 py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {running && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
        )}
        {running ? "Scraping in progress…" : "Sync new sermons"}
      </button>

      {state.status === "running" && (
        <p className="text-sm text-mint">Fetching listings and downloading PDFs…</p>
      )}

      {state.status === "unauthorized" && (
        <p className="text-sm text-red-400">Session expired. Refresh and re-enter password.</p>
      )}

      {state.status === "error" && (
        <p className="text-sm text-red-400">Sync failed: {state.message}</p>
      )}

      {state.status === "done" && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-mint-light">Results:</p>
          {resultRow("jais", state.result.jais)}
          {resultRow("jakim", state.result.jakim)}
          {resultRow("johor", state.result.johor)}
          {resultRow("kedah", state.result.kedah)}
        </div>
      )}
    </div>
  );
}
