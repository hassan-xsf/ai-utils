"use client";

import { useActionState, useState } from "react";
import { KeyRound, CheckCircle2, AlertCircle, Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Spinner } from "@/app/components/spinner";
import type { TmPreset } from "@/lib/types";
import { savePreset, deletePreset } from "./actions";

// ── Auth style (custom only) ──────────────────────────────────────────────────

type AuthStyle = "bearer" | "apikey" | "token" | "custom";

const AUTH_STYLES: { value: AuthStyle; label: string; headerName: string; scheme: string }[] = [
  { value: "bearer", label: "Authorization: Bearer …", headerName: "Authorization", scheme: "Bearer" },
  { value: "token",  label: "Authorization: Token …",  headerName: "Authorization", scheme: "Token"  },
  { value: "apikey", label: "x-api-key: …",            headerName: "x-api-key",     scheme: ""        },
  { value: "custom", label: "Custom header",            headerName: "",               scheme: ""        },
];

function detectAuthStyle(headerName: string, scheme: string): AuthStyle {
  if (headerName === "Authorization" && scheme === "Bearer") return "bearer";
  if (headerName === "Authorization" && scheme === "Token")  return "token";
  if (headerName.toLowerCase() === "x-api-key" && !scheme)  return "apikey";
  return "custom";
}

// ── Templates ─────────────────────────────────────────────────────────────────

type TemplateId = "blank" | "claude-routines";

// ── Preset form ───────────────────────────────────────────────────────────────

function PresetForm({ preset, onDone }: { preset?: TmPreset; onDone: () => void }) {
  const [state, action, pending] = useActionState(savePreset, undefined);
  const [rotateToken, setRotateToken] = useState(!preset);

  const detectTemplate = (): TemplateId => {
    if (!preset) return "blank";
    if (
      preset.auth_header_name === "Authorization" &&
      preset.auth_scheme === "Bearer" &&
      preset.target_url.includes("api.anthropic.com/v1/claude_code/routines")
    ) return "claude-routines";
    return "blank";
  };

  const [templateId, setTemplateId] = useState<TemplateId>(detectTemplate);

  const initialAuth = preset ? detectAuthStyle(preset.auth_header_name, preset.auth_scheme) : "bearer";
  const [authStyle, setAuthStyle] = useState<AuthStyle>(initialAuth);
  const [headerName, setHeaderName] = useState(preset?.auth_header_name ?? "Authorization");
  const [scheme, setScheme] = useState(preset?.auth_scheme ?? "Bearer");

  function applyAuthStyle(s: AuthStyle) {
    setAuthStyle(s);
    const found = AUTH_STYLES.find((x) => x.value === s);
    if (found && s !== "custom") {
      setHeaderName(found.headerName);
      setScheme(found.scheme);
    }
  }

  const isClaudeRoutines = templateId === "claude-routines";

  return (
    <form action={action} className="panel panel-strong p-5 space-y-4">
      {preset && <input type="hidden" name="id" value={preset.id} />}

      {/* Hardcoded values for Claude Routines */}
      {isClaudeRoutines && (
        <>
          <input type="hidden" name="http_method" value="POST" />
          <input type="hidden" name="auth_header_name" value="Authorization" />
          <input type="hidden" name="auth_scheme" value="Bearer" />
          <input type="hidden" name="request_body" value={JSON.stringify({ text: "" })} />
        </>
      )}

      {/* Template picker — only when creating */}
      {!preset && (
        <div className="space-y-1.5">
          <label className="label mono block">Template</label>
          <div className="flex gap-2">
            {(["blank", "claude-routines"] as TemplateId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTemplateId(id)}
                className={`btn ${templateId === id ? "btn-primary" : ""}`}
              >
                {id === "blank" ? "Custom" : "Claude Routines"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preset name */}
      <div className="space-y-1.5">
        <label className="label mono block">Preset name</label>
        <input
          name="name"
          required
          maxLength={80}
          key={`name-${templateId}`}
          defaultValue={preset?.name ?? (isClaudeRoutines ? "Claude Routines" : "")}
          className="input"
          placeholder="My API ping"
        />
      </div>

      {/* URL — label differs: Claude Routines shows the routine fire URL pattern */}
      <div className="space-y-1.5">
        <label className="label mono block">
          {isClaudeRoutines ? "Routine fire URL" : "Target URL"}
        </label>
        {isClaudeRoutines && (
          <p className="text-[11px] text-muted">
            Replace <code className="font-mono bg-(--panel-strong) px-1 rounded">ROUTINE_ID</code> with your Claude Code routine ID.
          </p>
        )}
        <input
          name="target_url"
          required
          key={`url-${templateId}`}
          defaultValue={""
          }
          className="input font-mono text-sm"
          placeholder={isClaudeRoutines
            ? "https://api.anthropic.com/v1/claude_code/routines/ROUTINE_ID/fire"
            : "https://your-endpoint.example.com/ping"
          }
        />
      </div>

      {/* Custom-only fields */}
      {!isClaudeRoutines && (
        <>
          <div className="grid md:grid-cols-[1fr_140px] gap-4">
            <div className="space-y-1.5">
              <label className="label mono block">Request body (JSON, optional)</label>
              <textarea
                name="request_body"
                defaultValue={preset?.request_body ? JSON.stringify(preset.request_body, null, 2) : ""}
                rows={3}
                className="textarea font-mono text-xs"
                placeholder='{ "model": "claude-opus-4-5", "max_tokens": 1 }'
              />
            </div>
            <div className="space-y-1.5">
              <label className="label mono block">Method</label>
              <select name="http_method" defaultValue={preset?.http_method ?? "POST"} className="select">
                <option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="label mono block">Auth style</label>
              <select value={authStyle} onChange={(e) => applyAuthStyle(e.target.value as AuthStyle)} className="select">
                {AUTH_STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {authStyle === "custom" ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="label mono block">Header name</label>
                  <input name="auth_header_name" value={headerName} onChange={(e) => setHeaderName(e.target.value)} className="input font-mono" placeholder="x-api-key" />
                </div>
                <div className="space-y-1.5">
                  <label className="label mono block">Scheme prefix (optional)</label>
                  <input name="auth_scheme" value={scheme} onChange={(e) => setScheme(e.target.value)} className="input font-mono" placeholder="Bearer" />
                </div>
              </div>
            ) : (
              <>
                <input type="hidden" name="auth_header_name" value={headerName} />
                <input type="hidden" name="auth_scheme" value={scheme} />
              </>
            )}
          </div>
        </>
      )}

      {/* Token */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="label mono block">
            {isClaudeRoutines ? "Anthropic API key" : authStyle === "apikey" ? "API key" : "Token"}
          </label>
          {preset && (
            <button type="button" className="mono text-[10px] uppercase tracking-widest text-muted hover:text-accent" onClick={() => setRotateToken((v) => !v)}>
              {rotateToken ? "Keep existing" : "Rotate token"}
            </button>
          )}
        </div>
        {preset && !rotateToken ? (
          <div className="input flex items-center justify-between font-mono">
            <span>{preset.token_preview}</span>
            <span className="text-[10px] text-muted">stored encrypted</span>
          </div>
        ) : (
          <input
            type="password"
            name="token"
            required={!preset}
            className="input"
            placeholder={isClaudeRoutines ? "sk-ant-…" : "paste token — only last 4 chars visible after save"}
          />
        )}
      </div>

      {state?.error && <div className="badge badge-fail justify-center w-full"><AlertCircle size={12} /> {state.error}</div>}
      {state?.ok    && <div className="badge badge-ok  justify-center w-full"><CheckCircle2 size={12} /> Saved</div>}

      <div className="flex justify-end gap-2">
        <button type="button" className="btn" onClick={onDone}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending && <Spinner size={12} />}
          {pending ? "Saving…" : preset ? "Update preset" : "Create preset"}
        </button>
      </div>
    </form>
  );
}

// ── Preset row ────────────────────────────────────────────────────────────────

function PresetRow({ preset }: { preset: TmPreset }) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (editing) return <PresetForm preset={preset} onDone={() => setEditing(false)} />;

  const authDisplay = preset.auth_scheme
    ? `${preset.auth_header_name}: ${preset.auth_scheme} ••••`
    : `${preset.auth_header_name}: ••••`;

  return (
    <div className="panel p-4 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{preset.name}</span>
            <span className="badge font-mono text-[10px]">{preset.http_method}</span>
          </div>
          <div className="text-xs text-muted mt-0.5 truncate">{preset.target_url}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="btn" onClick={() => setExpanded((v) => !v)} title="Details">
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button className="btn" onClick={() => setEditing(true)} title="Edit"><Pencil size={12} /></button>
          <form action={deletePreset}>
            <input type="hidden" name="id" value={preset.id} />
            <button className="btn btn-danger" title="Delete"><Trash2 size={12} /></button>
          </form>
        </div>
      </div>
      {expanded && (
        <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-border text-xs">
          <Field label="Auth" value={authDisplay} mono />
          <Field label="Token" value={preset.token_preview} mono />
          {preset.request_body != null && (
            <div className="sm:col-span-2">
              <Field label="Request body" value={JSON.stringify(preset.request_body, null, 2)} mono multiline />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export function PresetsSection({ presets }: { presets: TmPreset[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <section className="panel p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeyRound size={16} className="text-accent" />
          <h2 className="text-lg font-semibold tracking-tight">Endpoint presets</h2>
          <span className="badge">{presets.length}</span>
        </div>
        <button className="btn btn-primary" onClick={() => setAdding(true)} disabled={adding}>
          <Plus size={12} /> New preset
        </button>
      </header>

      {presets.length === 0 && !adding && (
        <div className="text-sm text-muted py-6 text-center">
          No presets yet. Create one to configure an endpoint and auth token.
        </div>
      )}

      {adding && <PresetForm onDone={() => setAdding(false)} />}

      <div className="space-y-2">
        {presets.map((p) => <PresetRow key={p.id} preset={p} />)}
      </div>
    </section>
  );
}

function Field({ label, value, mono, multiline }: { label: string; value: string; mono?: boolean; multiline?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="text-muted">{label}</div>
      <div className={`${mono ? "font-mono" : ""} ${multiline ? "whitespace-pre-wrap" : "truncate"}`}>{value}</div>
    </div>
  );
}
