// Aplica uma migração SQL no Postgres do Supabase.
// Uso: node scripts/apply-migration.mjs supabase/migrations/0002_xxx.sql
// Lê SUPABASE_URL (deriva o ref) e SUPABASE_DB_PASSWORD do .env. Sem segredo no código.
import pg from "pg";
import { readFileSync } from "node:fs";

function env(key) {
  const txt = readFileSync(new URL("../.env", import.meta.url), "utf8");
  const m = txt.match(new RegExp(`^${key}="?([^"\\n]+)"?`, "m"));
  return m ? m[1] : null;
}

const file = process.argv[2];
if (!file) {
  console.error("uso: node scripts/apply-migration.mjs <caminho-da-migração.sql>");
  process.exit(1);
}
const url = env("SUPABASE_URL");
const pwd = env("SUPABASE_DB_PASSWORD");
if (!url || !pwd) {
  console.error("faltam SUPABASE_URL / SUPABASE_DB_PASSWORD no .env");
  process.exit(1);
}
const ref = new URL(url).host.split(".")[0];
const sql = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

const client = new pg.Client({
  connectionString: `postgresql://postgres:${pwd}@db.${ref}.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000,
});
try {
  await client.connect();
  await client.query(sql);
  console.log(`OK: ${file} aplicada em ${ref}.`);
} catch (e) {
  console.error(`ERRO em ${file}: ${e.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
