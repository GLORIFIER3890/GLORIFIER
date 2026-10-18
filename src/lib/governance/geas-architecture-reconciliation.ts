export type ArchitectureState = 'desired' | 'declared' | 'deployed' | 'observed' | 'verified';
export type ReconciliationStatus = 'ALIGNED' | 'PARTIALLY_VERIFIED' | 'DRIFT' | 'UNKNOWN';

export interface ReconciliationInput {
  resourceId: string;
  desired?: Record<string, unknown> | null;
  declared?: Record<string, unknown> | null;
  deployed?: Record<string, unknown> | null;
  observed?: Record<string, unknown> | null;
  verified?: Record<string, unknown> | null;
  evidenceRefs?: string[];
}

export interface ReconciliationResult {
  resourceId: string;
  status: ReconciliationStatus;
  comparedStates: ArchitectureState[];
  mismatches: Array<{ expectedState: ArchitectureState; actualState: ArchitectureState; keys: string[] }>;
  evidenceRefs: string[];
  reason: string;
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    return '{' + Object.keys(object).sort().map((key) => JSON.stringify(key) + ':' + canonical(object[key])).join(',') + '}';
  }
  return JSON.stringify(value);
}

function sharedMismatchedKeys(left: Record<string, unknown>, right: Record<string, unknown>): string[] {
  return [...new Set([...Object.keys(left), ...Object.keys(right)])].sort()
    .filter((key) => !(key in left) || !(key in right) || canonical(left[key]) !== canonical(right[key]));
}

/**
 * Reconciles only explicitly supplied snapshots. A missing state is UNKNOWN,
 * never an inferred match. Mismatch is asserted only when both snapshots and
 * traceable evidence references exist.
 */
export function reconcileArchitectureStates(input: ReconciliationInput): ReconciliationResult {
  const states: ArchitectureState[] = ['desired', 'declared', 'deployed', 'observed', 'verified'];
  const supplied = states.filter((state) => {
    const value = input[state];
    return !!value && typeof value === 'object' && !Array.isArray(value);
  });
  const evidenceRefs = [...new Set((input.evidenceRefs ?? []).filter((ref) => typeof ref === 'string' && ref.trim()))];
  const mismatches: ReconciliationResult['mismatches'] = [];

  for (let i = 1; i < states.length; i++) {
    const expectedState = states[i - 1];
    const actualState = states[i];
    const left = input[expectedState];
    const right = input[actualState];
    if (!left || !right || typeof left !== 'object' || typeof right !== 'object' || Array.isArray(left) || Array.isArray(right)) continue;
    const keys = sharedMismatchedKeys(left, right);
    if (keys.length) mismatches.push({ expectedState, actualState, keys });
  }

  let status: ReconciliationStatus;
  let reason: string;
  if (supplied.length < states.length || evidenceRefs.length === 0) {
    status = 'UNKNOWN';
    reason = supplied.length < states.length
      ? 'One or more architecture states are missing; no alignment or drift is inferred.'
      : 'Evidence references are missing; differences are not promoted to verified drift.';
  } else if (mismatches.length) {
    status = 'DRIFT';
    reason = 'Adjacent architecture states differ and evidence references were supplied; validate references before acting.';
  } else {
    status = 'ALIGNED';
    reason = 'All five supplied states match on their declared keys and evidence references are present; external verification is still required to validate those references.';
  }

  return { resourceId: input.resourceId, status, comparedStates: supplied, mismatches, evidenceRefs, reason };
}
