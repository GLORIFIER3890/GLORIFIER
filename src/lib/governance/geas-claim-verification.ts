/**
 * Claim-level evidence admission for GEAS.
 *
 * Source availability, keyword matches, and model-generated summaries are not
 * claim verification. Only an explicit human review record can admit a claim
 * as supported. This module validates the structure/provenance of that record;
 * it does not decide whether the claim is semantically true.
 */
import { createHash } from 'node:crypto';

export type ClaimReviewDecision = 'supported' | 'contradicted' | 'insufficient';

export interface ClaimReviewRecord {
  claimId: string;
  claim: string;
  sourceId: string;
  canonicalSourceUrl: string;
  observedSourceUrl: string;
  observedAt: string;
  sourceContentHash: string;
  supportingExcerpt: string;
  reviewer: string;
  decision: ClaimReviewDecision;
  rationale: string;
}

export interface ClaimReviewResult {
  admissible: boolean;
  decision: ClaimReviewDecision | 'unknown';
  evidenceRef: string | null;
  failures: string[];
}

/** Deterministic structural gate; never promotes an unreviewed claim. */
export function validateClaimReview(record: Partial<ClaimReviewRecord>): ClaimReviewResult {
  const failures: string[] = [];
  const required: Array<keyof ClaimReviewRecord> = [
    'claimId', 'claim', 'sourceId', 'canonicalSourceUrl', 'observedSourceUrl',
    'observedAt', 'sourceContentHash', 'supportingExcerpt', 'reviewer', 'decision', 'rationale',
  ];
  for (const key of required) {
    if (typeof record[key] !== 'string' || !(record[key] as string).trim()) {
      failures.push(`missing required field: ${key}`);
    }
  }

  const safeHttps = (value: unknown): URL | null => {
    if (typeof value !== 'string') return null;
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password ? url : null;
    } catch {
      return null;
    }
  };
  const canonical = safeHttps(record.canonicalSourceUrl);
  const observed = safeHttps(record.observedSourceUrl);
  if (!canonical) failures.push('canonicalSourceUrl must be HTTPS without credentials');
  if (!observed) failures.push('observedSourceUrl must be HTTPS without credentials');
  if (canonical && observed && canonical.hostname !== observed.hostname) {
    failures.push('observed source host differs from the curated canonical source host');
  }
  if (typeof record.observedAt === 'string' && !Number.isFinite(Date.parse(record.observedAt))) {
    failures.push('observedAt must be a valid timestamp');
  }
  if (typeof record.sourceContentHash === 'string' && !/^[a-f0-9]{64}$/i.test(record.sourceContentHash)) {
    failures.push('sourceContentHash must be a SHA-256 hex digest');
  }
  if (record.decision !== 'supported' && record.decision !== 'contradicted' && record.decision !== 'insufficient') {
    failures.push('decision must be an explicit reviewer decision');
  }
  if (typeof record.claim === 'string' && typeof record.supportingExcerpt === 'string'
      && record.claim.trim() && record.supportingExcerpt.trim()
      && record.supportingExcerpt.length > 12000) {
    failures.push('supportingExcerpt exceeds the 12,000 character review limit');
  }

  const admissible = failures.length === 0 && record.decision === 'supported';
  const evidenceRef = failures.length === 0
    ? 'claim-review-' + createHash('sha256').update(JSON.stringify({
        claimId: record.claimId,
        sourceId: record.sourceId,
        canonicalSourceUrl: record.canonicalSourceUrl,
        observedAt: record.observedAt,
        sourceContentHash: record.sourceContentHash,
        supportingExcerpt: record.supportingExcerpt,
        reviewer: record.reviewer,
        decision: record.decision,
      })).digest('hex').slice(0, 24)
    : null;

  return {
    admissible,
    decision: failures.length ? 'unknown' : record.decision!,
    evidenceRef,
    failures,
  };
}
