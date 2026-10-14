# Customer Commerce and Agent Governance Release Gates

Date: 2026-10-14
Status: implementation/evidence plan; no live customer payment, delivery, revenue, containment, or A2A conformance is claimed by this document.

## Non-negotiable truth rule

Configuration, API route presence, unit tests, mock providers, a successful model response, a payment intent, a client callback, and a blockchain address are not proof of a completed paid customer outcome. Keep missing evidence at `NOT VERIFIED`. Never create a fake customer, fabricate a receipt, mark a payment settled from client input, or downgrade authorization to make a test pass.

## 1. Paid customer transaction -> accepted delivery

**Release status: NOT VERIFIED until one authorized end-to-end canary passes.**

The canary must run against a test customer and test-priced service in a non-production environment first. It must retain one correlation ID across every step:

1. Create a customer/tenant and record consent, owner/contact reference, service plan, and onboarding timestamp.
2. Create a server-side quote with currency/token, chain/network, asset contract or mint, amount in base units, expiry, and idempotency key.
3. Create the payment intent; bind it to the customer, order, deliverable, quote digest, and policy decision.
4. Require the configured authorization policy before any work with cost or external side effects begins.
5. Verify settlement independently against the authoritative provider/chain source. Validate network, asset identity, recipient, amount, confirmation/finality rule, transaction/signature, replay protection, and quote expiry. Client-supplied “paid” flags are never evidence.
6. Execute the service only after the policy-defined payment gate. Persist task/run IDs and sanitized execution evidence.
7. Store delivery artifact digest/URI, completion time, and customer acceptance or an explicitly defined acceptance timeout/dispute state.
8. Reconcile intent, settlement, delivery, invoice/ledger entry, refunds/chargebacks, and provider fees by correlation ID. Detect duplicates and unexplained differences.
9. Re-run the same request to prove idempotency; inject timeout, underpayment, wrong asset/network, duplicate transaction, reorg/failed transaction, provider outage, and delivery failure. Fail closed and do not deliver or book revenue when required evidence is missing.
10. Export a redacted evidence bundle with commit SHA, environment, run URL, timestamps, IDs, authoritative source references, artifact digests, assertions, and failure cases.

**Pass condition:** the payment is independently verified, delivery is demonstrably complete and accepted, and the ledger reconciles with zero unexplained variance. A test-mode pass is labelled TEST ONLY; it does not prove production revenue.

## 2. Customer acquisition and onboarding

**Release status: NOT VERIFIED until the deployed funnel is exercised end to end.**

Required funnel: discoverable service page -> explicit service/pricing terms -> signup/consent -> account or tenant creation -> identity/eligibility checks appropriate to the service -> onboarding completion -> first task -> support/dispute path. Record privacy-minimized stage events and conversion counts; do not put secrets or unnecessary personal data in analytics.

Acceptance checks:
- Fresh user can complete signup and onboarding on Android/mobile and desktop.
- Duplicate signup, invalid input, expired session, database outage, and email/provider outage have safe retry/recovery paths.
- Tenant data is isolated and authorization is enforced server-side.
- The user can understand the service, price, delivery expectation, refund/dispute process, and contact path before payment.
- Dashboard metrics distinguish visitors, signups, onboarded customers, activated customers, paying customers, refunds, and retained customers. Do not label test accounts or unpaid intents as paying customers.

A funnel dashboard proves activity only when backed by production analytics/system-of-record evidence; it does not alone prove revenue.

## 3. Revenue and GLR settlement reconciliation

**Release status: NOT VERIFIED until authoritative external records reconcile.**

Keep separate records for quoted, authorized, submitted, confirmed/settled, delivered, accepted, refunded/disputed, and reconciled. Ledger writes must be append-only or correction-linked, idempotent, tenant-scoped, and auditable. Store amounts as integer base units/minor units with explicit decimals and asset/network identity; never use floating-point arithmetic for settlement amounts.

Daily reconciliation should compare:
- GLORIFIER payment intents and ledger entries;
- authoritative chain/provider settlement observations;
- invoices/orders and delivery acceptance;
- refunds, chargebacks, network/provider fees, and adjustments.

Every unmatched item must be visible as an exception with owner, age, reason, and resolution evidence. Never auto-resolve by assuming success. Do not equate GLR deployment or token supply with liquidity, customer demand, stable value, or revenue. Cross-chain GLR deployments are separate assets/networks unless a separately verified bridge/settlement design proves otherwise.

## 4. Runtime containment and auditability

**Release status: NOT VERIFIED until negative and positive canary tests pass in an isolated environment.**

Before exposing tools to an agent:
- Default-deny network egress; allow only explicitly declared destinations and ports.
- Enforce a server-side tool allowlist keyed by agent/task/policy; reject unknown tools and arguments.
- Use short-lived, least-privilege credentials injected at runtime; never put secrets in Agent Cards, prompts, logs, or evidence bundles.
- Isolate filesystem/process access; apply CPU, memory, execution-time, and concurrency limits.
- Enforce authorization for each consequential action; agent/provider/model identity never grants business authority.
- Provide an operator stop/quarantine control and verify it interrupts active work where supported.
- Emit tamper-evident, correlation-ID-linked audit events for policy decision, authorization, tool request, result, denial, retry, settlement observation, delivery, and human approval. Redact secrets and sensitive payloads.
- Test both allowed and denied requests, attempted egress, prompt injection, tool escalation, timeout, worker crash, retry/replay, and audit sink failure.

**Pass condition:** retained test evidence shows denied actions were blocked, allowed canaries completed within limits, stop/quarantine worked, and audit events are complete enough to reconstruct the run. A config file alone is not containment proof.

## 5. A2A conformance and identity

**Release status: NOT VERIFIED until the actual deployed client/server adapters pass an external conformance suite.**

Run the official A2A v1.0 conformance/TCK suite against an authorized endpoint. Retain suite revision, endpoint/runtime identity, test report, skipped/unsupported tests, failures, timestamps, and artifact digest. Cover version negotiation, task lifecycle, errors, streaming/capability declarations, authentication, and replay behavior. Separately verify cryptographic Agent Card identity (trusted key, valid signature, expiry/revocation, key rotation, and TLS). A signed identity is not authorization.

Do not change `agent-network/agent-card.glorifier.json` from `NOT_VERIFIED` until evidence is reviewed and the verification contract is updated consistently. Internal unit tests or metadata validation are not external conformance.

## 6. Required evidence record

For each gate, retain:
- status and scope (TEST ONLY, STAGING, or PRODUCTION);
- repository, commit SHA, workflow/run URL, and deployment/runtime ID;
- test suite and exact version/command;
- timestamped sanitized logs and artifact SHA-256;
- authoritative payment/chain/provider references where applicable;
- passed, failed, skipped, and not-observable assertions;
- reviewer/approval and explicit exception owner.

Never commit credentials, private keys, customer personal data, raw payment secrets, or unredacted provider exports.

## Execution order

1. Add/verify deterministic unit and integration tests for intent authorization, settlement evidence, idempotency, ledger reconciliation, delivery gating, and audit events.
2. Run isolated test-mode end-to-end canary; fix all failures before any production test.
3. Validate containment with negative tests and operator stop in an isolated runtime.
4. Run external A2A conformance against an authorized endpoint.
5. After human approval, perform a low-value production canary only if lawful, funded, and supported by real payment/settlement infrastructure.
6. Review the evidence bundle before updating any status. Production revenue and customer claims remain NOT VERIFIED until actual authoritative evidence exists.

No step in this document authorizes spending, wallet signing, token transfers, production deployment, or irreversible changes.
