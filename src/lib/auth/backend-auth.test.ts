import { strict as assert } from 'node:assert';
import type { Request } from 'express';
import { isInternalServiceRequest } from './backend-auth.ts';

const previousToken = process.env.GLORIFIER_INTERNAL_SERVICE_TOKEN;
try {
  const request = (headers: Record<string, string> = {}, remoteAddress = '10.0.0.5') => ({
    get: (name: string) => headers[name.toLowerCase()],
    socket: { remoteAddress },
  } as unknown as Request);

  process.env.GLORIFIER_INTERNAL_SERVICE_TOKEN = 'test-shared-secret';
  assert.equal(isInternalServiceRequest(request({
    'x-glorifier-internal-service': 'permanent-orchestrator',
    'x-forwarded-host': 'glorifier-artificial-intelligence.railway.internal',
  })), false, 'caller-controlled marker and forwarded host must not authenticate');
  assert.equal(isInternalServiceRequest(request({}, '127.0.0.1')), false, 'loopback address must not authenticate');
  assert.equal(isInternalServiceRequest(request({ 'x-glorifier-internal-token': 'wrong' })), false);
  assert.equal(isInternalServiceRequest(request({ 'x-glorifier-internal-token': 'test-shared-secret' })), true);

  delete process.env.GLORIFIER_INTERNAL_SERVICE_TOKEN;
  assert.equal(isInternalServiceRequest(request({ 'x-glorifier-internal-token': 'test-shared-secret' })), false,
    'supplied token must not authenticate when no server-side token is configured');
  console.log('Backend internal-service authentication tests: PASS');
} finally {
  if (previousToken === undefined) delete process.env.GLORIFIER_INTERNAL_SERVICE_TOKEN;
  else process.env.GLORIFIER_INTERNAL_SERVICE_TOKEN = previousToken;
}
