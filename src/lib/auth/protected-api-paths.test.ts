import assert from 'node:assert/strict';
import { isProtectedApiReadPath } from './protected-api-paths';

const protectedPaths = [
  '/api/economy/glr/intents',
  '/API/ECONOMY/GLR/INTENTS',
  '/api/Economy/glr/intents/intent-123',
  '/API/economy/GLR/INTENTS/intent-123',
  '/api/economy/glr/intents/intent-123/',
  '/api/payouts',
  '/API/AUTH/SESSION',
];

for (const path of protectedPaths) {
  assert.equal(
    isProtectedApiReadPath(path.replace(/^\/api/i, '')),
    true,
    `expected protected path to match regardless of case: ${path}`,
  );
}

for (const path of [
  '/economy/glr/intents-export',
  '/economy/glr/intent',
  '/economy/glr/intentss/intent-123',
  '/economy/glr',
  '/public/status',
]) {
  assert.equal(isProtectedApiReadPath(path), false, `unexpected protected-path match: ${path}`);
}

console.log('protected API path case-insensitivity regression tests passed');
