import assert from 'node:assert/strict';
import { createAuthenticatedPayerIntent, resolveAuthenticatedPayer } from './payer-identity';

assert.deepEqual(
  resolveAuthenticatedPayer(undefined, 'payer-a'),
  { ok: false, status: 401, error: 'Authenticated payer identity required' },
  'missing authenticated identity must fail closed',
);

assert.deepEqual(
  resolveAuthenticatedPayer('firebase-uid-a'),
  { ok: true, payerAgentId: 'firebase-uid-a' },
  'payer must default to the authenticated principal',
);

assert.deepEqual(
  resolveAuthenticatedPayer('firebase-uid-a', ' firebase-uid-a '),
  { ok: true, payerAgentId: 'firebase-uid-a' },
  'a matching payer value with surrounding whitespace must normalize to the principal',
);

assert.deepEqual(
  resolveAuthenticatedPayer('firebase-uid-a', 'firebase-uid-b'),
  { ok: false, status: 403, error: 'Payer identity must match the authenticated principal' },
  'a caller must not choose another payer',
);

assert.deepEqual(
  resolveAuthenticatedPayer('firebase-uid-a', 123),
  { ok: true, payerAgentId: 'firebase-uid-a' },
  'non-string payer input must never override the authenticated principal',
);

console.log('GLR payer identity binding regression tests passed');

void (async () => {
  const capturedInputs: Record<string, unknown>[] = [];
  const created = await createAuthenticatedPayerIntent(
    'firebase-uid-a',
    { payerAgentId: 'attacker-selected-payer', amount: '5', memo: 'test' },
    async (input) => {
      capturedInputs.push(input);
      return { id: 'intent-test', truthStatus: 'NOT_SETTLED' };
    },
  );
  assert.deepEqual(
    created,
    { ok: false, status: 403, error: 'Payer identity must match the authenticated principal' },
    'mismatched payer must be rejected before intent persistence',
  );
  assert.equal(capturedInputs.length, 0, 'persistence must not run for a mismatched payer');

  const valid = await createAuthenticatedPayerIntent(
    'firebase-uid-a',
    { amount: '5', memo: 'test' },
    async (input) => {
      capturedInputs.push(input);
      return { id: 'intent-test', truthStatus: 'NOT_SETTLED' };
    },
  );
  assert.ok(valid.ok, 'matching authenticated payer may create an intent');
  assert.equal(capturedInputs[0]?.payerAgentId, 'firebase-uid-a',
    'persisted payer must be derived from authenticated identity');
  assert.equal(capturedInputs[0]?.amount, '5', 'other validated intent fields must be preserved');
  console.log('GLR authenticated intent creation boundary tests passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
