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
      const assetResponse = await env.ASSETS.fetch(request);
      const looksLikeStaticAsset = /\.(?:m?js|css|map|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|otf|json|webmanifest)$/i.test(incomingUrl.pathname);
      const contentType = assetResponse.headers.get('content-type')?.toLowerCase() || '';
      if (looksLikeStaticAsset && contentType.includes('text/html')) {
        return new Response('Static asset not found. The SPA shell was not substituted for the missing asset.', {
          status: 404,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      }
      return assetResponse;
    }

    try {
      const upstreamUrl = new URL(incomingUrl.pathname + incomingUrl.search, BACKEND_ORIGIN);
      const requestHeaders = new Headers(request.headers);
      requestHeaders.delete('host');
      requestHeaders.delete('content-length');
      requestHeaders.set('x-forwarded-host', incomingUrl.host);
      requestHeaders.set('x-forwarded-proto', incomingUrl.protocol.slice(0, -1));
      const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
      const requestInit: RequestInit & { duplex?: 'half' } = {
        method: request.method,
        headers: requestHeaders,
        redirect: 'manual',
      };
      if (hasBody && request.body) {
        requestInit.body = request.body;
        requestInit.duplex = 'half';
      }
      const upstreamRequest = new Request(upstreamUrl, requestInit);

      const upstreamResponse = await fetch(upstreamRequest);
      const responseHeaders = new Headers(upstreamResponse.headers);
      responseHeaders.set('Cache-Control', 'no-store');
      responseHeaders.set('X-Content-Type-Options', 'nosniff');

      // Keep redirects on this public origin when the backend points to itself.
      const location = responseHeaders.get('location');
      if (location) {
        try {
          const redirectUrl = new URL(location, BACKEND_ORIGIN);
          if (redirectUrl.origin === BACKEND_ORIGIN) {
            responseHeaders.set('Location', incomingUrl.origin + redirectUrl.pathname + redirectUrl.search + redirectUrl.hash);
          }
        } catch {
          // Preserve an unparseable Location header unchanged; do not invent a redirect.
        }
      }

      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
      });
    } catch {
      return apiError(
        'The GLORIFIER backend could not be reached from this Worker. No successful result was assumed.',
        'UPSTREAM_UNAVAILABLE',
      );
    }
  },
};
