"use client";

import { useTransition, useState } from "react";
import { Play, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Spinner } from "@/app/components/spinner";
import type { TmPreset } from "@/lib/types";
import { runManualTest } from "./actions";

export function ManualTestButton({ presets }: { presets: TmPreset[] }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [picking, setPicking] = useState(false);
  const [selectedId, setSelectedId] = useState(presets[0]?.id ?? "");

  function open() {
    setResult(null);
    setSelectedId(presets[0]?.id ?? "");
    setPicking(true);
  }

  function fire() {
    if (!selectedId) return;
    setPicking(false);
    start(async () => {
      const r = await runManualTest(selectedId);
      setResult(r);
    });
  }

  return (
    <div className="flex items-center gap-2">
      {picking ? (
        <div className="flex items-center gap-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="select text-sm"
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={fire} disabled={!selectedId}>
            <Play size={12} /> Fire
          </button>
          <button className="btn" onClick={() => setPicking(false)}>
            <X size={12} />
          </button>
        </div>
      ) : (
        <button className="btn" onClick={open} disabled={pending}>
          {pending ? <Spinner size={12} /> : <Play size={12} />}
          {pending ? "Executing…" : "Run manual test"}
        </button>
      )}
      {result?.ok && (
        <span className="badge badge-ok"><CheckCircle2 size={12} /> Triggered</span>
      )}
      {result && !result.ok && (
        <span className="badge badge-fail" title={result.error}>
          <AlertCircle size={12} /> {result.error?.slice(0, 60)}
        </span>
      )}
    </div>
  );
}
