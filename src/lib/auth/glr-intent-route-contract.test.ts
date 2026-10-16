import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const server = readFileSync('server.ts', 'utf8');
assert.match(
  server,
  /app\.get\(\s*['"]\/api\/economy\/glr\/intents['"]\s*,\s*requireOwnerOrInternalService\s*,/,
  'listing payment intents must require owner or authenticated internal-service authorization',
);
assert.match(
  server,
  /app\.get\(\s*['"]\/api\/economy\/glr\/intents\/:id['"]\s*,\s*requireOwnerOrInternalService\s*,/,
  'reading a payment intent must require owner or authenticated internal-service authorization',
);

const creationStartPattern = /app\.post\(\s*['"]\/api\/economy\/glr\/intents['"]\s*,\s*requireAuthentication\s*,/;
const creationStartMatch = creationStartPattern.exec(server);
assert.ok(creationStartMatch, 'GLR intent creation route must require authentication');
const creationRouteStart = creationStartMatch.index;
const authorizeRoutePattern = /app\.post\(\s*['"]\/api\/economy\/glr\/intents\/:id\/authorize['"]/g;
authorizeRoutePattern.lastIndex = creationRouteStart + creationStartMatch[0].length;
const authorizeRouteMatch = authorizeRoutePattern.exec(server);
assert.ok(authorizeRouteMatch, 'GLR intent authorization route delimiter must remain defined');
const creationRoute = server.slice(creationRouteStart, authorizeRouteMatch.index);

assert.match(
  creationRoute,
  /resolveAuthenticatedPayer\(\s*auth\?\.uid\s*,\s*req\.body\?\.payerAgentId\s*\)/,
  'creation must resolve the payer from the authenticated identity',
);
assert.match(
  creationRoute,
  /createGLRPaymentIntent\(\s*\{[\s\S]*?payerAgentId\s*:\s*payer\.payerAgentId\s*,\s*\}\s*\)/,
  'the actual creation payload must override caller payer with authenticated payer',
);

console.log('GLR payment-intent route authorization contract tests passed');
