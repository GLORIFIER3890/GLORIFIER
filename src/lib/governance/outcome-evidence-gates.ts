/**
 * Fail-closed evidence gates for economic outcomes and agent runtime claims.
 *
 * These validators evaluate evidence supplied by a trusted verification pipeline.
 * They do not perform chain RPC, authenticate evidence issuers, or prove production
 * operation by themselves. Callers must verify the referenced artifacts first.
 */
export type GateStatus = 'VERIFIED' | 'NOT VERIFIED';

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
  evidenceBundleSha256: string;
}

const NON_BLANK = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const SHA256 = /^[a-f0-9]{64}$/i;
const ZERO = '0';

const validZeroVariance = (value: string): boolean => {
  // Accept only canonical non-negative integer minor/base units.
  return /^(0|[1-9]\d*)$/.test(value) && value === ZERO;
};

const validCommonEvidence = (refs: unknown[], digests: unknown[]): boolean => {
  return refs.every(NON_BLANK) && digests.every(x => typeof x === 'string' && SHA256.test(x));
};

/** Only a production evidence bundle can support a production paid-delivery claim. */
export const validatePaidDeliveryEvidence = (e: PaidDeliveryEvidence): GateStatus => {
  const refs = [e.customerRef, e.paymentIntentRef, e.settlementRef, e.deliveryArtifactRef, e.customerAcceptanceRef];
  if (!validCommonEvidence(refs, [e.deliveryArtifactSha256, e.evidenceBundleSha256])) return 'NOT VERIFIED';
  if (e.environment !== 'production' || e.settlementIndependentlyVerified !== true || e.reconciled !== true) return 'NOT VERIFIED';
  if (!validZeroVariance(e.unexplainedVarianceMinorUnits)) return 'NOT VERIFIED';
  return 'VERIFIED';
};;

export const validatePayingCustomerEvidence = (e: PayingCustomerEvidence): GateStatus => {
  const refs = [e.customerRef, e.onboardingCompletedRef, e.independentlyVerifiedSettlementRef, e.deliveryAcceptanceRef];
  if (!validCommonEvidence(refs, [e.evidenceBundleSha256])) return 'NOT VERIFIED';
  return e.environment === 'production' ? 'VERIFIED' : 'NOT VERIFIED';
};

export const validateRevenueReconciliationEvidence = (e: RevenueReconciliationEvidence): GateStatus => {
  const refs = [e.ledgerSnapshotRef, e.authoritativeSettlementReportRef, e.reconciliationReportRef];
  if (!validCommonEvidence(refs, [e.evidenceBundleSha256])) return 'NOT VERIFIED';
  if (e.environment !== 'production' || e.reconciled !== true || !validZeroVariance(e.unexplainedVarianceMinorUnits)) return 'NOT VERIFIED';
  return 'VERIFIED';
};

export const validateRuntimeSecurityEvidence = (e: RuntimeSecurityEvidence): GateStatus => {
  const refs = [e.runtimeIdentity, e.defaultDenyEgressReportRef, e.toolAllowlistReportRef, e.auditTrailReportRef, e.operatorStopReportRef];
  if (!validCommonEvidence(refs, [e.evidenceBundleSha256])) return 'NOT VERIFIED';
  if (e.environment !== 'production') return 'NOT VERIFIED';
  if (!e.deniedEgressTestPassed || !e.unauthorizedToolDenied || !e.auditTrailComplete || !e.operatorStopPassed) return 'NOT VERIFIED';
  return 'VERIFIED';
};

export const validateA2AConformanceEvidence = (e: A2AConformanceEvidence): GateStatus => {
  const refs = [e.endpoint, e.runtimeIdentity, e.suiteName, e.suiteVersion, e.reportRef];
  if (!validCommonEvidence(refs, [e.reportSha256, e.evidenceBundleSha256])) return 'NOT VERIFIED';
  if (e.environment !== 'production' || e.passed !== true) return 'NOT VERIFIED';
  if (!Number.isInteger(e.failedTests) || e.failedTests !== 0) return 'NOT VERIFIED';
  if (!Number.isInteger(e.skippedTests) || e.skippedTests !== 0) return 'NOT VERIFIED';
  return 'VERIFIED';
}
