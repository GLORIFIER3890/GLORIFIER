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
if (validatePaidDeliveryEvidence(paid).status !== 'VERIFIED') throw new Error('complete paid-delivery evidence should pass');
if (validatePaidDeliveryEvidence({ ...paid, environment: 'test' }).status !== 'CONTRADICTED') throw new Error('test-mode payment must not prove production outcome');
if (validatePaidDeliveryEvidence({ ...paid, settlementIndependentlyVerified: false }).status !== 'FAILED') throw new Error('unverified payment must fail closed');
if (validatePaidDeliveryEvidence({ ...paid, unexplainedVarianceMinorUnits: '1' }).status !== 'CONTRADICTED') throw new Error('unreconciled variance must be contradicted');
if (validatePaidDeliveryEvidence({ ...paid, customerRef: '' }).status !== 'PARTIAL') throw new Error('missing reference must preserve partial status');
if (validatePaidDeliveryEvidence({ ...paid, evidenceBundleSha256: 'not-a-digest' }).status !== 'UNKNOWN') throw new Error('invalid bundle digest must be unknown');
if (validatePaidDeliveryEvidence({ ...paid, customerRef: '', paymentIntentRef: '', settlementRef: '', deliveryArtifactRef: '', customerAcceptanceRef: '' }).status !== 'MISSING') throw new Error('no evidence references must be missing');

const customer = {
  environment: 'production' as const,
  customerRef: 'customer:1',
  onboardingCompletedRef: 'onboarding:1',
  independentlyVerifiedSettlementRef: 'settlement:1',
  deliveryAcceptanceRef: 'acceptance:1',
  evidenceBundleSha256: digest,
};
if (validatePayingCustomerEvidence(customer).status !== 'VERIFIED') throw new Error('complete production paying-customer evidence should pass');
if (validatePayingCustomerEvidence({ ...customer, environment: 'staging' }).status !== 'CONTRADICTED') throw new Error('staging customer must not count as production customer');

const revenue = {
  environment: 'production' as const,
  ledgerSnapshotRef: 'ledger:1',
  authoritativeSettlementReportRef: 'provider-report:1',
  reconciliationReportRef: 'reconciliation:1',
  reconciled: true,
  unexplainedVarianceMinorUnits: '0',
  evidenceBundleSha256: digest,
};
if (validateRevenueReconciliationEvidence(revenue).status !== 'VERIFIED') throw new Error('zero-variance authoritative reconciliation should pass');
if (validateRevenueReconciliationEvidence({ ...revenue, reconciled: false }).status !== 'PARTIAL') throw new Error('unreconciled ledger must remain partial');
if (validateRevenueReconciliationEvidence({ ...revenue, unexplainedVarianceMinorUnits: '1' }).status !== 'CONTRADICTED') throw new Error('variance must be contradicted');

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
if (validateRuntimeSecurityEvidence(security).status !== 'VERIFIED') throw new Error('complete runtime security evidence should pass');
if (validateRuntimeSecurityEvidence({ ...security, unauthorizedToolDenied: false }).status !== 'FAILED') throw new Error('unauthorized tool access must fail closed');

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
  executedTests: 12,
  requiredTests: 12,
  evidenceBundleSha256: digest,
};
if (validateA2AConformanceEvidence(a2a).status !== 'VERIFIED') throw new Error('complete A2A conformance evidence should pass');
if (validateA2AConformanceEvidence({ ...a2a, skippedTests: 1 }).status !== 'FAILED') throw new Error('skipped conformance tests must not pass');
if (validateA2AConformanceEvidence({ ...a2a, reportSha256: 'not-a-digest' }).status !== 'UNKNOWN') throw new Error('missing report integrity must be unknown');
if (validateA2AConformanceEvidence({ ...a2a, executedTests: 0, requiredTests: 12 }).status !== 'PARTIAL') throw new Error('zero failures with no executed-test coverage must not verify');
if (validateA2AConformanceEvidence({ ...a2a, executedTests: 11, requiredTests: 12 }).status !== 'PARTIAL') throw new Error('partial suite coverage must not verify');

process.stdout.write('OUTCOME_EVIDENCE_GATES_TEST_OK\n');
