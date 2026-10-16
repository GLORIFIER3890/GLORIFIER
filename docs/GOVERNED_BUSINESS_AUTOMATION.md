# Governed Business Automation Contract

Status: **proposed architecture contract**. This document defines the intended cross-stack behavior; it does not claim every capability is implemented or production-verified.

## Objective

Coordinate business workflows across the GLORIFIER web app, agent runtime, provider integrations, persistent state, CI/CD, and deployment services while preserving human authority, least privilege, traceability, and truthful status reporting.

## End-to-end control path

1. **Intake** — accept a business goal and identify the authenticated principal, tenant/workspace, requested capability, data scope, deadline, and risk class.
2. **Policy decision** — evaluate identity, role, tenant boundaries, capability allowlist, budget/quota, data classification, and approval requirements before invoking an agent or tool.
3. **Plan** — produce a versioned plan with explicit steps, expected side effects, dependencies, timeout, retry policy, compensation strategy, and success criteria.
4. **Authorize** — issue a short-lived, task-scoped capability. Require explicit human approval for external commitments, production writes, publishing, spending, legal/financial decisions, or irreversible actions.
5. **Execute** — dispatch only approved steps through the A2A task API and MCP/tool adapters. Enforce idempotency keys, bounded retries, timeouts, rate limits, circuit breakers, and cancellation.
6. **Verify** — independently check outputs against acceptance criteria and authoritative service state. A provider response alone is not proof that a business outcome occurred.
7. **Persist evidence** — store task state, policy decision, plan/version, actor/provider identity, tool/action receipts, timestamps, redacted errors, verification results, and approval references in durable storage.
8. **Reconcile** — detect incomplete, duplicated, stale, or contradictory operations; retry only safe idempotent steps, otherwise pause for human review.
9. **Report** — return the outcome, evidence references, costs/usage when available, unresolved risks, and a truthful status label to the UI and monitoring.
10. **Learn safely** — use failures and metrics to propose improvements through a reviewed pull request; do not let the learning loop silently change policies or production behavior.

## Canonical task lifecycle

`RECEIVED → POLICY_CHECKED → PLANNED → AWAITING_APPROVAL (when required) → RUNNING → VERIFYING → SUCCEEDED | FAILED | NEEDS_HUMAN | CANCELLED`

Every transition must be validated server-side and recorded. Terminal states are immutable; corrections create a new event or reconciliation record. Repeated requests must not repeat side effects when the same idempotency key is supplied.

## Cross-architecture responsibilities

| Layer | Required responsibility |
|---|---|
| Web / Vercel | Show authenticated task state, approvals, evidence, and errors; never be the authority for policy or final task state. |
| API / Railway | Authenticate and authorize every request; bind caller identity and tenant to each task; validate transitions and enforce limits. |
| Agent orchestration | Produce bounded plans, dispatch least-privilege tools, honor cancellation, and surface uncertainty instead of fabricating success. |
| MCP / external tools | Use explicit tool allowlists, scoped credentials, validated inputs/outputs, and auditable action receipts. |
| A2A / specialist agents | Propagate task ID, caller authority, policy context, deadlines, and trace/correlation IDs; reject missing or downgraded authority. |
| Neon / persistence | Persist task/event/evidence records transactionally where possible; enforce tenant scoping and retention; never log raw secrets. |
| CI / GitHub | Run deterministic tests and security checks; propose code changes as PRs; never bypass branch protection or required checks. |
| Vercel / Railway deployments | Deploy only through configured, reviewed release workflows; verify health after deployment; provide rollback/stop conditions. |
| GLR / settlement adapters | Verify chain, asset, recipient, amount, freshness, and transaction finality from authoritative sources; never treat an agent claim as settlement evidence. |
| Monitoring / guardian | Observe availability, latency, policy denials, queue age, retries, provider quotas, and evidence completeness; alert and open remediation work rather than mutating production blindly. |

## Risk tiers and autonomy

- **Tier 0 — Observe:** health checks, metrics, read-only discovery, summaries. May run on schedule with no side effects.
- **Tier 1 — Reversible internal work:** draft reports, classify tickets, prepare plans, or stage artifacts. Automated execution is permitted only with bounded permissions and auditable output.
- **Tier 2 — External or production mutation:** send messages, publish content, alter business records, change infrastructure, or modify access. Require explicit policy authorization and human approval unless a separately reviewed policy grants a narrow, reversible exception.
- **Tier 3 — High-impact / irreversible:** transfer funds, trade assets, deploy contracts, rotate production credentials, sign legal terms, delete critical data, or make binding commitments. Human approval and independent verification are mandatory; no autonomous execution by default.

Human approval must bind to the exact action summary, target, amount/scope, expiry, and plan hash. Any material plan change invalidates the approval.

## Reliability and security invariants

- No authenticated principal or tenant may be inferred from a user-supplied task payload.
- Never forward credentials to untrusted origins; secrets are injected only server-side and are redacted from logs.
- Fail closed when identity, policy, budget, approval, or authoritative verification is unavailable.
- Do not report `SUCCEEDED` until independent postcondition checks pass. Otherwise use `NEEDS_HUMAN`, `FAILED`, or `NOT_VERIFIED`.
- Retries are bounded and limited to idempotent or explicitly compensated operations.
- Enforce per-tenant concurrency, rate, time, and cost limits; stop dispatch when limits are exceeded.
- Every tool call must have a correlation ID, policy decision, actor identity, and redacted result receipt.
- Keep production data and credentials out of prompts, artifacts, issue comments, and pull-request logs.
- A provider outage or exhausted quota must produce a visible degraded state, not a fabricated fallback result.
- Automation may not approve its own high-risk action, its own pull request, or its own release gate.

## Required verification before claiming production readiness

1. Regression tests for task lifecycle transitions, tenant isolation, identity binding, policy denials, approval expiry, plan-hash changes, cancellation, and replay/idempotency.
2. Negative tests proving unauthenticated and cross-tenant writes are rejected.
3. Integration tests proving evidence records correspond to authoritative service state.
4. Fault tests for provider timeout/quota exhaustion, database unavailability, duplicate delivery, partial completion, and reconciliation.
5. End-to-end tests across the web client, API, agent/tool adapters, persistence, and monitoring.
6. Security review of secrets, scopes, network destinations, SSRF boundaries, prompt injection, tool allowlists, and audit-log redaction.
7. Post-deployment health and rollback checks with evidence attached to the exact commit and deployment.

## Rollout sequence

1. **Inventory:** map current routes, workers, tables, providers, workflows, secrets, and deployed service URLs to the responsibilities above.
2. **Close critical gaps:** identity/tenant binding, server-side policy gates, durable task state, idempotency, audit evidence, and fail-closed behavior.
3. **Prove behavior:** add focused unit, integration, and end-to-end regression tests before enabling additional automation.
4. **Shadow mode:** compute plans and policy decisions without external side effects; compare with human decisions.
5. **Limited pilot:** enable Tier 0–1 for one workflow and tenant with quotas, alerts, and a kill switch.
6. **Expand by evidence:** increase scope only after measured reliability and security gates pass; retain human approval for Tier 2–3.

## Current implementation status

This contract is a target and verification checklist, not evidence that all layers already satisfy it. Each item must be linked to code, tests, runtime evidence, and the exact commit before being marked **VERIFIED**. Missing evidence means **UNKNOWN / NOT VERIFIED**.
