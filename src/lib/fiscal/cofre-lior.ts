import { createHash, createDecipheriv } from "node:crypto";

/* ============================================================
   Masor — decifrador dos certificados A1 do LIOR.
   Espelha EXATAMENTE o esquema da edge function `cliente-certificado`
   do Lior (supabase/functions/cliente-certificado/index.ts):
     - chave = SHA-256(utf8(CERT_MASTER_KEY))  → 32 bytes
     - AES-256-GCM, IV de 12 bytes
     - o ARQUIVO no bucket é o ciphertext CRU (sem a tag)
     - iv (cifra_iv) e tag (cifra_auth_tag) vêm em COLUNAS base64
     - a senha idem (senha_cifrada / senha_iv / senha_auth_tag)
   Assim o Masor reusa o e-CNPJ que o cliente já subiu no Lior, sem
   re-upload. Nunca logar PFX/senha.
   ============================================================ */

function masterKey(): Buffer {
  const raw = process.env.CERT_MASTER_KEY;
  if (!raw) throw new Error("CERT_MASTER_KEY ausente (chave dos certificados do Lior).");
  return createHash("sha256").update(raw, "utf8").digest(); // 32 bytes
}

/** true se a chave dos certificados do Lior está configurada (fail-closed nas rotas). */
export function certLiorConfigurado(): boolean {
  return !!process.env.CERT_MASTER_KEY;
}

/** Decifra um blob AES-256-GCM com iv/tag em base64 (esquema do Lior). */
function decifrar(ciphertext: Buffer, ivB64: string, tagB64: string): Buffer {
  const key = masterKey();
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const d = createDecipheriv("aes-256-gcm", key, iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(ciphertext), d.final()]);
}

/** Decifra o arquivo .pfx (ciphertext cru do bucket). */
export function decifrarArquivoLior(ciphertext: Buffer, cifra_iv: string, cifra_auth_tag: string): Buffer {
  return decifrar(ciphertext, cifra_iv, cifra_auth_tag);
}

/** Decifra a senha (ciphertext em base64 na coluna senha_cifrada). */
export function decifrarSenhaLior(senha_cifrada: string, senha_iv: string, senha_auth_tag: string): string {
  return decifrar(Buffer.from(senha_cifrada, "base64"), senha_iv, senha_auth_tag).toString("utf8");
}
