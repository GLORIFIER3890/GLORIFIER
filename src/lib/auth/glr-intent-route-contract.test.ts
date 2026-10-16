import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const server = readFileSync('server.ts', 'utf8');
assert.match(
  server,
  /app\\.get\\('\/api\/economy\/glr\/intents',\\s*requireOwnerOrInternalService,/,
  'listing payment intents must require owner or authenticated internal-service authorization',
);
assert.match(
  server,
  /app\\.get\\('\/api\/economy\/glr\/intents\/:id',\\s*requireOwnerOrInternalService,/,
  'reading a payment intent must require owner or authenticated internal-service authorization',
);

const creationRouteStart = server.indexOf("app.post('/api/economy/glr/intents',");
const creationRouteEnd = server.indexOf("app.post('/api/economy/glr/intents/:id/authorize',", creationRouteStart);
assert.ok(creationRouteStart >= 0 && creationRouteEnd > creationRouteStart, 'GLR intent creation route must remain explicitly defined');
const creationRoute = server.slice(creationRouteStart, creationRouteEnd);

assert.match(
  creationRoute,
  /^app\\.post\\('\/api\/economy\/glr\/intents',\\s*requireAuthentication,/,
  'creating a payment intent must require authentication',
);
assert.match(
  creationRoute,
  /resolveAuthenticatedPayer\\(auth\\?\\.uid,\\s*req\\.body\\?\\.payerAgentId\\)/,
  'creation must resolve the payer from the authenticated identity',
);
assert.match(
  creationRoute,
  /createGLRPaymentIntent\\(\\{[\\s\\S]*?payerAgentId:\\s*payer\\.payerAgentId,\\s*\\}\\)/,
  'the actual creation payload must override caller payer with authenticated payer',
);

console.log('GLR payment-intent route authorization contract tests passed');
