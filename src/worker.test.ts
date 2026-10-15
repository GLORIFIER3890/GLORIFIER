import assert from 'node:assert/strict';
import process from 'node:process';
import worker from './worker.ts';

type TestEnv = {
  ASSETS: { fetch(request: Request): Promise<Response> };
};

const originalFetch = globalThis.fetch;
let capturedRequest: Request | null = null;
let upstreamResponse = new Response('{"ok":true}', {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
});
let shouldThrow = false;
let assetCalls = 0;

const env: TestEnv = {
  ASSETS: {
    async fetch() {
      assetCalls += 1;
      return new Response('static asset', { status: 200 });
    },
  },
};

async function run(): Promise<void> {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    if (shouldThrow) throw new Error('simulated upstream outage');
    capturedRequest = input instanceof Request ? input : new Request(input, init);
    return upstreamResponse;
  }) as typeof fetch;

  try {
    const staticResponse = await worker.fetch(
      new Request('https://glorifier.glorifier.workers.dev/assets/app.js'),
      env,
    );
    assert.equal(await staticResponse.text(), 'static asset');
    assert.equal(assetCalls, 1);
    assert.equal(capturedRequest, null, 'static assets must not call the backend');

    const apiResponse = await worker.fetch(
      new Request('https://glorifier.glorifier.workers.dev/api/runtime-verification?probeAi=false'),
      env,
    );
    assert.equal(apiResponse.status, 200);
    assert.equal(apiResponse.headers.get('cache-control'), 'no-store');
    assert.equal(capturedRequest?.url, 'https://glorifier-artificial-intelligence-production.up.railway.app/api/runtime-verification?probeAi=false');
    assert.equal(capturedRequest?.headers.get('x-forwarded-host'), 'glorifier.glorifier.workers.dev');
    assert.equal(await apiResponse.json().then((body: any) => body.ok), true);

    upstreamResponse = new Response('{"ok":false,"error":"not found"}', {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
    const missingRoute = await worker.fetch(
      new Request('https://glorifier.glorifier.workers.dev/api/route-that-does-not-exist'),
      env,
    );
    assert.equal(missingRoute.status, 404, 'unknown API routes must stay backend errors, not SPA success');
    assert.equal(await missingRoute.json().then((body: any) => body.ok), false);

    upstreamResponse = new Response('{"ok":true}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    const postResponse = await worker.fetch(
      new Request('https://glorifier.glorifier.workers.dev/api/test-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'observe' }),
      }),
      env,
    );
    assert.equal(postResponse.status, 200);
    assert.equal(capturedRequest?.method, 'POST');
    assert.deepEqual(JSON.parse(await capturedRequest!.text()), { action: 'observe' });

    shouldThrow = true;
    const unavailable = await worker.fetch(
      new Request('https://glorifier.glorifier.workers.dev/api/health'),
      env,
    );
    assert.equal(unavailable.status, 502);
    assert.equal(await unavailable.json().then((body: any) => body.code), 'UPSTREAM_UNAVAILABLE');

    console.log('Cloudflare Worker proxy tests passed.');
  } finally {
    globalThis.fetch = originalFetch;
  }
}

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
