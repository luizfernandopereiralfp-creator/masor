# Deploy do Masor (VPS + Traefik)

Runbook turnkey. Mesmo padrão do serviço `lior` (que já roda em produção na mesma VPS):
rede Docker externa `root_default`, Traefik com `certresolver=mytlschallenge`, TLS
automático. Só muda o Host (`masor.g41one.com.br`) e a porta interna (3000).

## Pré-requisitos (já existentes na VPS)
- Docker + Docker Compose.
- Traefik rodando, conectado à rede externa `root_default`, com o resolver ACME
  `mytlschallenge` configurado (é o mesmo que o `lior` usa — não precisa criar nada).
- DNS: `masor.g41one.com.br` → **A record** apontando para o IP da VPS. Confirme:
  ```bash
  dig +short masor.g41one.com.br
  ```
  Precisa devolver o IP da VPS antes de subir (o Traefik só emite o certificado
  Let's Encrypt quando o DNS já resolve).

## Passo a passo

1. **Clonar/atualizar o repositório na VPS**
   ```bash
   git clone https://github.com/luizfernandopereiralfp-creator/masor.git
   cd masor
   # atualizações futuras:  git pull origin main
   ```

2. **Criar o `.env` de produção** (ao lado do `docker-compose.yml`)
   ```bash
   cp .env.production.example .env
   nano .env   # preencher com os valores reais
   ```
   Valores (os públicos são a URL do Supabase + publishable key; os secretos são o
   token do n8n e, se um dia usado, o service role):
   - `VITE_SUPABASE_URL` / `SUPABASE_URL` = `https://jkerqallbmozlnttffsi.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY` = publishable key do projeto
   - `MASOR_ANALISE_WEBHOOK_URL` = `https://n8n.ferpereira.com/webhook/masor-analise-fiscal`
   - `MASOR_WEBHOOK_TOKEN` = token do Header Auth configurado no n8n

   > **Por que as `VITE_*` também entram aqui:** o Vite "assa" essas duas no bundle do
   > cliente **durante o build**. O compose as passa como `build.args` pro Dockerfile.
   > Sem elas o site sobe, mas o login mostra "Auth não configurada".

3. **Subir**
   ```bash
   docker compose up -d --build
   ```
   O build roda dentro da imagem (node:22-slim, `npm install` fresco — evita o binário
   nativo do rolldown gerado no Windows) e o runtime serve `.output/server/index.mjs`
   na porta 3000, que o Traefik publica em HTTPS no Host configurado.

4. **Verificar**
   ```bash
   docker compose logs -f masor          # deve mostrar "Listening on http://localhost:3000"
   curl -I https://masor.g41one.com.br/entrar   # 200 (pode levar ~30s p/ emitir o cert na 1ª vez)
   ```

## Atualizações (deploy de uma nova versão)
```bash
cd masor && git pull origin main && docker compose up -d --build
```

## O que este deploy NÃO faz (fazer separado, no Supabase / Lovable-independente)
Este projeto Supabase (`jkerqallbmozlnttffsi`) é **próprio** (não é Lovable). As migrações
já foram aplicadas via `node scripts/apply-migration.mjs <arquivo>` a partir da máquina de
dev (conexão direta `db.jkerqallbmozlnttffsi.supabase.co:5432`). Novas migrações seguem o
mesmo caminho — **não** há CLI do Supabase configurado na VPS.

- Migrações novas: rodar `scripts/apply-migration.mjs` (aditivas apenas).
- n8n: o workflow `masor-analise-fiscal` precisa estar ativo em `n8n.ferpereira.com` com a
  credencial Anthropic e o Header Auth batendo com `MASOR_WEBHOOK_TOKEN`.

## Troubleshooting
- **502 no Traefik**: container não subiu ou porta errada. `docker compose logs masor`.
- **"Auth não configurada" no login**: `VITE_*` não estavam no `.env` no momento do
  `--build`. Corrigir o `.env` e `docker compose up -d --build` de novo (rebuild).
- **Cert não emite**: DNS ainda não resolve pro IP da VPS, ou a porta 80 não está livre
  pro desafio ACME. Conferir `dig +short masor.g41one.com.br`.
- **Análise fiscal falha (502/timeout na consulta)**: webhook do n8n fora do ar ou token
  divergente. Testar o webhook direto e conferir `MASOR_WEBHOOK_TOKEN`.
