import React, { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const configuredApiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const nativeApiBase = (() => {
  if (!configuredApiBase) return '';
  try {
    const configuredUrl = new URL(configuredApiBase);
    const isHttps = configuredUrl.protocol === 'https:';
    const isLoopbackHttp = configuredUrl.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '[::1]', '::1'].includes(configuredUrl.hostname);
    return isHttps || isLoopbackHttp ? configuredApiBase : '';
  } catch {
    return '';
  }
})();

function resolveRequestUrl(input: RequestInfo | URL): URL | null {
  try {
    const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    return new URL(rawUrl, window.location.href);
  } catch {
    return null;
  }
}

function isApiPath(pathname: string): boolean {
  return /^\/api(?:\/|$)/.test(pathname);
}

function rewriteApiRequest(
  input: RequestInfo | URL,
  requestUrl: URL,
  apiBase: string,
  currentOrigin: string,
): { input: RequestInfo | URL; requestUrl: URL } {
  if (!apiBase || requestUrl.origin !== currentOrigin || !isApiPath(requestUrl.pathname)) {
    return { input, requestUrl };
  }
  const rewrittenUrl = new URL(apiBase + requestUrl.pathname + requestUrl.search);
  const rewrittenInput = input instanceof Request ? new Request(rewrittenUrl.href, input) : rewrittenUrl;
  return { input: rewrittenInput, requestUrl: rewrittenUrl };
}

function reportHtmlApiResponse(response: Response, requestUrl: URL, isApiRequest: boolean): Response {
  const isHtml = response.headers.get('content-type')?.toLowerCase().includes('text/html') || false;
  if (!isApiRequest || !isHtml) return response;

  console.error('[GLORIFIER API] Expected an API response but received HTML.', {
    path: requestUrl.pathname,
    status: response.status,
  });
  return new Response(JSON.stringify({
    ok: false,
    error: 'The API route returned HTML instead of an API response. Backend routing is unavailable or misconfigured.',
    code: 'API_HTML_RESPONSE',
    path: requestUrl.pathname,
    upstreamStatus: response.status,
  }), {
    status: 502,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

if (typeof window !== 'undefined') {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const resolvedUrl = resolveRequestUrl(input);
    if (!resolvedUrl) return originalFetch(input, init);

    const isApiRequest = isApiPath(resolvedUrl.pathname);
    const rewritten = rewriteApiRequest(input, resolvedUrl, nativeApiBase, window.location.origin);
    const response = await originalFetch(rewritten.input, init);
    return reportHtmlApiResponse(response, rewritten.requestUrl, isApiRequest);
  };
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Glorifier AI frontend error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-100 p-5 sm:p-8">
          <div className="mx-auto max-w-3xl border border-slate-700 bg-[#101010] p-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-red-400">
              Glorifier AI • Frontend Error
            </div>
            <h1 className="text-2xl font-bold">The Command Center could not render.</h1>
            <p className="mt-3 text-slate-300">
              The frontend encountered a runtime error and could not render.
              This screen has not checked backend connectivity; the details below help identify the frontend failure.
            </p>
            <pre className="mt-5 overflow-auto rounded-xl bg-black/50 p-4 text-sm text-red-200 whitespace-pre-wrap">
              {this.state.error.message}
            </pre>
            <button
              className="mt-5 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
              onClick={() => window.location.reload()}
            >
              Reload Command Center
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = document.getElementById('root');

if (!root) {
  throw new Error('Glorifier AI root element was not found.');
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch((error) => console.warn('PWA service worker unavailable:', error)));
}

createRoot(root).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
