import React, { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const nativeApiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let requestUrl: URL;
    try {
      requestUrl = new URL(
        typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
        window.location.href,
      );
    } catch {
      return originalFetch(input, init);
    }

    const isApiRequest = requestUrl.pathname === '/api' ||
      requestUrl.pathname.startsWith('/api/') ||
      requestUrl.pathname === '/auth' ||
      requestUrl.pathname.startsWith('/auth/');

    if (nativeApiBase && requestUrl.origin === window.location.origin &&
        (requestUrl.pathname === '/api' || requestUrl.pathname.startsWith('/api/'))) {
      requestUrl = new URL(nativeApiBase + requestUrl.pathname + requestUrl.search);
      input = requestUrl;
    }

    const response = await originalFetch(input, init);
    if (!isApiRequest || !response.headers.get('content-type')?.toLowerCase().includes('text/html')) {
      return response;
    }

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
              The backend is reachable, but the browser encountered a frontend runtime error.
              The details below are included so the problem is visible instead of showing a blank screen.
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
