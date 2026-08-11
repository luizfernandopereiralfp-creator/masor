# Masor (Inteligência Tributária G41) — build node-server para rodar na VPS atrás do Traefik.
# node:22-slim (glibc) + npm install fresco: evita o problema de binário nativo
# (rolldown) do lockfile gerado no Windows.
FROM node:22-slim AS build
WORKDIR /app

# Variáveis PÚBLICAS do cliente: precisam existir no MOMENTO DO BUILD porque o
# Vite as "assa" no bundle (import.meta.env.VITE_*). Sem elas o cliente sobe com
# "Auth não configurada". A URL e a publishable key são públicas por natureza.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN NITRO_PRESET=node-server npm run build

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0
# .output do nitro node-server é auto-contido (deps embutidas em _libs) — não precisa node_modules.
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
