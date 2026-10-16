import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const server = readFileSync('server.ts', 'utf8');

// Guard the route wiring itself, not only the standalone identity helper. These
// contract assertions fail if a future edit removes middleware or the final
// authenticated-payer override from the actual Express routes.
assert.match(
  server,
  /app\.get\('\/api\/economy\/glr\/intents',\s*requireOwnerOrInternalService,/,
  'listing payment intents must require owner or authenticated internal-service authorization',
);
assert.match(
  server,
  /app\.get\('\/api\/economy\/glr\/intents\/:id',\s*requireOwnerOrInternalService,/,
  'reading a payment intent must require owner or authenticated internal-service authorization',
);
assert.match(
  server,
  /app\.post\('\/api\/economy\/glr\/intents',\s*requireAuthentication,/,
  'creating a payment intent must require authentication',
);
assert.match(
  server,
  /resolveAuthenticatedPayer\(auth\?\.uid,\s*req\.body\?\.payerAgentId\)/,
  'creation must resolve the payer from the authenticated identity',
);
assert.match(
  server,
  /payerAgentId:\s*payer\.payerAgentId/,
  'the saved payer must override any caller-provided payer field',
);

console.log('GLR payment-intent route authorization contract tests passed');
