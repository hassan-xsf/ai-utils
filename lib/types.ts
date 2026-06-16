export type TmPreset = {
  id: string;
  user_id: string;
  name: string;
  target_url: string;
  http_method: "GET" | "POST" | "PUT" | "PATCH";
  request_body: unknown | null;
  auth_header_name: string;
  auth_scheme: string;
  token_preview: string;
  created_at: string;
  updated_at: string;
};

export type TmRoutine = {
  id: string;
  user_id: string;
  preset_id: string | null;
  name: string;
  times_of_day: string[]; // ["HH:MM:SS", ...]
  timezone: string;
  days_of_week: number[]; // 0..6
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type TmRun = {
  id: string;
  routine_id: string | null;
  user_id: string;
  triggered_by: "cron" | "manual";
  status: "success" | "failure";
  http_status: number | null;
  duration_ms: number | null;
  response_excerpt: string | null;
  error_message: string | null;
  started_at: string;
};

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
