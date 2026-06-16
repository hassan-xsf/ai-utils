"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal";
import { encryptToken, tokenPreview } from "@/lib/crypto";

const PresetSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(80),
  target_url: z.string().url(),
  http_method: z.enum(["GET", "POST", "PUT", "PATCH"]),
  request_body: z.string().optional(),
  auth_header_name: z
    .string()
    .min(1, { message: "Header name is required" })
    .max(80)
    .regex(/^[A-Za-z0-9-]+$/, {
      message: "Header name may only contain letters, numbers, and hyphens",
    }),
  auth_scheme: z.string().max(40).optional(),
  token: z.string().min(1).optional(),
});

type ActionState = { ok: boolean; error?: string };

export async function savePreset(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = PresetSchema.safeParse({
    id: formData.get("id")?.toString() || undefined,
    name: formData.get("name")?.toString().trim(),
    target_url: formData.get("target_url"),
    http_method: formData.get("http_method") || "POST",
    request_body: formData.get("request_body")?.toString() || undefined,
    auth_header_name: (formData.get("auth_header_name")?.toString() || "Authorization").trim(),
    auth_scheme: formData.get("auth_scheme")?.toString().trim() ?? "",
    token: formData.get("token")?.toString() || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let parsedBody: unknown = null;
  if (parsed.data.request_body) {
    try {
      parsedBody = JSON.parse(parsed.data.request_body);
    } catch {
      return { ok: false, error: "Request body must be valid JSON" };
    }
  }

  if (parsed.data.id) {
    // Update existing preset; only rotate token if new one supplied
    const update: Record<string, unknown> = {
      name: parsed.data.name,
      target_url: parsed.data.target_url,
      http_method: parsed.data.http_method,
      request_body: parsedBody,
      auth_header_name: parsed.data.auth_header_name,
      auth_scheme: parsed.data.auth_scheme ?? "",

    };
    if (parsed.data.token) {
      update.token_ciphertext = await encryptToken(parsed.data.token);
      update.token_preview = tokenPreview(parsed.data.token);
    }
    const { error } = await supabase
      .from("tm_presets")
      .update(update)
      .eq("id", parsed.data.id)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
  } else {
    if (!parsed.data.token) {
      return { ok: false, error: "Token is required when creating a preset" };
    }
    const { error } = await supabase.from("tm_presets").insert({
      user_id: user.id,
      name: parsed.data.name,
      target_url: parsed.data.target_url,
      http_method: parsed.data.http_method,
      request_body: parsedBody,
      auth_header_name: parsed.data.auth_header_name,
      auth_scheme: parsed.data.auth_scheme ?? "",

      token_ciphertext: await encryptToken(parsed.data.token),
      token_preview: tokenPreview(parsed.data.token),
    });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/token-maxxer");
  return { ok: true };
}

export async function deletePreset(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  if (!id) return;
  await supabase.from("tm_presets").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/token-maxxer");
}

const RoutineSchema = z.object({
  id: z.string().uuid().optional(),
  preset_id: z.string().uuid({ message: "Select a preset" }),
  name: z.string().min(1).max(80),
  times_of_day: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1, { message: "At least one time is required" }),
  timezone: z.string().min(1),
  days_of_week: z.array(z.number().int().min(0).max(6)).min(1),
  enabled: z.boolean(),
});

export async function saveRoutine(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const supabase = await createClient();

  const daysRaw = formData.getAll("days_of_week").map((d) => Number(d));
  const timesRaw = formData.getAll("times_of_day").map((t) => t.toString());
  const parsed = RoutineSchema.safeParse({
    id: formData.get("id")?.toString() || undefined,
    preset_id: formData.get("preset_id")?.toString(),
    name: formData.get("name"),
    times_of_day: timesRaw,
    timezone: formData.get("timezone"),
    days_of_week: daysRaw,
    enabled: formData.get("enabled") === "on" || formData.get("enabled") === "true",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // Verify the preset belongs to this user
  const { data: preset } = await supabase
    .from("tm_presets")
    .select("id")
    .eq("id", parsed.data.preset_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!preset) {
    return { ok: false, error: "Preset not found." };
  }

  const payload = {
    user_id: user.id,
    preset_id: parsed.data.preset_id,
    name: parsed.data.name,
    times_of_day: parsed.data.times_of_day.map((t) => t + ":00"),
    timezone: parsed.data.timezone,
    days_of_week: parsed.data.days_of_week,
    enabled: parsed.data.enabled,
  };

  if (parsed.data.id) {
    const { error } = await supabase
      .from("tm_routines")
      .update(payload)
      .eq("id", parsed.data.id)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("tm_routines").insert(payload);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/token-maxxer");
  return { ok: true };
}

export async function deleteRoutine(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  if (!id) return;
  await supabase.from("tm_routines").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/token-maxxer");
}

export async function toggleRoutine(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  const enabled = formData.get("enabled") === "true";
  if (!id) return;
  await supabase
    .from("tm_routines")
    .update({ enabled: !enabled })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/token-maxxer");
}

export async function runManualTest(presetId: string): Promise<ActionState> {
  const user = await requireUser();
  const workerUrl = process.env.WORKER_URL;
  const sharedSecret = process.env.WORKER_SHARED_SECRET;
  if (!workerUrl || !sharedSecret) {
    return { ok: false, error: "Worker not configured (WORKER_URL / WORKER_SHARED_SECRET)." };
  }

  try {
    const res = await fetch(`${workerUrl}/manual-test`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-worker-secret": sharedSecret,
      },
      body: JSON.stringify({ user_id: user.id, preset_id: presetId }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Worker returned ${res.status}: ${text.slice(0, 200)}` };
    }
    revalidatePath("/token-maxxer/history");
    revalidatePath("/token-maxxer");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to reach Worker" };
  }
}
