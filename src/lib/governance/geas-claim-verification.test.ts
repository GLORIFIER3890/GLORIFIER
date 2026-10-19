import assert from 'node:assert/strict';
import { validateClaimReview } from './geas-claim-verification';

const valid = {
  claimId: 'claim-example',
  claim: 'The standard defines a versioned interface.',
  sourceId: 'example-standard',
  canonicalSourceUrl: 'https://standards.example.org/spec',
  observedSourceUrl: 'https://standards.example.org/spec',
  observedAt: '2026-10-18T12:00:00.000Z',
  sourceContentHash: 'a'.repeat(64),
  supportingExcerpt: 'The specification defines a versioned interface.',
  reviewer: 'human-reviewer',
  decision: 'supported' as const,
  rationale: 'The cited excerpt directly supports the bounded claim.',
};

const supported = validateClaimReview(valid);
assert.equal(supported.admissible, true);
assert.match(supported.evidenceRef ?? '', /^claim-review-[a-f0-9]{24}$/);

const unreviewed = validateClaimReview({ ...valid, decision: undefined });
assert.equal(unreviewed.admissible, false);
assert.equal(unreviewed.decision, 'unknown');
assert.equal(unreviewed.evidenceRef, null);

const mismatchedHost = validateClaimReview({
  ...valid,
  observedSourceUrl: 'https://attacker.example.org/copied',
});
assert.equal(mismatchedHost.admissible, false);
assert.ok(mismatchedHost.failures.some((failure) => failure.includes('host differs')));

const badHash = validateClaimReview({ ...valid, sourceContentHash: 'not-a-hash' });
assert.equal(badHash.admissible, false);
assert.ok(badHash.failures.some((failure) => failure.includes('SHA-256')));

const insufficient = validateClaimReview({ ...valid, decision: 'insufficient' });
assert.equal(insufficient.admissible, false);
assert.equal(insufficient.decision, 'insufficient');
assert.equal(insufficient.evidenceRef, null);

const contradicted = validateClaimReview({ ...valid, decision: 'contradicted' });
assert.equal(contradicted.admissible, false);
assert.equal(contradicted.decision, 'contradicted');
assert.equal(contradicted.evidenceRef, null);

process.stdout.write('GEAS claim-review tests passed; no semantic truth is inferred automatically.\\n');
