// clientEncrypt.ts
frontend/security/clientEncrypt.ts
export async function encryptStringClient(text: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key.padEnd(32, "0")).slice(0, 32), // 256-bit key
    { name: "AES-CBC" },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(16));

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    cryptoKey,
    data
  );

  const encryptedBytes = new Uint8Array(encryptedBuffer);
  const combined = new Uint8Array(iv.length + encryptedBytes.length);
  combined.set(iv);
  combined.set(encryptedBytes, iv.length);

  return btoa(String.fromCharCode(...combined));
}
