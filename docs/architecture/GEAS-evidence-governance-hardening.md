# GEAS evidence-governance hardening

## Scope of this change

This change makes the health guardian diagnostic-only and tightens the distinction between source observations and verified architecture claims.

### Implemented in this branch

- Health guardian uses read-only `contents` and `actions` permissions.
- Checkout does not persist Git credentials.
- Health-guardian remediation no longer invokes an autonomous code-writing agent.
- The self-healing entry point is diagnostic-only: it does not reset/clean the workspace, create commits, push refs, or deploy.
- Architecture evidence records classify ordinary source/keyword matches as `analysis`; only explicitly claim-supported evidence may be classified as `observed-fact`.
- Scan results include the repository revision when `GITHUB_SHA` is available, otherwise `unknown`.
- Scan summaries use `analysisPatterns` rather than implying keyword matches are verified observations.
- NIST's IoT Cybersecurity Program source points to the current official program page.

## Safety and truthfulness invariants

1. A successful source fetch is not proof that an architecture claim is true.
2. A keyword match is not proof that GLORIFIER implements the pattern.
3. Missing runtime evidence keeps drift status `unknown`; this is not a pass and not a confirmed mismatch.
4. Production and irreversible changes remain outside the architecture scanner's authority.
5. Failed integrity checks produce a diagnostic failure; they do not trigger an automatic code-writing attempt.

## Remaining work that requires runtime or repository-level evidence

- Connect the five-state model (desired, declared, deployed, observed, verified) to live, resource-specific observations before reporting actual drift.
- Add freshness and provenance validation for every runtime evidence source.
- Improve HTML extraction and claim-specific validation for sources that return HTTP 200 without a matching excerpt.
- Recheck source registry coverage and the current-head scan after this branch merges.
- Make any future automated pull-request creator idempotent by checking for an existing open PR before creating another.
- Validate required CI, runtime health, authentication boundaries, and database-backed verification before claiming production reliability.

## Acceptance checklist

- [ ] GEAS scientist tests pass.
- [ ] Typecheck and build pass.
- [ ] Workflow security review confirms no write permission or push path.
- [ ] Current-head architecture scan is generated and its revision recorded.
- [ ] Required PR checks pass.
- [ ] Human review approves merge.
- [ ] Production verification is performed separately after merge; CI alone is not treated as runtime proof.
