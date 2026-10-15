/**
 * Fail-closed evidence gates for economic outcomes and agent runtime claims.
 *
 * These validators evaluate caller-supplied evidence. They do not fetch chain
 * data, authenticate issuers, or independently prove production operation.
 */
export type EvidenceStatus =
  | 'MISSING'
  | 'UNKNOWN'
  | 'PARTIAL'
  | 'FAILED'
  | 'CONTRADICTED'
  | 'VERIFIED';

export interface EvidenceOutcome {
  status: EvidenceStatus;
  reason: string;
  evidenceRefs: string[];
  provenance: {
    validator: string;
    environment: string | null;
    evidenceBundleSha256: string | null;
    source: 'caller-supplied; references not independently fetched here';
  };
}

export interface PaidDeliveryEvidence {
  environment: 'test' | 'staging' | 'production';
  customerRef: string;
  paymentIntentRef: string;
  settlementRef: string;
  settlementIndependentlyVerified: boolean;
  deliveryArtifactRef: string;
  deliveryArtifactSha256: string;
  customerAcceptanceRef: string;
  reconciled: boolean;
  unexplainedVarianceMinorUnits: string;
  evidenceBundleSha256: string;
}

export interface PayingCustomerEvidence {
  environment: 'test' | 'staging' | 'production';
  customerRef: string;
  onboardingCompletedRef: string;
  independentlyVerifiedSettlementRef: string;
  deliveryAcceptanceRef: string;
  evidenceBundleSha256: string;
}

export interface RevenueReconciliationEvidence {
  environment: 'test' | 'staging' | 'production';
  ledgerSnapshotRef: string;
  authoritativeSettlementReportRef: string;
  reconciliationReportRef: string;
  reconciled: boolean;
  unexplainedVarianceMinorUnits: string;
  evidenceBundleSha256: string;
}

export interface RuntimeSecurityEvidence {
  environment: 'test' | 'staging' | 'production';
  runtimeIdentity: string;
  defaultDenyEgressReportRef: string;
  deniedEgressTestPassed: boolean;
  toolAllowlistReportRef: string;
  unauthorizedToolDenied: boolean;
  auditTrailReportRef: string;
  auditTrailComplete: boolean;
  operatorStopReportRef: string;
  operatorStopPassed: boolean;
  evidenceBundleSha256: string;
}

export interface A2AConformanceEvidence {
  environment: 'test' | 'staging' | 'production';
  endpoint: string;
  runtimeIdentity: string;
  suiteName: string;
  suiteVersion: string;
  reportRef: string;
  reportSha256: string;
  passed: boolean;
  failedTests: number;
  skippedTests: number;
  executedTests: number;
  requiredTests: number;
  evidenceBundleSha256: string;
}

const NON_BLANK = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const SHA256 = /^[a-f0-9]{64}$/i;

interface ValidationInput {
  validator: string;
  environment: unknown;
  refs: unknown[];
  digests: unknown[];
  evidenceBundleSha256: unknown;
  contradictions?: string[];
  failures?: string[];
  partials?: string[];
}

const outcome = (input: ValidationInput): EvidenceOutcome => {
  const evidenceRefs = input.refs.filter(NON_BLANK);
  let status: EvidenceStatus;
  let reason: string;
  const missingCount = input.refs.length - evidenceRefs.length;

  if (evidenceRefs.length === 0) {
    status = 'MISSING';
    reason = 'No evidence references were supplied.';
  } else if (missingCount > 0) {
    status = 'PARTIAL';
    reason = `Evidence is incomplete: ${missingCount} required reference(s) are missing.`;
  } else if (input.digests.some(d => typeof d !== 'string' || !SHA256.test(d))) {
    status = 'UNKNOWN';
    reason = 'One or more evidence digests are missing or invalid; integrity cannot be established.';
  } else if (typeof input.evidenceBundleSha256 !== 'string' || !SHA256.test(input.evidenceBundleSha256)) {
    status = 'UNKNOWN';
    reason = 'The evidence bundle digest is missing or invalid.';
  } else if (input.environment !== 'production') {
    status = 'CONTRADICTED';
    reason = 'Non-production evidence cannot establish a production outcome.';
  } else if (input.contradictions?.length) {
    status = 'CONTRADICTED';
    reason = input.contradictions.join(' ');
  } else if (input.failures?.length) {
    status = 'FAILED';
    reason = input.failures.join(' ');
  } else if (input.partials?.length) {
    status = 'PARTIAL';
    reason = input.partials.join(' ');
  } else {
    status = 'VERIFIED';
    reason = 'All declared evidence checks passed; external references still require independent verification by the caller.';
  }

  return {
    status,
    reason,
    evidenceRefs,
    provenance: {
      validator: input.validator,
      environment: typeof input.environment === 'string' ? input.environment : null,
      evidenceBundleSha256: typeof input.evidenceBundleSha256 === 'string' ? input.evidenceBundleSha256 : null,
      source: 'caller-supplied; references not independently fetched here'
    }
  };
};

const zeroVariance = (value: unknown): boolean =>
  typeof value === 'string' && /^(0|[1-9]\d*)$/.test(value) && value === '0';

export const validatePaidDeliveryEvidence = (e: PaidDeliveryEvidence): EvidenceOutcome =>
  outcome({
    validator: 'paid-delivery',
    environment: e.environment,
    refs: [e.customerRef, e.paymentIntentRef, e.settlementRef, e.deliveryArtifactRef, e.customerAcceptanceRef],
    digests: [e.deliveryArtifactSha256],
    evidenceBundleSha256: e.evidenceBundleSha256,
    contradictions: zeroVariance(e.unexplainedVarianceMinorUnits) ? [] : ['Unexplained settlement variance is non-zero or malformed.'],
    failures: e.settlementIndependentlyVerified === false ? ['Settlement was not independently verified.'] : [],
    partials: e.reconciled === true && e.settlementIndependentlyVerified === true ? [] : ['Settlement reconciliation or independent verification is incomplete.']
  });

export const validatePayingCustomerEvidence = (e: PayingCustomerEvidence): EvidenceOutcome =>
  outcome({
    validator: 'paying-customer',
    environment: e.environment,
    refs: [e.customerRef, e.onboardingCompletedRef, e.independentlyVerifiedSettlementRef, e.deliveryAcceptanceRef],
    digests: [],
    evidenceBundleSha256: e.evidenceBundleSha256
  });

export const validateRevenueReconciliationEvidence = (e: RevenueReconciliationEvidence): EvidenceOutcome =>
  outcome({
    validator: 'revenue-reconciliation',
    environment: e.environment,
    refs: [e.ledgerSnapshotRef, e.authoritativeSettlementReportRef, e.reconciliationReportRef],
    digests: [],
    evidenceBundleSha256: e.evidenceBundleSha256,
    contradictions: zeroVariance(e.unexplainedVarianceMinorUnits) ? [] : ['Unexplained ledger variance is non-zero or malformed.'],
    partials: e.reconciled === true ? [] : ['Ledger reconciliation is incomplete.']
  });

export const validateRuntimeSecurityEvidence = (e: RuntimeSecurityEvidence): EvidenceOutcome =>
  outcome({
    validator: 'runtime-security',
    environment: e.environment,
    refs: [e.runtimeIdentity, e.defaultDenyEgressReportRef, e.toolAllowlistReportRef, e.auditTrailReportRef, e.operatorStopReportRef],
    digests: [],
    evidenceBundleSha256: e.evidenceBundleSha256,
    failures: [
      ...(e.deniedEgressTestPassed === false ? ['Default-deny egress test failed.'] : []),
      ...(e.unauthorizedToolDenied === false ? ['Unauthorized tool access was not denied.'] : []),
      ...(e.auditTrailComplete === false ? ['Audit trail is incomplete.'] : []),
      ...(e.operatorStopPassed === false ? ['Operator stop test failed.'] : [])
    ],
    partials: [
      ...(e.deniedEgressTestPassed === true ? [] : ['Default-deny egress evidence is incomplete.']),
      ...(e.unauthorizedToolDenied === true ? [] : ['Tool-allowlist evidence is incomplete.']),
      ...(e.auditTrailComplete === true ? [] : ['Audit-trail evidence is incomplete.']),
      ...(e.operatorStopPassed === true ? [] : ['Operator-stop evidence is incomplete.'])
    ]
  });

export const validateA2AConformanceEvidence = (e: A2AConformanceEvidence): EvidenceOutcome =>
  outcome({
    validator: 'a2a-conformance',
    environment: e.environment,
    refs: [e.endpoint, e.runtimeIdentity, e.suiteName, e.suiteVersion, e.reportRef],
    digests: [e.reportSha256],
    evidenceBundleSha256: e.evidenceBundleSha256,
    failures: [
      ...(e.passed === false ? ['Conformance suite reported failure.'] : []),
      ...(Number.isInteger(e.failedTests) && e.failedTests > 0 ? [`Conformance suite reported ${e.failedTests} failed test(s).`] : []),
      ...(Number.isInteger(e.skippedTests) && e.skippedTests > 0 ? [`Conformance suite skipped ${e.skippedTests} test(s).`] : [])
    ],
    partials: [
      ...(!Number.isInteger(e.requiredTests) || e.requiredTests <= 0 ? ['Required test-suite coverage is not declared.'] : []),
      ...(!Number.isInteger(e.executedTests) || e.executedTests <= 0 ? ['No executed-test coverage is evidenced.'] : []),
      ...(Number.isInteger(e.requiredTests) && e.requiredTests > 0 && e.executedTests !== e.requiredTests ? ['Executed tests do not cover every required suite case.'] : []),
      ...(e.passed === true && e.failedTests === 0 && e.skippedTests === 0 ? [] : ['Conformance result is incomplete.'])
    ]
  });
