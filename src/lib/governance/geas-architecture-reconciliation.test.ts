import assert from 'node:assert/strict';
import { reconcileArchitectureStates } from './geas-architecture-reconciliation';

const aligned = { version: 1, region: 'test' };
const base = {
  resourceId: 'test-resource',
  desired: aligned,
  declared: aligned,
  deployed: aligned,
  observed: aligned,
  verified: aligned,
  evidenceRefs: ['evidence:deployment-test-1'],
};

assert.equal(reconcileArchitectureStates(base).status, 'ALIGNED');
assert.equal(reconcileArchitectureStates({ ...base, observed: undefined }).status, 'UNKNOWN');
assert.equal(reconcileArchitectureStates({ ...base, evidenceRefs: [] }).status, 'UNKNOWN');

const drift = reconcileArchitectureStates({
  ...base,
  observed: { version: 2, region: 'test' },
});
assert.equal(drift.status, 'DRIFT');
assert.ok(drift.mismatches.some((mismatch) => mismatch.expectedState === 'deployed' && mismatch.actualState === 'observed' && mismatch.keys.includes('version')));

const keyOrder = reconcileArchitectureStates({
  ...base,
  desired: { region: 'test', version: 1 },
  declared: { version: 1, region: 'test' },
  deployed: { region: 'test', version: 1 },
  observed: { version: 1, region: 'test' },
  verified: { region: 'test', version: 1 },
});
assert.equal(keyOrder.status, 'ALIGNED');

process.stdout.write('GEAS five-state reconciliation tests passed.\\n');
