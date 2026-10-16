# Datasette Evidence Explorer Integration

## Decision

Datasette is an optional, isolated evidence-exploration component. It is not part of the GLORIFIER request path and must not replace the Vercel frontend, Railway API, or Neon/PostgreSQL system of record.

The supplied upstream URL (`https://github.com/simonw/datasette/deployments/release`) did not expose a verifiable deployment record during review. Therefore, this change does not claim that an upstream deployment is active, does not copy upstream secrets or environment settings, and does not depend on an unverified release artifact.

## Intended data flow

1. A dedicated, reviewed export job selects explicitly approved, non-sensitive operational evidence.
2. The job writes a disposable SQLite snapshot (for example, selected CI summaries, release metadata, and verification outcomes).
3. Datasette serves that snapshot as a read-only explorer in an isolated environment.
4. Source links point back to GitHub for the authoritative workflow run, commit, PR, or release.
5. Missing, stale, or uncollected evidence is displayed as unknown/not verified; it is never converted to success.

Do not expose the production Neon database directly to Datasette. Do not export secrets, tokens, credentials, private keys, user personal data, raw environment variables, private customer payloads, or unrestricted logs.

## Security and deployment requirements

- Keep the explorer disabled until an owner explicitly enables a deployment.
- Require authentication at the hosting/proxy layer before any non-public evidence is accessible.
- Enable and configure Datasette's own application-layer authentication/authorization (including its supported authentication plugin or equivalent access-control mechanism); proxy authentication is defense in depth, not the sole control.
- Test direct service access and proxy-bypass scenarios. If the deployment platform exposes the application port or direct origin, application-layer authentication must still deny unauthorized access.
- Bind local development to loopback only; do not expose an unauthenticated port on a public interface.
- Mount the generated SQLite snapshot read-only and keep write/edit plugins disabled.
- Use a verified, pinned Datasette version/image; review its release notes and image provenance before upgrading.
- Run the service as a non-root user where supported, apply resource limits, and keep the service isolated from the GLORIFIER API network and secrets.
- Do not add Datasette to the main application container or its production request path.
- Retain source provenance, snapshot generation time, export version, and a digest so stale or altered snapshots can be detected.
- Define retention and deletion policy for snapshots; avoid storing unnecessary historical data.
- Require CI/security checks and human review before enabling production access.

## Initial implementation boundary

This documentation-only integration establishes the architecture and safety gates. It intentionally does not add a Python runtime, Docker service, deployment workflow, database export job, credentials, or production route. Those require a separately reviewed implementation with concrete evidence schemas and hosting/authentication decisions.

## Acceptance checklist for a future implementation

- [ ] Approved schema and allowlist of exported fields
- [ ] Export job emits only sanitized records and a source timestamp
- [ ] Automated test proves secrets and disallowed fields are excluded
- [ ] SQLite snapshot opens read-only and cannot mutate the source system
- [ ] Datasette version/image is pinned and provenance reviewed
- [ ] Authentication and authorization tested from an unauthenticated client at both the hosting/proxy layer and the Datasette application layer; confirm Datasette's own auth mechanism is active and enforced
- [ ] Direct-origin and proxy-bypass access denied for unauthenticated clients
- [ ] Public network exposure checked and denied by default
- [ ] CI, dependency, container, and security checks pass on the exact commit
- [ ] Operator verifies the deployed URL and health independently
- [ ] Evidence explorer labels stale/missing records as unknown, not verified
