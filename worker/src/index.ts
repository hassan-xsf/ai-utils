import { shouldFire, type Routine } from "./schedule";
import { type Env, supabase, getPreset, getFirstPreset, executeRoutine } from "./executor";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return new Response("ok", { status: 200 });
    }
    if (request.method === "POST" && url.pathname === "/manual-test") {
      const secret = request.headers.get("x-worker-secret");
      if (!secret || secret !== env.WORKER_SHARED_SECRET) {
        return new Response("unauthorized", { status: 401 });
      }
      const body = (await request.json().catch(() => ({}))) as { user_id?: string; preset_id?: string };
      if (!body.user_id) return new Response("user_id required", { status: 400 });

      const sb = supabase(env);
      const preset = body.preset_id
        ? await getPreset(sb, body.preset_id)
        : await getFirstPreset(sb, body.user_id);
      if (!preset) return new Response("no preset", { status: 404 });

      await executeRoutine(env, sb, preset, null, "manual");
      return Response.json({ ok: true });
    }
    return new Response("not found", { status: 404 });
  },

  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    const sb = supabase(env);
    const now = new Date();

    const { data: routines, error } = await sb
      .from("tm_routines")
      .select("id,user_id,preset_id,times_of_day,timezone,days_of_week,enabled")
      .eq("enabled", true);
    if (error) {
      console.error("failed to load routines", error);
      return;
    }
    const due = (routines as Routine[]).filter((r) => shouldFire(r, now));

    const tasks: Promise<void>[] = [];
    for (const routine of due) {
      if (!routine.preset_id) continue;
      tasks.push(
        (async () => {
          try {
            const preset = await getPreset(sb, routine.preset_id!);
            if (!preset) return;
            await executeRoutine(env, sb, preset, routine, "cron");
          } catch (e) {
            console.error("routine failed", routine.id, e);
          }
        })()
      );
    }
    ctx.waitUntil(Promise.all(tasks));
  },
};
