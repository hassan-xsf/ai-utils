"use client";

import { Pencil, Trash2, Power } from "lucide-react";
import type { TmRoutine } from "@/lib/types";
import { DAY_LABELS } from "@/lib/types";
import { deleteRoutine, toggleRoutine } from "./actions";

export function RoutineRow({ routine, onEdit }: { routine: TmRoutine; onEdit: () => void }) {
  const times = (routine.times_of_day ?? []).map((t) => {
    const [hStr, mStr] = t.split(":");
    const h = parseInt(hStr, 10);
    const period = h < 12 ? "AM" : "PM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${mStr} ${period}`;
  });

  return (
    <div className="panel p-4 flex items-center gap-4 flex-wrap">
      <div className="flex-1 min-w-60">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-tight">{routine.name}</span>
          <span className={`badge ${routine.enabled ? "badge-ok" : ""}`}>
            {routine.enabled ? "Enabled" : "Paused"}
          </span>
        </div>
        <div className="text-xs text-muted mt-1 flex flex-wrap gap-1 items-center">
          {times.map((t) => (
            <span key={t} className="badge font-mono text-[10px]">{t}</span>
          ))}
          <span>· {routine.timezone}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {DAY_LABELS.map((d, i) => {
          const on = routine.days_of_week.includes(i);
          return (
            <span
              key={d}
              className={`text-[11px] w-7 text-center py-1 rounded border ${
                on
                  ? "border-accent text-accent bg-[rgba(151,0,13,0.08)]"
                  : "border-border text-muted"
              }`}
            >
              {d[0]}
            </span>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <form action={toggleRoutine}>
          <input type="hidden" name="id" value={routine.id} />
          <input type="hidden" name="enabled" value={String(routine.enabled)} />
          <button className="btn" title={routine.enabled ? "Pause" : "Enable"}>
            <Power size={12} />
          </button>
        </form>
        <button className="btn" onClick={onEdit} title="Edit">
          <Pencil size={12} />
        </button>
        <form action={deleteRoutine}>
          <input type="hidden" name="id" value={routine.id} />
          <button className="btn btn-danger" title="Delete">
            <Trash2 size={12} />
          </button>
        </form>
      </div>
    </div>
  );
}
