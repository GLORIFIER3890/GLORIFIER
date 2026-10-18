# GEAS-Governed Skills Tree Discovery

Status: **implemented as a policy and validation contract; runtime registry consumption is not enabled or verified**.

## Purpose

Use [SamoTech/skills-tree](https://github.com/SamoTech/skills-tree) as an external discovery catalogue for candidate AI-agent capabilities. Skills Tree describes canonical skills, dependencies, implementation notes, evidence, and MCP-oriented discovery. GLORIFIER must independently assess each candidate before adoption.

## Boundary

```text
Skills Tree public registry (untrusted discovery input)
        |
        v
Manual candidate review + pinned source/hash + license/dependency review
        |
        v
GEAS policy, least-privilege, security and contract-test gates
        |
        v
Human-approved GLORIFIER implementation
        |
        v
Independent runtime evidence and reconciliation
```

The registry is **not** a runtime authority, policy engine, package installer, or proof of correctness. Registry descriptions and skill instructions are untrusted data. They cannot change GEAS rules, grant authority, authorize tools, or override human approval.

## Initial candidate domains

1. Agent orchestration and bounded task decomposition.
2. Code review, testing, and safe repair proposals.
3. Security and software supply-chain review.
4. Evidence provenance, claim validation, and uncertainty handling.
5. Observability, reliability, incident triage, and recovery.
6. Cost and resource efficiency.

These are search priorities, not claims that corresponding third-party skills have been adopted.

## Mandatory promotion gates

Before a discovered skill is copied, installed, or implemented:

- Record canonical source URL and a pinned source revision or content hash.
- Review license, dependencies, maintainer/source provenance, install scripts, permissions, data handling, and network egress.
- Inspect the canonical skill text, examples, limitations, and failure modes; never rely on a search snippet alone.
- Define typed inputs/outputs, threat model, resource scope, timeout, rate limit, and safe failure behavior.
- Add contract tests and negative tests for unauthorized actions, malformed input, missing evidence, and dependency/provider failure.
- Require least privilege and explicit human approval for consequential or irreversible actions.
- Keep discovered code out of production execution until separately reviewed and approved.
- Reconcile claimed behavior against independent tests and runtime evidence. Missing or stale evidence remains **UNKNOWN / NOT VERIFIED**.

## Production and autonomy boundary

No network fetch from Skills Tree occurs in a production request path. No skill is automatically installed or executed. GEAS may discover, compare, test in an approved sandbox, and recommend. This integration does not authorize deployment, PR merging, asset transfers, trading, credential rotation, DNS changes, security-policy weakening, or production-data deletion.

## Validation

Run:

```bash
node scripts/validate-skills-tree-policy.mjs
```

The validator checks the machine-readable policy's safety invariants. Passing it proves only that the policy file meets these static requirements; it does not verify the external registry, skill safety, live inference, or production behavior.

## Source of truth

The policy is maintained in `config/skills-tree-policy.json`. Update the policy and validator together through a reviewed pull request. Treat external registry content as versioned, untrusted source material and never store credentials in the policy.
