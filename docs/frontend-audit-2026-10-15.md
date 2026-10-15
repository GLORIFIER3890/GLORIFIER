# GLORIFIER frontend audit — evidence-based baseline

Date: 2026-10-15
Scope: public Cloudflare Workers URL, repository frontend entry point, Vite configuration, service worker, and Vercel routing configuration.

## Confirmed observations

- The Cloudflare public URL returned an HTML response in an external fetch test, but an API-related client error was visible: Unexpected token '<' ... is not valid JSON. This indicates that at least one request expected JSON but received HTML. The exact request and Worker routing source still need browser/network evidence before assigning a definitive root cause.
- The Vite entry document references /src/main.tsx, the normal development entry path. A production Vite build ordinarily rewrites this to generated assets; the live response must be inspected to verify which build is actually deployed.
- src/main.tsx installs a production service worker and wraps the app in a React error boundary. The boundary can show React render errors, but it cannot catch failures that occur before the entry module loads or all errors in asynchronous callbacks.
- public/sw.js previously returned cached index.html for any failed same-origin GET outside /api/. That can return HTML to a JavaScript, CSS, image, or font request. This is a confirmed fallback-design defect, though not yet proof it caused every blank-screen report.
- vercel.json explicitly routes /api/* and /auth/* to Railway and defines VITE_API_BASE_URL as the Railway origin. Cloudflare must have its own equivalent routing contract; Vercel rules do not configure a Workers deployment.

## Truthfulness requirements

- Do not report login, API, database, AI-provider, payment, or blockchain functions as operational unless a real request has been checked and its result is visible.
- Distinguish UI demo/sample data from server-backed, verified data.
- Show API errors as explicit unavailable/unknown states; do not parse HTML as JSON or silently substitute success-shaped sample data.
- Do not label an action completed until the server confirms it. Show pending, confirmed, failed, and unverified states separately.
- Never put secrets or tokens in browser bundles, screenshots, or public logs.

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
