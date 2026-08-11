# Masor (Inteligência Tributária G41) — build node-server para rodar na VPS atrás do Traefik.
# node:22-slim (glibc) + npm install fresco: evita o problema de binário nativo
# (rolldown) do lockfile gerado no Windows.
FROM node:22-slim AS build
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN NITRO_PRESET=node-server npm run build

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
