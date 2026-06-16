// AES-GCM token decryption. Mirror of lib/crypto.ts in the Next app.
// Storage: base64( iv (12 bytes) | ciphertext+tag ).

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function decryptToken(
  ciphertextB64: string,
  keyB64: string
): Promise<string> {
  const keyRaw = b64ToBytes(keyB64);
  if (keyRaw.length !== 32) throw new Error("TOKEN_ENCRYPTION_KEY must be 32 bytes");
  const key = await crypto.subtle.importKey(
    "raw",
    keyRaw as BufferSource,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  const buf = b64ToBytes(ciphertextB64);
  const iv = buf.slice(0, 12);
  const ct = buf.slice(12);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    ct as BufferSource
  );
  return new TextDecoder().decode(pt);
}
