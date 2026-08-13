#!/usr/bin/env node
/* ============================================================
   Masor — runner dos testes de regressão (sem framework).

   Bundla os módulos puros (motor fiscal, cofre, envelope, parser
   DF-e) com esbuild para uma pasta temporária e roda as suítes.

       npm run test

   Não substitui teste de integração com a SEFAZ (que exige
   certificado A1 real), mas prova toda a lógica determinística.
   ============================================================ */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const saida = path.join(raiz, ".test-build");

rmSync(saida, { recursive: true, force: true });
mkdirSync(saida, { recursive: true });

const alvos = [
  "src/lib/ia/motor-fiscal.ts",
  "src/lib/fiscal/cofre.ts",
  "src/lib/fiscal/cofre-lior.ts",
  "src/lib/fiscal/envelope.ts",
  "src/lib/fiscal/dfe-parser.ts",
];

console.log("• bundling módulos…");
// --outdir relativo: o caminho absoluto do projeto tem espaços e quebra com shell:true no Windows.
execFileSync(
  "npx",
  ["--yes", "esbuild", ...alvos, "--bundle", "--format=esm", "--platform=node", "--outdir=.test-build"],
  { cwd: raiz, stdio: ["ignore", "ignore", "inherit"], shell: process.platform === "win32" },
);

let falhou = false;
for (const suite of ["testar-motor.mjs", "testar-fiscal.mjs"]) {
  console.log(`\n=== ${suite} ===`);
  try {
    execFileSync(process.execPath, [path.join(raiz, "scripts", suite)], { cwd: raiz, stdio: "inherit" });
  } catch {
    falhou = true;
  }
}

rmSync(saida, { recursive: true, force: true });
process.exit(falhou ? 1 : 0);
