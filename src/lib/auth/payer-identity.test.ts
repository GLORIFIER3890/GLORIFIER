import assert from 'node:assert/strict';
import { resolveAuthenticatedPayer } from './payer-identity';

assert.deepEqual(
  resolveAuthenticatedPayer(undefined, 'payer-a'),
  { ok: false, status: 401, error: 'Authenticated payer identity required' },
  'missing authenticated identity must fail closed',
);

assert.deepEqual(
  resolveAuthenticatedPayer('firebase-uid-a', undefined),
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
