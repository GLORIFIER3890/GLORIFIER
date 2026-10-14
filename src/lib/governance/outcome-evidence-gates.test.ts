import {
  validateA2AConformanceEvidence,
  validatePaidDeliveryEvidence,
  validatePayingCustomerEvidence,
  validateRevenueReconciliationEvidence,
  validateRuntimeSecurityEvidence,
} from './outcome-evidence-gates';

const digest = 'a'.repeat(64);
const paid = {
  environment: 'production' as const,
  customerRef: 'customer:system-of-record:1',
  paymentIntentRef: 'intent:1',
  settlementRef: 'chain-rpc:tx:1',
  settlementIndependentlyVerified: true,
  deliveryArtifactRef: 'artifact:1',
  deliveryArtifactSha256: digest,
  customerAcceptanceRef: 'acceptance:1',
  reconciled: true,
  unexplainedVarianceMinorUnits: '0',
  evidenceBundleSha256: digest,
};
if (validatePaidDeliveryEvidence(paid) !== 'VERIFIED') throw new Error('complete paid-delivery evidence should pass');
if (validatePaidDeliveryEvidence({ ...paid, environment: 'test' }) !== 'NOT VERIFIED') throw new Error('test-mode payment must not prove production outcome');
if (validatePaidDeliveryEvidence({ ...paid, settlementIndependentlyVerified: false }) !== 'NOT VERIFIED') throw new Error('unverified payment must fail closed');
if (validatePaidDeliveryEvidence({ ...paid, unexplainedVarianceMinorUnits: '1' }) !== 'NOT VERIFIED') throw new Error('unreconciled variance must fail closed');

const customer = {
  environment: 'production' as const,
  customerRef: 'customer:1',
  onboardingCompletedRef: 'onboarding:1',
  independentlyVerifiedSettlementRef: 'settlement:1',
  deliveryAcceptanceRef: 'acceptance:1',
  evidenceBundleSha256: digest,
};
if (validatePayingCustomerEvidence(customer) !== 'VERIFIED') throw new Error('complete production paying-customer evidence should pass');
if (validatePayingCustomerEvidence({ ...customer, environment: 'staging' }) !== 'NOT VERIFIED') throw new Error('staging customer must not count as production customer');

const revenue = {
  environment: 'production' as const,
  ledgerSnapshotRef: 'ledger:1',
  authoritativeSettlementReportRef: 'provider-report:1',
  reconciliationReportRef: 'reconciliation:1',
  reconciled: true,
  unexplainedVarianceMinorUnits: '0',
  evidenceBundleSha256: digest,
};
if (validateRevenueReconciliationEvidence(revenue) !== 'VERIFIED') throw new Error('zero-variance authoritative reconciliation should pass');
if (validateRevenueReconciliationEvidence({ ...revenue, reconciled: false }) !== 'NOT VERIFIED') throw new Error('unreconciled ledger must fail closed');

const security = {
  environment: 'production' as const,
  runtimeIdentity: 'runtime:immutable-image-digest',
  defaultDenyEgressReportRef: 'report:egress',
  deniedEgressTestPassed: true,
  toolAllowlistReportRef: 'report:tools',
  unauthorizedToolDenied: true,
  auditTrailReportRef: 'report:audit',
  auditTrailComplete: true,
  operatorStopReportRef: 'report:stop',
  operatorStopPassed: true,
  evidenceBundleSha256: digest,
};
if (validateRuntimeSecurityEvidence(security) !== 'VERIFIED') throw new Error('complete runtime security evidence should pass');
if (validateRuntimeSecurityEvidence({ ...security, unauthorizedToolDenied: false }) !== 'NOT VERIFIED') throw new Error('unauthorized tool access must fail closed');

const a2a = {
  environment: 'production' as const,
  endpoint: 'https://authorized.example.invalid/a2a',
  runtimeIdentity: 'runtime:immutable-image-digest',
  suiteName: 'A2A v1.0 TCK',
  suiteVersion: 'pinned-suite-version',
  reportRef: 'artifact:a2a-report',
  reportSha256: digest,
  passed: true,
  failedTests: 0,
  skippedTests: 0,
  evidenceBundleSha256: digest,
};
if (validateA2AConformanceEvidence(a2a) !== 'VERIFIED') throw new Error('complete A2A conformance evidence should pass');
if (validateA2AConformanceEvidence({ ...a2a, skippedTests: 1 }) !== 'NOT VERIFIED') throw new Error('skipped conformance tests must not pass');
if (validateA2AConformanceEvidence({ ...a2a, reportSha256: 'not-a-digest' }) !== 'NOT VERIFIED') throw new Error('missing report integrity must fail closed');

process.stdout.write('OUTCOME_EVIDENCE_GATES_TEST_OK\\n');
