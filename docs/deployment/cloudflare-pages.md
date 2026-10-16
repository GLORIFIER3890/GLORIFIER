# Cloudflare Workers frontend deployment

GLORIFIER already has a Cloudflare Worker entry point in `src/worker.ts` and configuration in `wrangler.jsonc`. Use the existing Worker at `https://glorifier.glorifier.workers.dev/` rather than creating a separate Cloudflare Pages project.

## Existing architecture

- Static frontend: Vite build output in `dist`, served through the Worker's `ASSETS` binding.
- API and authentication: `/api/*` and `/auth/*` are proxied by the Worker to the existing Railway backend.
- Database: keep the existing Neon PostgreSQL connection on the backend; never expose database credentials in frontend or Worker client-visible values.

## GitHub-connected deployment

1. In Cloudflare Dashboard, open **Workers & Pages**.
2. Select the existing `glorifier` Worker.
3. Under **Settings → Builds**, connect the `GLORIFIER7/GLORIFIER` GitHub repository if it is not already connected.
4. Configure the production branch as `main`, build command as `npm ci && npm run build:frontend` (use the repository's lockfile/install convention), and deploy command to deploy the Worker using the repository's `wrangler.jsonc` configuration. Check the current dashboard's detected settings before saving.
5. Keep secrets in Cloudflare Worker secrets or Railway environment variables, never in `VITE_*` variables.
6. Deploy a preview and test before changing any production routing.

Cloudflare's documented Git integration can build and deploy a Worker on pushes and provides preview deployments for non-production branches: https://developers.cloudflare.com/workers/ci-cd/builds/

## Verification before production

- Home page loads and static assets return the expected content types.
- Nested routes survive direct navigation and refresh.
- `/api/health` returns a valid API response rather than HTML.
- Login/logout, session cookies, protected API calls, and CORS work on mobile.
- Missing JavaScript/CSS assets return 404 rather than the SPA HTML.
- Worker logs show no upstream failures or secret leakage.

Do not disable or delete the Vercel deployment until the Cloudflare Worker is verified and a rollback path is confirmed.
