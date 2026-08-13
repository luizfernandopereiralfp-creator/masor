#!/usr/bin/env bash
# Masor — deploy na VPS. Chamado pelo GitHub Actions (SSH) a cada push em main,
# ou manualmente: bash /root/masor/deploy.sh
# Mesmo padrão do Lior: git pull + rebuild do container atrás do Traefik.
set -euo pipefail

cd /root/masor

echo "▶ git pull"
git fetch --all --prune
git reset --hard origin/main

# As VITE_* (públicas) precisam existir no BUILD. O docker-compose lê o .env
# ao lado dele para interpolar tanto build.args quanto o environment de runtime.
if [ ! -f .env ]; then
  echo "✖ .env ausente em /root/masor — copie de .env.production.example e preencha." >&2
  exit 1
fi

echo "▶ docker compose up -d --build"
docker compose up -d --build

echo "▶ prune de imagens antigas"
docker image prune -f >/dev/null 2>&1 || true

echo "✔ deploy concluído"
docker compose ps
