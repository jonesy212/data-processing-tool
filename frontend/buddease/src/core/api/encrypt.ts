encrypt.ts
import { encryptString } from "@/core/server/security/encryptString";

export default async function handler(req, res) {
  try {
    const { text } = req.body;
    const encrypted = encryptString(text);
    res.status(200).json({ encrypted });
  } catch (err) {
    console.error("Encryption error:", err);
    res.status(500).json({ error: "Encryption failed" });
  }
}
