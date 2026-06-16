# AI Utils — Token Maxxer

A multi-tool AI utility suite. The first feature is **Token Maxxer** — schedule up to 5 daily cron pings to a user-configured endpoint so you "utilize 100% of your Claude" subscription.

```
ai-utils (Next.js 16 + Supabase)
└── Token Maxxer
    ├── per-user endpoint config (URL + bearer token, AES-GCM encrypted)
    ├── up to 5 routines (HH:MM @ tz, days-of-week)
    ├── manual test trigger
    └── last-30-runs history
└── (more utils later)

Cloudflare Worker (engine)
├── cron every 30 min — fires matching routines
├── /manual-test (shared-secret authenticated)
└── decrypts tokens, hits user URLs, writes history via service role
```

## Stack

- **Next.js 16** (App Router, Server Actions, `proxy.ts` — formerly `middleware.ts`)
- **Supabase** — auth (email/password + Google OAuth) and Postgres with RLS
- **Cloudflare Worker** — cron + manual-test executor
- **AES-GCM (Web Crypto)** — token encryption; only the Worker and Next.js server actions hold the key

## 1. Supabase setup

1. Create a Supabase project.
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql).
3. Auth providers:
   - **Email** is enabled by default.
   - **Google**: Authentication → Providers → Google. Add Google OAuth client id/secret. Set the redirect URL to `https://YOUR_DOMAIN/auth/callback` (and `http://localhost:3000/auth/callback` for local).
4. From Project Settings → API copy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (Worker only — never expose to browser)

## 2. Token encryption key

Generate a 32-byte AES-256 key (base64):

```bash
openssl rand -base64 32
```

Set this same value as `TOKEN_ENCRYPTION_KEY` in **both** the Next.js app and the Worker. Keep it stable — rotating it invalidates every stored token.

## 3. Next.js app

```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# TOKEN_ENCRYPTION_KEY, WORKER_URL, WORKER_SHARED_SECRET
npm run dev
```

Visit http://localhost:3000.

## 4. Cloudflare Worker

```bash
cd worker
npm install
# Set secrets (one-time):
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put TOKEN_ENCRYPTION_KEY      # same value as Next app
npx wrangler secret put WORKER_SHARED_SECRET      # any random string, also goes in Next .env

npx wrangler deploy
```

The Worker exposes:
- `POST /manual-test`  (header `x-worker-secret: $WORKER_SHARED_SECRET`, body `{ "user_id": "<uuid>" }`) — runs one execution for that user, writes a `manual` row to `tm_runs`.
- `GET /health` — returns `ok`.

Cron is configured in `wrangler.toml` as `*/30 * * * *`. Every 30 min the Worker loads all enabled routines, computes each user's local wall-clock time in their tz, and fires routines whose `time_of_day` is within ±15 minutes of the current tick.

## How the scheduling works

- The Worker ticks at minute 0 and minute 30 (UTC).
- For each enabled routine, we compute the user's local `HH:MM` and weekday using `Intl.DateTimeFormat` with the routine's IANA timezone.
- Routine fires if the weekday is in `days_of_week` AND `|local HH:MM − target HH:MM| ≤ 15 min` (wrapping around midnight).
- This tolerates half-hour tz offsets (India, Iran, Newfoundland, etc.) and small cron drift.

## Database schema (overview)

| Table         | Purpose                                                    |
| ------------- | ---------------------------------------------------------- |
| `profiles`    | 1:1 with `auth.users`, auto-populated on sign-up           |
| `tm_configs`  | One row per user: target URL, method, encrypted token, preview |
| `tm_routines` | Up to 5 per user (enforced by trigger). HH:MM + tz + days  |
| `tm_runs`     | Run history. Trimmed to last 30 per routine via trigger    |

All tables have RLS; `tm_runs` inserts come from the Worker via the service role.

## Token security

- Plaintext token is **never** written to disk and never leaves the server.
- Stored as `base64(iv ‖ ciphertext+tag)` from AES-256-GCM, with a random 12-byte IV per write.
- The UI only ever displays `••••<last 4 chars>`.
- Rotating the token requires explicitly toggling "Rotate token" in the config card.

## Adding more utilities later

The app shell already separates concerns:
- `app/(app)/dashboard` is the module hub.
- Each utility is a folder under `app/(app)/<name>/` with its own server actions.
- Add a card to `dashboard/page.tsx` and a sidebar link in `app/(app)/layout.tsx`.
