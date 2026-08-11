// Consulta rápida no Postgres do Supabase (somente leitura recomendada).
// Uso: node scripts/sql.mjs "select ... "
import pg from "pg";
import { readFileSync } from "node:fs";

const env = (k) => {
  const t = readFileSync(new URL("../.env", import.meta.url), "utf8");
  const m = t.match(new RegExp(`^${k}="?([^"\\n]+)"?`, "m"));
  return m ? m[1] : null;
};
const q = process.argv[2];
if (!q) {
  console.error('uso: node scripts/sql.mjs "SELECT ..."');
  process.exit(1);
}
const ref = new URL(env("SUPABASE_URL")).host.split(".")[0];
const client = new pg.Client({
  connectionString: `postgresql://postgres:${env("SUPABASE_DB_PASSWORD")}@db.${ref}.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000,
});
await client.connect();
const r = await client.query(q);
console.log(JSON.stringify(r.rows, null, 2));
await client.end();
