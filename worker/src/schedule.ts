// Determines whether a routine should fire at the given UTC instant.
// The Worker runs every 30 minutes (:00 and :30), so we match the user's
// local HH:MM (in their tz) against each scheduled time, with ±15 min tolerance.

type Routine = {
  id: string;
  user_id: string;
  preset_id: string | null;
  times_of_day: string[]; // ["HH:MM:SS", ...]
  timezone: string;
  days_of_week: number[]; // 0..6 (Sun..Sat)
  enabled: boolean;
};

function getLocalParts(now: Date, timezone: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour12: false,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = fmt.formatToParts(now);
  let hour = 0, minute = 0, weekday = "Sun";
  for (const p of parts) {
    if (p.type === "hour") hour = parseInt(p.value, 10);
    else if (p.type === "minute") minute = parseInt(p.value, 10);
    else if (p.type === "weekday") weekday = p.value;
  }
  if (hour === 24) hour = 0;
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { hour, minute, dayOfWeek: dayMap[weekday] ?? 0 };
}

export function shouldFire(routine: Routine, now: Date): boolean {
  if (!routine.enabled) return false;
  const local = getLocalParts(now, routine.timezone);
  if (!routine.days_of_week.includes(local.dayOfWeek)) return false;

  const localMinutes = local.hour * 60 + local.minute;

  return routine.times_of_day.some((t) => {
    const [hStr, mStr] = t.split(":");
    const targetMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
    let diff = Math.abs(localMinutes - targetMinutes);
    if (diff > 720) diff = 1440 - diff; // wrap around midnight
    return diff <= 15;
  });
}

export type { Routine };
