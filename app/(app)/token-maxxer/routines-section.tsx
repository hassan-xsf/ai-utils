"use client";

import { useState } from "react";
import { Plus, Clock } from "lucide-react";
import type { TmRoutine, TmPreset } from "@/lib/types";
import { DAY_LABELS } from "@/lib/types";
import { RoutineForm } from "./routine-form";
import { RoutineRow } from "./routine-row";

export function RoutinesSection({
  routines,
  presets,
}: {
  routines: TmRoutine[];
  presets: TmPreset[];
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const hasPresets = presets.length > 0;

  // Group routines by preset_id
  const grouped = new Map<string, { preset: TmPreset; routines: TmRoutine[] }>();
  const ungrouped: TmRoutine[] = [];

  for (const r of routines) {
    if (r.preset_id) {
      const preset = presets.find((p) => p.id === r.preset_id);
      if (preset) {
        if (!grouped.has(r.preset_id)) grouped.set(r.preset_id, { preset, routines: [] });
        grouped.get(r.preset_id)!.routines.push(r);
        continue;
      }
    }
    ungrouped.push(r);
  }

  return (
    <section className="panel p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-accent" />
          <h2 className="text-lg font-semibold tracking-tight">Routines</h2>
          <span className="badge">{routines.length}</span>
        </div>
        <button
          className="btn btn-primary"
          disabled={!hasPresets || adding}
          onClick={() => setAdding(true)}
          title={!hasPresets ? "Create a preset first" : ""}
        >
          <Plus size={12} /> Add routine
        </button>
      </header>

      {!hasPresets && (
        <div className="text-sm text-muted">
          Create an endpoint preset above before adding routines.
        </div>
      )}

      {adding && (
        <RoutineForm presets={presets} onDone={() => setAdding(false)} />
      )}

      {routines.length === 0 && !adding && hasPresets && (
        <div className="text-sm text-muted py-6 text-center">
          No routines yet. Add one to begin.
        </div>
      )}

      {/* Grouped by preset */}
      {[...grouped.values()].map(({ preset, routines: group }) => (
        <div key={preset.id} className="space-y-2">
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-widest">{preset.name}</span>
            <span className="badge mono text-[10px]">{preset.http_method}</span>
            <div className="flex-1 border-t border-border" />
          </div>
          {group.map((r) =>
            editingId === r.id ? (
              <RoutineForm key={r.id} routine={r} presets={presets} onDone={() => setEditingId(null)} />
            ) : (
              <RoutineRow key={r.id} routine={r} onEdit={() => setEditingId(r.id)} />
            )
          )}
        </div>
      ))}

      {/* Routines whose preset was deleted */}
      {ungrouped.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-widest">No preset</span>
            <div className="flex-1 border-t border-border" />
          </div>
          {ungrouped.map((r) =>
            editingId === r.id ? (
              <RoutineForm key={r.id} routine={r} presets={presets} onDone={() => setEditingId(null)} />
            ) : (
              <RoutineRow key={r.id} routine={r} onEdit={() => setEditingId(r.id)} />
            )
          )}
        </div>
      )}

      <div className="text-xs text-muted pt-2">
        Days legend: {DAY_LABELS.join(" · ")}
      </div>
    </section>
  );
}
