# Deploy do Masor (VPS + Traefik)

Runbook turnkey. Mesmo padrão do serviço `lior` (que já roda em produção na mesma VPS):
rede Docker externa `root_default`, Traefik com `certresolver=mytlschallenge`, TLS
automático. Só muda o Host (`masor.g41one.com.br`) e a porta interna (3000).

## Pré-requisitos (já existentes na VPS)
- Docker + Docker Compose.
- Traefik rodando, conectado à rede externa `root_default`, com o resolver ACME
  `mytlschallenge` configurado (é o mesmo que o `lior` usa — não precisa criar nada).
- DNS: `masor.g41one.com.br` → **A record** apontando para o IP da VPS.

  > **PENDÊNCIA (verificado neste run):** `masor.g41one.com.br` ainda **NÃO resolve**
  > (domínio inexistente). O `lior.g41one.com.br` — mesmo padrão, já em produção — aponta
  > para **`103.199.186.202`** (o IP da VPS). **Ação do Fernando:** criar no DNS do
  > `g41one.com.br` um registro **A `masor` → `103.199.186.202`** (mesmo IP do `lior`).
  > O deploy só emite o certificado TLS depois que isso propagar.

  Confirme antes de subir:
  ```bash
  dig +short masor.g41one.com.br    # precisa devolver 103.199.186.202
  ```

## Auto-deploy (GitHub Actions) — preparo ÚNICO

Depois de configurado, **todo push em `main` publica sozinho** (mesmo padrão do Lior):
o Actions entra na VPS por SSH e roda `/root/masor/deploy.sh` (`git pull` + rebuild).

Preparo único (uma vez só):
1. **Na VPS**, clonar em `/root/masor` e criar o `.env` (passos 1 e 2 abaixo).
2. **No GitHub** (repo `masor`) → Settings → Secrets and variables → Actions → New
   repository secret: **`VPS_SSH_KEY`** = a mesma chave privada usada pelo Lior
   (`~/.ssh/github_deploy` da VPS, ou o valor do secret `VPS_SSH_KEY` do repo do Lior).
   > Dica: dá para promover a org-level secret e compartilhar com os dois repos.
3. **DNS** criado (registro A `masor` → `103.199.186.202`).
4. Pronto: cada push em `main` dispara o deploy. Também dá para rodar manualmente em
   **Actions → Deploy Masor na VPS → Run workflow**.

## Passo a passo (preparo na VPS / deploy manual)

1. **Clonar/atualizar o repositório na VPS** (em `/root/masor`, para casar com o Actions)
   ```bash
   git clone https://github.com/luizfernandopereiralfp-creator/masor.git /root/masor
   cd /root/masor
   # atualizações futuras (o Actions faz isso sozinho):  bash deploy.sh
   ```

2. **Criar o `.env` de produção** (ao lado do `docker-compose.yml`)
   ```bash
   cp .env.production.example .env
   nano .env   # preencher com os valores reais
   ```
   Valores:
   - `VITE_SUPABASE_URL` / `SUPABASE_URL` = `https://jkerqallbmozlnttffsi.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY` = publishable key do projeto
   - `MASOR_ANALISE_WEBHOOK_URL` = `https://n8n.ferpereira.com/webhook/masor-analise-fiscal`
   - `MASOR_WEBHOOK_TOKEN` = token do Header Auth configurado no n8n
   - `SUPABASE_SERVICE_ROLE_KEY` = **obrigatório para a captura de NF-e (SEFAZ)** —
     grava certificado cifrado e DFe. Supabase > Settings > API > service_role (secret).
   - `MASOR_CERT_ENC_KEY` = **obrigatório para o certificado A1** — chave AES-256 (32 bytes
     base64). Gere a sua: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
     Nunca versionar; trocá-la exige recifrar os certificados já guardados.
   - `NFE_TP_AMB` = `1` (produção) ou `2` (homologação)
   - (opcional) `MASOR_CHAT_WEBHOOK_URL` = webhook n8n do chat livre da IA (sem ele, a
     caixa de IA ainda resolve os comandos de apresentação localmente).

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
