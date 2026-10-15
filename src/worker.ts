type CloudflareEnv = {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
};

const BACKEND_ORIGIN = 'https://glorifier-artificial-intelligence-production.up.railway.app';

function isBackendPath(pathname: string): boolean {
  return pathname === '/api' ||
    pathname.startsWith('/api/') ||
    pathname === '/auth' ||
    pathname.startsWith('/auth/');
}

function apiError(message: string, code: string): Response {
  return Response.json(
    { ok: false, status: 'unavailable', error: message, code },
    {
      status: 502,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}

export default {
  async fetch(request: Request, env: CloudflareEnv): Promise<Response> {
    const incomingUrl = new URL(request.url);

    // Backend endpoints must never fall through to the SPA's index.html.
    if (!isBackendPath(incomingUrl.pathname)) {
      return env.ASSETS.fetch(request);
    }

    try {
      const upstreamUrl = new URL(incomingUrl.pathname + incomingUrl.search, BACKEND_ORIGIN);
      const headers = new Headers(request.headers);
      headers.delete('host');
      headers.delete('content-length');
      headers.set('x-forwarded-host', incomingUrl.host);
      headers.set('x-forwarded-proto', incomingUrl.protocol.slice(0, -1));
      const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
      const upstreamRequest = new Request(upstreamUrl, {
        method: request.method,
        headers,
        body: hasBody ? request.body : undefined,
        redirect: 'manual',
      });

      const upstreamResponse = await fetch(upstreamRequest);
      const headers = new Headers(upstreamResponse.headers);
      headers.set('Cache-Control', 'no-store');
      headers.set('X-Content-Type-Options', 'nosniff');

      // Keep redirects on this public origin when the backend points to itself.
      const location = headers.get('location');
      if (location) {
        try {
          const redirectUrl = new URL(location, BACKEND_ORIGIN);
          if (redirectUrl.origin === BACKEND_ORIGIN) {
            headers.set('Location', incomingUrl.origin + redirectUrl.pathname + redirectUrl.search + redirectUrl.hash);
          }
        } catch {
          // Preserve an unparseable Location header unchanged; do not invent a redirect.
        }
      }

      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers,
      });
    } catch {
      return apiError(
        'The GLORIFIER backend could not be reached from this Worker. No successful result was assumed.',
        'UPSTREAM_UNAVAILABLE',
      );
    }
  },
};
