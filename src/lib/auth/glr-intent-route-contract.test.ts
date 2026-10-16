import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const server = readFileSync('server.ts', 'utf8');
assert.ok(
  server.includes("app.get('/api/economy/glr/intents', requireOwnerOrInternalService,"),
  'listing payment intents must require owner or authenticated internal-service authorization',
);
assert.ok(
  server.includes("app.get('/api/economy/glr/intents/:id', requireOwnerOrInternalService,"),
  'reading a payment intent must require owner or authenticated internal-service authorization',
);

const creationRouteStart = server.indexOf("app.post('/api/economy/glr/intents',");
const creationRouteEnd = server.indexOf("app.post('/api/economy/glr/intents/:id/authorize',", creationRouteStart);
assert.ok(creationRouteStart >= 0 && creationRouteEnd > creationRouteStart, 'GLR intent creation route must remain explicitly defined');
const creationRoute = server.slice(creationRouteStart, creationRouteEnd);

assert.ok(
  creationRoute.startsWith("app.post('/api/economy/glr/intents', requireAuthentication,"),
  'creating a payment intent must require authentication',
);
assert.ok(
  creationRoute.includes('resolveAuthenticatedPayer(auth?.uid, req.body?.payerAgentId)'),
  'creation must resolve the payer from the authenticated identity',
);
assert.ok(
  /createGLRPaymentIntent\(\{[\s\S]*?payerAgentId:\s*payer\.payerAgentId,\s*\}\)/.test(creationRoute),
  'the actual creation payload must override caller payer with authenticated payer',
);

console.log('GLR payment-intent route authorization contract tests passed');
