import assert from 'node:assert/strict';
import { isInternalServiceRequest } from './backend-auth';

function request(headers: Record<string, string>, remoteAddress = '10.0.0.5') {
  return {
    get(name: string) { return headers[name.toLowerCase()] ?? undefined; },
    socket: { remoteAddress },
  } as any;
}

const previous = process.env.GLORIFIER_INTERNAL_SERVICE_TOKEN;
try {
  process.env.GLORIFIER_INTERNAL_SERVICE_TOKEN = 'test-secret-token';
  assert.equal(isInternalServiceRequest(request({
    'x-glorifier-internal-service': 'permanent-orchestrator',
    host: 'glorifier-artificial-intelligence.railway.internal',
  })), false, 'marker and private address alone must not authenticate');
  assert.equal(isInternalServiceRequest(request({
    'x-glorifier-internal-service': 'permanent-orchestrator',
    'x-forwarded-host': 'glorifier-artificial-intelligence.railway.internal',
  }, '203.0.113.8')), false, 'forwarded host must not authenticate');
  assert.equal(isInternalServiceRequest(request({
    'x-glorifier-internal-token': 'wrong-token',
  })), false, 'wrong token must fail');
  assert.equal(isInternalServiceRequest(request({
    'x-glorifier-internal-token': 'test-secret-token',
  }, '203.0.113.8')), true, 'configured service token should authenticate regardless of network hints');
  delete process.env.GLORIFIER_INTERNAL_SERVICE_TOKEN;
  assert.equal(isInternalServiceRequest(request({
    'x-glorifier-internal-token': 'test-secret-token',
  })), false, 'missing configured token must fail closed');
  console.log('backend-auth internal service regression tests passed');
} finally {
  if (previous === undefined) delete process.env.GLORIFIER_INTERNAL_SERVICE_TOKEN;
  else process.env.GLORIFIER_INTERNAL_SERVICE_TOKEN = previous;
}
