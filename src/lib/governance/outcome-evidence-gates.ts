/**
 * Fail-closed evidence gates for economic outcomes and agent runtime claims.
 *
 * These validators evaluate evidence supplied by a trusted verification pipeline.
 * They do not perform chain RPC, authenticate evidence issuers, or prove production
 * operation by themselves. Callers must verify the referenced artifacts first.
 */
export type GateStatus = 'VERIFIED' | 'NOT VERIFIED';

export interface GateResult {
  status: GateStatus;
  failedChecks: string[];
  evidenceBundleSha256: string;
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
  settlementIndependentlyVerified: boolean;
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

const validZeroVariance = (value: string): boolean =>
  /^(0|[1-9]\d*)$/.test(value) && value === ZERO;

const validCommonEvidence = (refs: unknown[], digests: unknown[]): boolean =>
  refs.every(NON_BLANK) && digests.every(x => typeof x === 'string' && SHA256.test(x));

const isZeroInteger = (value: number): boolean => Number.isInteger(value) && value === 0;

/** Preserve named failed predicates and the evidence-bundle digest with every decision. */
const result = (evidenceBundleSha256: string, checks: Array<[string, boolean]>): GateResult => {
  const failedChecks = checks.filter(([, passed]) => !passed).map(([name]) => name);
  return {
    status: failedChecks.length === 0 ? 'VERIFIED' : 'NOT VERIFIED',
    failedChecks,
    evidenceBundleSha256,
  };
};

/** Only a production evidence bundle can support a production paid-delivery claim. */
export const validatePaidDeliveryEvidence = (e: PaidDeliveryEvidence): GateResult => {
  const refs = [e.customerRef, e.paymentIntentRef, e.settlementRef, e.deliveryArtifactRef, e.customerAcceptanceRef];
  return result(e.evidenceBundleSha256, [
    ['references_and_digests_valid', validCommonEvidence(refs, [e.deliveryArtifactSha256, e.evidenceBundleSha256])],
    ['production_environment', e.environment === 'production'],
    ['settlement_independently_verified', e.settlementIndependentlyVerified === true],
    ['delivery_reconciled', e.reconciled === true],
    ['zero_unexplained_variance', validZeroVariance(e.unexplainedVarianceMinorUnits)],
  ]);
};

/**
 * The settlement reference is only a locator. This gate additionally requires an
 * explicit upstream verification flag; it does not independently query a settlement provider.
 */
export const validatePayingCustomerEvidence = (e: PayingCustomerEvidence): GateResult => {
  const refs = [e.customerRef, e.onboardingCompletedRef, e.independentlyVerifiedSettlementRef, e.deliveryAcceptanceRef];
  return result(e.evidenceBundleSha256, [
    ['references_and_digest_valid', validCommonEvidence(refs, [e.evidenceBundleSha256])],
    ['production_environment', e.environment === 'production'],
    ['settlement_independently_verified', e.settlementIndependentlyVerified === true],
  ]);
};

export const validateRevenueReconciliationEvidence = (e: RevenueReconciliationEvidence): GateResult => {
  const refs = [e.ledgerSnapshotRef, e.authoritativeSettlementReportRef, e.reconciliationReportRef];
  return result(e.evidenceBundleSha256, [
    ['references_and_digest_valid', validCommonEvidence(refs, [e.evidenceBundleSha256])],
    ['production_environment', e.environment === 'production'],
    ['reconciled', e.reconciled === true],
    ['zero_unexplained_variance', validZeroVariance(e.unexplainedVarianceMinorUnits)],
  ]);
};

export const validateRuntimeSecurityEvidence = (e: RuntimeSecurityEvidence): GateResult => {
  const refs = [e.runtimeIdentity, e.defaultDenyEgressReportRef, e.toolAllowlistReportRef, e.auditTrailReportRef, e.operatorStopReportRef];
  return result(e.evidenceBundleSha256, [
    ['references_and_digest_valid', validCommonEvidence(refs, [e.evidenceBundleSha256])],
    ['production_environment', e.environment === 'production'],
    ['denied_egress_test_passed', e.deniedEgressTestPassed === true],
    ['unauthorized_tool_denied', e.unauthorizedToolDenied === true],
    ['audit_trail_complete', e.auditTrailComplete === true],
    ['operator_stop_passed', e.operatorStopPassed === true],
  ]);
};

export const validateA2AConformanceEvidence = (e: A2AConformanceEvidence): GateResult => {
  const refs = [e.endpoint, e.runtimeIdentity, e.suiteName, e.suiteVersion, e.reportRef];
  return result(e.evidenceBundleSha256, [
    ['references_and_digests_valid', validCommonEvidence(refs, [e.reportSha256, e.evidenceBundleSha256])],
    ['production_environment', e.environment === 'production'],
    ['conformance_suite_passed', e.passed === true],
    ['zero_failed_tests', isZeroInteger(e.failedTests)],
    ['zero_skipped_tests', isZeroInteger(e.skippedTests)],
  ]);
};
