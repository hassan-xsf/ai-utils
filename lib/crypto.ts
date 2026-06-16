import "server-only";

// AES-GCM token encryption. Key is a 32-byte value, base64-encoded in env.
// Stored format: base64( iv (12 bytes) | ciphertext | tag ).
// (Web Crypto's AES-GCM appends the auth tag to the ciphertext, so we just
// store iv || output.)

function getKeyBytes() {
  const b64 = process.env.TOKEN_ENCRYPTION_KEY;
  if (!b64) throw new Error("TOKEN_ENCRYPTION_KEY not set");
  const raw = Buffer.from(b64, "base64");
  if (raw.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY must decode to 32 bytes (AES-256)");
  }
  return raw;
}

async function importKey() {
  return crypto.subtle.importKey(
    "raw",
    getKeyBytes(),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptToken(plaintext: string): Promise<string> {
  const key = await importKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(plaintext)
    )
  );
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv, 0);
  out.set(ct, iv.length);
  return Buffer.from(out).toString("base64");
}

export async function decryptToken(b64: string): Promise<string> {
  const key = await importKey();
  const buf = Buffer.from(b64, "base64");
  const iv = buf.subarray(0, 12);
  const ct = buf.subarray(12);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(pt);
}

export function tokenPreview(token: string): string {
  const last4 = token.slice(-4);
  return `••••${last4}`;
}
