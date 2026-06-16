"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock, ChevronDown, ChevronRight } from "lucide-react";
import type { TmRun, TmRoutine } from "@/lib/types";

function tryPrettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function RunRow({ run, routine }: { run: TmRun; routine?: TmRoutine }) {
  const [open, setOpen] = useState(false);
  const ok = run.status === "success";
  const hasDetail = !!(run.response_excerpt || run.error_message);

  return (
    <li className="divide-y divide-border">
      <div
        className={`grid grid-cols-[36px_1fr_120px_90px_90px_180px_28px] gap-3 px-4 py-3 items-center ${hasDetail ? "cursor-pointer hover:bg-[color:var(--panel-strong)]" : ""}`}
        onClick={() => hasDetail && setOpen((v) => !v)}
      >
        <span className={ok ? "text-success" : "text-danger"}>
          {ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
        </span>
        <span className="truncate">
          <span className="font-medium">{routine?.name ?? "Manual test"}</span>
          {!open && run.error_message && (
            <span className="text-xs text-danger ml-2">
              {run.error_message.slice(0, 80)}
            </span>
          )}
        </span>
        <span className="text-xs text-muted capitalize">{run.triggered_by}</span>
        <span>
          <span className={`badge ${ok ? "badge-ok" : "badge-fail"}`}>
            {run.http_status ?? (ok ? "OK" : "Err")}
          </span>
        </span>
        <span className="text-xs text-muted flex items-center gap-1">
          <Clock size={10} /> {run.duration_ms != null ? `${run.duration_ms}ms` : "—"}
        </span>
        <span className="text-xs text-muted">
          {new Date(run.started_at).toLocaleString()}
        </span>
        <span className="text-muted">
          {hasDetail && (open ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </span>
      </div>

      {open && hasDetail && (
        <div className="px-4 py-3 bg-[color:var(--panel-strong)] space-y-3">
          {run.error_message && (
            <div>
              <div className="text-xs text-muted mb-1">Error</div>
              <pre className="text-xs text-danger font-mono whitespace-pre-wrap break-all">
                {run.error_message}
              </pre>
            </div>
          )}
          {run.response_excerpt && (
            <div>
              <div className="text-xs text-muted mb-1">
                Response{run.response_excerpt.length >= 500 ? " (truncated at 500 chars)" : ""}
              </div>
              <pre className="text-xs font-mono whitespace-pre-wrap break-all text-foreground bg-[color:var(--bg)] rounded p-3 border border-border overflow-x-auto">
                {tryPrettyJson(run.response_excerpt)}
              </pre>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
