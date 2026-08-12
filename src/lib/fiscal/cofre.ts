import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/* ============================================================
   Masor — cofre de segredos (AES-256-GCM), server-side.
   Cifra o .pfx e a senha do certificado A1 antes de gravar no
   banco. A chave (32 bytes) vem de MASOR_CERT_ENC_KEY (base64);
   um dump do banco sozinho NÃO revela o certificado.
   Formato do blob: iv(12) || authTag(16) || ciphertext.
   ============================================================ */

const ALG = "aes-256-gcm";

function chave(): Buffer {
  const b64 = process.env.MASOR_CERT_ENC_KEY;
  if (!b64) throw new Error("MASOR_CERT_ENC_KEY ausente (chave de cifragem do certificado).");
  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) throw new Error("MASOR_CERT_ENC_KEY deve ter 32 bytes (base64 de 32 bytes).");
  return key;
}

/** Cifra bytes → Buffer (iv||tag||ciphertext). */
export function cifrar(dados: Buffer): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALG, chave(), iv);
  const enc = Buffer.concat([cipher.update(dados), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]);
}

/** Decifra Buffer (iv||tag||ciphertext) → bytes originais. */
export function decifrar(blob: Buffer): Buffer {
  if (blob.length < 28) throw new Error("Blob cifrado inválido.");
  const iv = blob.subarray(0, 12);
  const tag = blob.subarray(12, 28);
  const enc = blob.subarray(28);
  const decipher = createDecipheriv(ALG, chave(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]);
}

export const cifrarTexto = (s: string): Buffer => cifrar(Buffer.from(s, "utf8"));
export const decifrarTexto = (b: Buffer): string => decifrar(b).toString("utf8");

/** true se a chave de cifragem está configurada e válida (para fail-closed nas rotas). */
export function cofreConfigurado(): boolean {
  try {
    chave();
    return true;
  } catch {
    return false;
  }
}
