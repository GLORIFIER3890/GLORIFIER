# Cloudflare Pages deployment

This repository can be deployed as a static Vite frontend on Cloudflare Pages while keeping the existing Railway API and Neon database.

## Cloudflare Pages settings

- Connect Git repository: `GLORIFIER7/GLORIFIER`
- Production branch: `main`
- Framework preset: `Vite`
- Build command: `npm run build:frontend`
- Build output directory: `dist`
- Root directory: leave blank
- Node.js version: use a version compatible with the repository's CI

The `public/_redirects` file is copied into `dist`. It proxies relative `/api/*` and `/auth/*` requests to the existing Railway backend and sends other paths to the SPA entry point.

## Environment variables

Use the same non-secret frontend configuration currently required by the app. If `VITE_API_BASE_URL` is configured, set it to:

`https://glorifier-artificial-intelligence-production.up.railway.app`

Only put public frontend values in variables prefixed with `VITE_`. Never put API keys, database credentials, session secrets, or service tokens in frontend variables.

## Safe migration checklist

1. Deploy a Cloudflare Pages preview first; do not change the production URL or DNS yet.
2. Verify the home page, direct navigation and refresh on nested routes, login/logout, `/api/health`, protected API calls, and CORS/cookie behavior on a mobile browser.
3. Check that the browser is not exposing server-only secrets and that authentication cookies work on the preview domain.
4. Confirm the preview works with the production Railway API before promoting it.
5. Switch production traffic only after successful verification. Keep Vercel available as a rollback until Cloudflare is confirmed healthy.

This configuration does not deploy or configure a Cloudflare Pages project automatically; connect the repository in the Cloudflare dashboard and verify the preview before switching traffic.
