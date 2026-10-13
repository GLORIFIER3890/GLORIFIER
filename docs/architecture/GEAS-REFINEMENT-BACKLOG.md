# GEAS architecture refinement backlog

Status: source and policy refinements; this document does not claim runtime controls or production outcomes are verified.

## Evidence rules
1. Source availability proves only that a URL responded.
2. Content matching is discovery evidence, not claim verification.
3. Each source-backed pattern should cite a stable URL, retrieval time, content hash, and exact supporting excerpt.
4. Source guidance does not prove GLORIFIER has implemented the pattern.
5. Runtime or deployment claims require independent runtime/deployment evidence.
6. Missing, stale, contradictory, or inaccessible evidence remains UNKNOWN.
7. No source scan or recommendation authorizes irreversible production changes.

## Five-state reconciliation
Record desired, declared, deployed, observed, and verified states separately. A comparison is valid only when both values have evidence references and timestamps. Empty evidence references must never produce ALIGNED or VERIFIED. Deployment records do not prove observed health; health telemetry does not prove a security control works.

Outcomes: ALIGNED requires all required states evidenced and matching; PARTIALLY_VERIFIED means some checks remain unresolved; DRIFT requires evidence of a policy-relevant mismatch; UNKNOWN means evidence is absent, stale, unavailable, or contradictory.

## Implementation sequence
### P0 — evidence integrity
- Replace keyword-only verification with claim-level checks tied to exact excerpts.
- Record retrieval timestamp, content hash, final URL, and source version where available.
- Keep content-matched classified as analysis; never emit claim-supported without a separate validation record.
### P0 — live drift reconciliation
- Add adapters for repository declarations, deployment metadata, runtime health, and independent tests.
- Store timestamps and evidence references per state; stale evidence is UNKNOWN, not aligned.
- Keep production mutations out of the scanner.
### P1 — protocol and identity
- Track MCP 2026-07-28 and legacy compatibility separately; track A2A against its official released specification.
- Test identity, audience/scope, delegated authority, expiry/revocation, replay protection, and least privilege.
- Do not infer conformance from adapter presence.
### P1 — reliability, security, provenance
- Correlate request, policy, model, tool, settlement, delivery, and outcome evidence with trace identifiers.
- Add SLOs, synthetic end-to-end checks, incident recovery tests, artifact digests, and build provenance.
- Test resource-level API authorization, rate limits, idempotency, and safe failure behavior.
### P1 — business outcomes
- Distinguish payment intent, independently verified settlement, delivered service, reconciled ledger, and recognized revenue.
- Report cost per verified outcome only when billing and outcome records reconcile.
- Never treat quotes, balances, or unconfirmed notifications as revenue.
### P2 — broad architecture coverage
- Maintain authoritative sources across cloud, data, networking, platform engineering, IoT, edge, blockchain, governance, and emerging technology.
- Require a named control, test, owner, freshness policy, and acceptance evidence for each promoted pattern.
- Avoid adding infrastructure without a documented requirement and measurable benefit.
## Safety invariant
GEAS may observe, test within approved boundaries, compare, prioritize, and recommend. It must not autonomously perform irreversible production changes, transfer assets, trade, or rotate credentials. Controlled automation requires separately approved policy, bounded permissions, rollback plans, and human authorization where applicable.
