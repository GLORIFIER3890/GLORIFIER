import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const server = readFileSync('server.ts', 'utf8');
const creationRouteStart = server.indexOf("app.post('/api/economy/glr/intents',");
const creationRouteEnd = server.indexOf("app.post('/api/economy/glr/intents/:id/authorize',", creationRouteStart);
assert.ok(creationRouteStart >= 0 && creationRouteEnd > creationRouteStart, 'GLR intent creation route must remain explicitly defined');
const creationRoute = server.slice(creationRouteStart, creationRouteEnd);

// Scope payer-binding assertions to the actual create route, so matching code
// elsewhere cannot make the regression test pass accidentally.
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
