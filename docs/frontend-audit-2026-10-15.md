# GLORIFIER frontend audit — evidence-based baseline

Date: 2026-10-15
Scope: public Cloudflare Workers URL, repository frontend entry point, Vite configuration, service worker, and Vercel routing configuration.

## Confirmed observations

- A live read-only mobile browser test on 2026-10-15 confirmed the Cloudflare production URL renders the shell but 13 dynamic API sections fail: `/api/reports/summary`, public asset quotes, business model, work-unit summary, monetization dashboard, valuation, economic OS, BI architecture, revenue control plane, and asset verification all receive the SPA HTML document instead of JSON. The browser records `Unexpected token '<'` JSON parse errors. This is a confirmed production API-routing/deployment defect, not a blank-screen failure.
- The Vite entry document references /src/main.tsx, the normal development entry path. A production Vite build ordinarily rewrites this to generated assets; the live response must be inspected to verify which build is actually deployed.
- src/main.tsx installs a production service worker and wraps the app in a React error boundary. The boundary can show React render errors, but it cannot catch failures that occur before the entry module loads or all errors in asynchronous callbacks.
- public/sw.js previously returned cached index.html for any failed same-origin GET outside /api/. That can return HTML to a JavaScript, CSS, image, or font request. This is a confirmed fallback-design defect, though not yet proof it caused every blank-screen report.
- vercel.json explicitly routes /api/* and /auth/* to Railway and defines VITE_API_BASE_URL as the Railway origin. Vercel rules do not configure Cloudflare. This branch now adds src/worker.ts and configures wrangler.jsonc to send /api/* and /auth/* through an explicit Railway proxy before static-asset fallback; this is proposed code pending preview validation, not a claim about the current production Worker.
- A live GET to `https://glorifier-artificial-intelligence-production.up.railway.app/api/reports/summary` returned HTTP 200 with `application/json` and an `ok: true` envelope. The same path on the Cloudflare Worker returned HTTP 200 `text/html` with the GLORIFIER SPA. This confirms the deployed Cloudflare route is not currently applying the intended API proxy for this request; it does not prove every Railway endpoint is healthy.

## Truthfulness requirements

- Do not report login, API, database, AI-provider, payment, or blockchain functions as operational unless a real request has been checked and its result is visible.
- Distinguish UI demo/sample data from server-backed, verified data.
- Show API errors as explicit unavailable/unknown states; do not parse HTML as JSON or silently substitute success-shaped sample data.
- Do not label an action completed until the server confirms it. Show pending, confirmed, failed, and unverified states separately.
- Never put secrets or tokens in browser bundles, screenshots, or public logs.

## Changes proposed in the preview branch

- Add a static startup fallback in index.html so a failed JavaScript module does not leave an empty white root; it reports that backend/account status was not checked.
- Correct the React error boundary so it does not claim backend reachability without evidence.
- Add a frontend guard that turns HTML returned for /api/* into an explicit 502 JSON error rather than a confusing JSON parse exception.
- Add an explicit Cloudflare Worker proxy for /api/* and /auth/* to the existing Railway backend; unknown backend routes stay backend responses instead of being treated as successful SPA pages.
- Display a persistent evidence notice because several modules initialize from local sample values.
- Replace seeded sample earnings, pending payouts, buyer offers, connected accounts, incident reports, and claimed bounty transactions with empty/unverified initial states.
- Disable the scientist-fleet simulator and synthetic bounty-claim routes until real work verification and provider-confirmed settlement are implemented.
- Require human approval for all payout requests and disable autonomous payout-request creation by default.
- Load payout availability from the backend's verified ledger and label created payout requests as pending, not settled.
- Treat privacy controls and epsilon values as configuration only; do not display a calculated privacy-protection score as an attested result.
- Return an explicit 404 when Cloudflare's SPA fallback returns HTML for a missing static asset, and a 502 JSON error when an API path returns HTML.
- Restrict service-worker cleanup to the one known legacy cache, avoiding deletion of other caches that happen to share a prefix.

## Safe rebuild acceptance gates

1. Build succeeds from a clean checkout with the repository lockfile and supported Node version.
2. Preview-only deploy; production domain and DNS remain unchanged.
3. Smoke tests verify the HTML document, JS/CSS MIME types, SPA navigation, /api/health, /auth/*, and unknown /api/* behavior.
4. Browser tests check initial load, no uncaught startup exceptions, no HTML returned for JS/CSS/JSON requests, and readable offline/error states.
5. Accessibility checks cover keyboard focus, labels, contrast, and reduced motion.
6. API contracts are explicit and typed; non-2xx responses and invalid JSON produce truthful UI states.
7. Existing governance, auth, and database workflows are preserved until separately reviewed; no production data migrations or irreversible actions in a frontend-only rebuild.
8. Promote only after review and all required checks pass.

## Current limitations

This is a targeted audit based on the files and external responses inspected so far, not a claim that every component, API route, or browser/device has been exhaustively tested. The service-worker change in this branch is a focused safety repair, not a full frontend redesign.
