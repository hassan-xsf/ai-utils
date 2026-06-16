import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { decryptToken } from "./crypto";
import type { Routine } from "./schedule";

export type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  TOKEN_ENCRYPTION_KEY: string;
  WORKER_SHARED_SECRET: string;
};

type Preset = {
  id: string;
  user_id: string;
  target_url: string;
  http_method: "GET" | "POST" | "PUT" | "PATCH";
  request_body: unknown | null;
  token_ciphertext: string;
  auth_header_name: string;
  auth_scheme: string;
};

export function supabase(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getPreset(
  sb: SupabaseClient,
  presetId: string
): Promise<Preset | null> {
  const { data, error } = await sb
    .from("tm_presets")
    .select("id,user_id,target_url,http_method,request_body,token_ciphertext,auth_header_name,auth_scheme")
    .eq("id", presetId)
    .maybeSingle();
  if (error) throw error;
  return data as Preset | null;
}

// For manual test: pick the first preset for the user
export async function getFirstPreset(
  sb: SupabaseClient,
  userId: string
): Promise<Preset | null> {
  const { data, error } = await sb
    .from("tm_presets")
    .select("id,user_id,target_url,http_method,request_body,token_ciphertext,auth_header_name,auth_scheme")
    .eq("user_id", userId)
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Preset | null;
}

export async function executeRoutine(
  env: Env,
  sb: SupabaseClient,
  preset: Preset,
  routine: Routine | null,
  triggeredBy: "cron" | "manual"
): Promise<void> {
  const startedAt = new Date();
  const t0 = Date.now();

  let status: "success" | "failure" = "failure";
  let httpStatus: number | null = null;
  let responseExcerpt: string | null = null;
  let errorMessage: string | null = null;

  try {
    const token = await decryptToken(preset.token_ciphertext, env.TOKEN_ENCRYPTION_KEY);

    const headerValue = preset.auth_scheme ? `${preset.auth_scheme} ${token}` : token;
    const headers: Record<string, string> = {
      [preset.auth_header_name]: headerValue,
      "user-agent": "ai-utils-token-maxxer/0.1",
    };
    if (preset.target_url.includes("api.anthropic.com/v1/claude_code/routines")) {
      headers["anthropic-version"] = "2023-06-01";
      headers["anthropic-beta"] = "experimental-cc-routine-2026-04-01";
    }
    let body: BodyInit | undefined;
    if (preset.request_body != null && preset.http_method !== "GET") {
      headers["content-type"] = "application/json";
      body = JSON.stringify(preset.request_body);
    }

    const res = await fetch(preset.target_url, {
      method: preset.http_method,
      headers,
      body,
    });
    httpStatus = res.status;
    const text = await res.text().catch(() => "");
    responseExcerpt = text.slice(0, 500);
    status = res.ok ? "success" : "failure";
    if (!res.ok) errorMessage = `HTTP ${res.status}`;
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : String(e);
  }

  const duration = Date.now() - t0;

  await sb.from("tm_runs").insert({
    routine_id: routine?.id ?? null,
    user_id: preset.user_id,
    triggered_by: triggeredBy,
    status,
    http_status: httpStatus,
    duration_ms: duration,
    response_excerpt: responseExcerpt,
    error_message: errorMessage,
    started_at: startedAt.toISOString(),
  });
}
