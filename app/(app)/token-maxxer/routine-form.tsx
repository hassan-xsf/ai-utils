"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, Plus, X } from "lucide-react";
import { Spinner } from "@/app/components/spinner";
import type { TmRoutine, TmPreset } from "@/lib/types";
import { DAY_LABELS } from "@/lib/types";
import { saveRoutine } from "./actions";

const DAY_PRESETS = ["every-day", "weekdays", "weekends", "custom"] as const;
type DayPreset = (typeof DAY_PRESETS)[number];

const PRESET_DAYS: Record<Exclude<DayPreset, "custom">, number[]> = {
  "every-day": [0, 1, 2, 3, 4, 5, 6],
  weekdays: [1, 2, 3, 4, 5],
  weekends: [0, 6],
};

const COMMON_TZ = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

// HH:MM values (24h) with 12h display labels
const TIME_OPTIONS = (() => {
  const out: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const period = h < 12 ? "AM" : "PM";
      const h12 = h % 12 === 0 ? 12 : h % 12;
      const label = `${h12}:${String(m).padStart(2, "0")} ${period}`;
      out.push({ value, label });
    }
  }
  return out;
})();

function to12h(value: string) {
  const [hStr, mStr] = value.split(":");
  const h = parseInt(hStr, 10);
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${period}`;
}

export function RoutineForm({
  routine,
  presets,
  onDone,
}: {
  routine?: TmRoutine;
  presets: TmPreset[];
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState(saveRoutine, undefined);
  const [autoTz, setAutoTz] = useState(!routine);
  const [tz, setTz] = useState(routine?.timezone ?? "UTC");

  const initialDayPreset: DayPreset = (() => {
    if (!routine) return "every-day";
    const d = [...routine.days_of_week].sort().join(",");
    if (d === "0,1,2,3,4,5,6") return "every-day";
    if (d === "1,2,3,4,5") return "weekdays";
    if (d === "0,6") return "weekends";
    return "custom";
  })();
  const [dayPreset, setDayPreset] = useState<DayPreset>(initialDayPreset);
  const [days, setDays] = useState<number[]>(routine?.days_of_week ?? PRESET_DAYS["every-day"]);

  // Multi-time state: array of HH:MM strings
  const initialTimes = routine?.times_of_day?.map((t) => t.slice(0, 5)) ?? ["09:00"];
  const [times, setTimes] = useState<string[]>(initialTimes);
  const [addingTime, setAddingTime] = useState("09:00");

  useEffect(() => {
    if (autoTz) {
      try {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (detected) setTz(detected);
      } catch { /* ignore */ }
    }
  }, [autoTz]);

  useEffect(() => {
    if (dayPreset !== "custom") setDays(PRESET_DAYS[dayPreset]);
  }, [dayPreset]);

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  function toggleDay(d: number) {
    setDayPreset("custom");
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  function addTime() {
    if (!times.includes(addingTime)) {
      setTimes((prev) => [...prev, addingTime].sort());
    }
  }

  function removeTime(t: string) {
    setTimes((prev) => prev.filter((x) => x !== t));
  }

  const defaultPresetId = routine?.preset_id ?? presets[0]?.id ?? "";

  return (
    <form action={action} className="panel panel-strong p-5 space-y-4">
      {routine && <input type="hidden" name="id" value={routine.id} />}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="label mono block">Routine name</label>
          <input
            name="name"
            required
            maxLength={80}
            defaultValue={routine?.name ?? ""}
            className="input"
            placeholder="Morning ping"
          />
        </div>
        <div className="space-y-1.5">
          <label className="label mono block">Preset (endpoint + auth)</label>
          <select name="preset_id" defaultValue={defaultPresetId} className="select">
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.http_method} {new URL(p.target_url).hostname}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Times */}
      <div className="space-y-2">
        <label className="label mono block">Fire times</label>

        {/* Selected times as tags */}
        {times.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {times.map((t) => (
              <span key={t} className="flex items-center gap-1.5 badge font-mono">
                {to12h(t)}
                {times.length > 1 && (
                  <button type="button" onClick={() => removeTime(t)} className="hover:text-danger transition-colors">
                    <X size={10} />
                  </button>
                )}
              </span>
            ))}
            {times.map((t) => (
              <input key={t} type="hidden" name="times_of_day" value={t} />
            ))}
          </div>
        )}

        {/* Add time row */}
        <div className="flex items-center gap-2">
          <select
            value={addingTime}
            onChange={(e) => setAddingTime(e.target.value)}
            className="select flex-1"
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={addTime}
            disabled={times.includes(addingTime)}
            className="btn btn-primary shrink-0"
          >
            <Plus size={12} /> Add time
          </button>
        </div>
      </div>

      {/* Timezone */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="label mono block">Timezone</label>
          <label className="mono text-[10px] uppercase tracking-widest text-muted flex items-center gap-1">
            <input type="checkbox" checked={autoTz} onChange={(e) => setAutoTz(e.target.checked)} /> auto
          </label>
        </div>
        <select
          name="timezone"
          value={tz}
          onChange={(e) => { setTz(e.target.value); setAutoTz(false); }}
          className="select"
        >
          {!COMMON_TZ.includes(tz) && <option value={tz}>{tz} (auto)</option>}
          {COMMON_TZ.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Days */}
      <div className="space-y-2">
        <label className="label mono block">Days</label>
        <div className="flex items-center gap-2 flex-wrap">
          {DAY_PRESETS.map((p) => (
            <button key={p} type="button" onClick={() => setDayPreset(p)} className={`btn ${dayPreset === p ? "btn-primary" : ""}`}>
              {p.replace("-", " ")}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-2">
          {DAY_LABELS.map((label, i) => {
            const on = days.includes(i);
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleDay(i)}
                className={`mono text-xs w-12 py-2 rounded border transition-colors ${
                  on
                    ? "border-accent text-accent bg-[rgba(151,0,13,0.08)]"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {days.map((d) => (
          <input key={d} type="hidden" name="days_of_week" value={d} />
        ))}
      </div>

      <label className="flex items-center gap-2 mono text-xs uppercase tracking-widest">
        <input type="checkbox" name="enabled" defaultChecked={routine?.enabled ?? true} />
        Enabled
      </label>

      {state?.error && (
        <div className="badge badge-fail justify-center w-full">
          <AlertCircle size={12} /> {state.error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" className="btn" onClick={onDone}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={pending || days.length === 0 || times.length === 0}>
          {pending && <Spinner size={12} />}
          {pending ? "Saving…" : routine ? "Update routine" : "Create routine"}
        </button>
      </div>
    </form>
  );
}
