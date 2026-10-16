# GLORIFIER FULL-STACK VERIFICATION MATRIX — HISTORICAL SNAPSHOT

Historical live verification: 2026-10-01. This matrix is not current production proof; use docs/CI-STATUS-CHECK-CONVENTION.md for status meanings and required evidence, and refresh each row with a new live check before claiming current verification.

Historical evidence recorded on 2026-10-01 (not a current production assertion):
- The 2026-10-01 report recorded the Vercel deployment as READY for main commit ad4d8b59af26d8d7349af5a3249e716a998b9175.
- The 2026-10-01 report recorded an HTTP 200 from the Vercel frontend.
- The 2026-10-01 report recorded HTTP 200 from the Vercel-to-Railway /api/health rewrite, database=ok, and OpenAI/Gemini credentials configured.
- The 2026-10-01 report recorded HTTP 200 from /api/runtime-verification?probeAi=true and a Gemini probe response of GLORIFIER_RUNTIME_PROBE_OK.
- The 2026-10-01 report recorded /api/auth/status as configured for Firebase ID-token and revocation checks.
- The 2026-10-01 report recorded Railway production services as SUCCESS.

Status meanings: Use the canonical vocabulary in [docs/CI-STATUS-CHECK-CONVENTION.md](CI-STATUS-CHECK-CONVENTION.md). Do not maintain a separate local status list.

| Component | Status | Evidence / remaining proof |
|---|---|---|
| Frontend build | VERIFIED | Historical 2026-10-01 report: Vercel deployment was recorded READY; not current evidence. |
| Railway backend | VERIFIED | Historical 2026-10-01 report: backend deployment was recorded SUCCESS and health returned 200; not current evidence. |
| Permanent orchestrator | VERIFIED | Historical 2026-10-01 report: orchestrator deployment was recorded SUCCESS; not current evidence. |
| Vercel deployment | VERIFIED | Historical 2026-10-01 report: deployment was recorded READY; not current evidence. |
| Browser -> Railway API rewrites | VERIFIED | Historical 2026-10-01 report: Vercel /api/health reached Railway; not current evidence. |
| Firebase authentication configuration | VERIFIED | Historical 2026-10-01 report: /api/auth/status reported Firebase ID-token + revocation-check configuration; not current evidence. |
| Firebase authenticated browser E2E | PARTIALLY VERIFIED | Production authenticated browser traversal still requires the disposable-account Chromium workflow to complete successfully. |
| Neon persistence | VERIFIED | Historical 2026-10-01 report: runtime verification reported database=ok and app-state/evidence initialization; not current evidence. |
| Binance authenticated read-only | PARTIALLY VERIFIED | Server-side signed verification and read-only guard exist; a qualifying live private-account response is still required. |
| Binance safety | VERIFIED | Read-only guard and server-side secret handling are implemented. |
| AI provider registry / AI CEO | VERIFIED | Historical 2026-10-01 report: production runtime probe executed through the provider registry; not current evidence. |
| Gemini | VERIFIED | Historical 2026-10-01 report: Gemini inference probe returned the expected response; not current evidence. |
| OpenAI | PARTIALLY VERIFIED | Credential is configured, but this run did not execute an OpenAI-specific inference probe. |
| Revenue / monetization | PARTIALLY VERIFIED | Evidence-first settlement rules are implemented; real external payment/settlement evidence is still required before verified revenue can be recorded. |
| Error/loading/empty states | PARTIALLY VERIFIED | Core API/runtime paths verified; broad authenticated browser traversal remains. |
| Mobile navigation / responsive UI | PARTIALLY VERIFIED | Responsive components exist; device/browser traversal remains. |
| Persistent state after refresh | PARTIALLY VERIFIED | Database persistence is live; authenticated user refresh/re-login remains an E2E proof requirement. |
| CI/CD | VERIFIED | Historical 2026-10-01 description of CI/CD paths; not evidence of current deployment health. |
| Full major-module browser traversal | PARTIALLY VERIFIED | Chromium workflow exists and covers major modules; successful production authenticated E2E evidence is still required. |
| Overall full-stack | PARTIALLY VERIFIED | Infrastructure and real provider inference are now live-verified; authenticated E2E, Binance private-account evidence, and external settlement evidence remain. |

## FULLY VERIFIED gate

Do not label GLORIFIER FULLY VERIFIED until all applicable rows are VERIFIED and no required external provider is DEGRADED.

Economic truth rule:
- Estimates are not revenue.
- Market value is not revenue.
- A configured credential is not proof of successful execution.
- Authentication configuration is not proof of a successful authenticated user session.
- A connected asset provider is not proof of asset ownership.
- Only qualifying external payment/settlement evidence can create VERIFIED_REVENUE.