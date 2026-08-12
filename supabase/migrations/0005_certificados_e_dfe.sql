-- ============================================================
-- Masor — 0005: Certificado digital A1 + captura de DF-e (SEFAZ)
-- ADITIVA. Reusa tenant_fiscal_config (modo_captura, cert_ref, ult_nsu)
-- já criada em 0001. O certificado (.pfx) e a senha são guardados
-- CIFRADOS (AES-256-GCM na aplicação, chave em MASOR_CERT_ENC_KEY) —
-- um dump do banco sozinho não revela o certificado. As colunas guardam
-- ciphertext em base64 (iv||authTag||dados), seguro até para staff.
-- ============================================================

-- ---------- Certificado digital A1 por tenant ----------
create table if not exists public.certificados_digitais (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  empresa       text,                 -- rótulo (ex.: razão social)
  cnpj          text not null,        -- titular do certificado (metadado, não segredo)
  -- Ciphertext em base64 (text, não bytea): o PostgREST serializa bytea de forma
  -- ambígua (hex x base64) — base64 explícito elimina qualquer dúvida no round-trip.
  pfx_cifrado   text not null,        -- base64( AES-256-GCM(.pfx) ) : iv||authTag||ciphertext
  senha_cifrada text not null,        -- base64( AES-256-GCM(senha) )
  titular       text,                 -- CN extraído do certificado
  validade_ate  date,                 -- extraída no upload
  ativo         boolean not null default true,
  criado_por    uuid references auth.users(id),
  criado_em     timestamptz not null default now()
);
create index if not exists cert_dig_tenant on public.certificados_digitais(tenant_id, ativo);

alter table public.certificados_digitais enable row level security;
-- SELECT só staff (o blob é ciphertext; o segredo real depende da chave da app).
create policy certdig_sel on public.certificados_digitais for select to authenticated
  using (public.is_staff());
-- SEM policy de INSERT/UPDATE/DELETE p/ authenticated: só o service role (servidor) grava.

-- ---------- Documentos fiscais capturados (DF-e) ----------
create table if not exists public.dfe_documentos (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  nsu          text not null,          -- 15 dígitos (sequencial do AN)
  chave44      text,                   -- chave de acesso (null p/ alguns eventos)
  tipo         text not null,          -- 'resNFe' | 'procNFe' | 'resEvento' | 'procEventoNFe' | 'desconhecido'
  schema_dfe   text,                   -- schema do docZip (ex.: resNFe_v1.01)
  xml          text not null,          -- XML já descompactado
  resumo       jsonb not null default '{}', -- {emit_cnpj, emit_nome, dhEmi, vNF, ...}
  capturado_em timestamptz not null default now(),
  unique (tenant_id, nsu)              -- idempotência por NSU
);
create index if not exists dfe_docs_tenant on public.dfe_documentos(tenant_id, capturado_em desc);
create index if not exists dfe_docs_chave on public.dfe_documentos(tenant_id, chave44);

alter table public.dfe_documentos enable row level security;
create policy dfe_sel on public.dfe_documentos for select to authenticated
  using (public.is_staff() or tenant_id = public.current_tenant());
-- INSERT só service role (sem policy p/ authenticated).
