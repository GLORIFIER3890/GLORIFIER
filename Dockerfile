# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim

ENV NODE_ENV=production \
    PORT=3000 \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

LABEL org.opencontainers.image.title="GLORIFIER" \
      org.opencontainers.image.description="Governed intelligence orchestration for AI-powered businesses" \
      org.opencontainers.image.source="https://github.com/GLORIFIER7/GLORIFIER" \
      org.opencontainers.image.licenses="Apache-2.0"

WORKDIR /app

# Refresh Debian security updates before installing the application.
# Keep runtime dependencies required by the current TypeScript/Vite server entrypoint.
RUN apt-get update \
 && apt-get upgrade -y --no-install-recommends \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Refresh the bundled npm CLI to the maintained Node 22-compatible line;
# older npm bundles carry vulnerable pacote, sigstore, and brace-expansion copies.
RUN npm install --global npm@11.6.2 --no-audit --no-fund \
 && npm --version

# Install application dependencies from the committed lockfile.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund \
 && npm cache clean --force

COPY --chown=node:node . .

RUN npm run build \
 && chown -R node:node /app

USER node

EXPOSE 3000

# The endpoint returns 503 when a configured database is unhealthy, so the
# container health state reflects backend readiness rather than process-only liveness.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["./node_modules/.bin/tsx", "server.ts"]
