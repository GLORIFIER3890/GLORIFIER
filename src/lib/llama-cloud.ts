const DEFAULT_PROJECT_ID = '220520f6-c208-4b55-87fb-796881b3fc97';
const DEFAULT_BASE_URL = 'https://api.cloud.llamaindex.ai';
const ALLOWED_API_HOSTS = new Set(['api.cloud.llamaindex.ai', 'api.cloud.eu.llamaindex.ai']);

export interface LlamaCloudIndex { id: string; name: string; project_id?: string; status?: string; }
export interface LlamaCloudResult {
  content: string;
  score?: number;
  rerank_score?: number;
  metadata?: Record<string, unknown>;
  page_range_start?: number;
  page_range_end?: number;
}
export class LlamaCloudIntegrationError extends Error {
  constructor(message: string, public readonly statusCode: number, public readonly code: string) {
    super(message);
    this.name = 'LlamaCloudIntegrationError';
  }
}

function config() {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY?.trim() || '';
  const projectId = process.env.LLAMA_CLOUD_PROJECT_ID?.trim() || DEFAULT_PROJECT_ID;
  const baseUrl = (process.env.LLAMA_CLOUD_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, '');
  let parsed: URL;
  try { parsed = new URL(baseUrl); } catch {
    throw new LlamaCloudIntegrationError('LlamaCloud API base URL is invalid.', 500, 'invalid_base_url');
  }
  if (parsed.protocol !== 'https:' || !ALLOWED_API_HOSTS.has(parsed.hostname) || parsed.pathname !== '/') {
    throw new LlamaCloudIntegrationError('Use an official HTTPS LlamaCloud API host.', 500, 'invalid_base_url');
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId)) {
    throw new LlamaCloudIntegrationError('LlamaCloud project ID is invalid.', 500, 'invalid_project_id');
  }
  return { apiKey, projectId, baseUrl };
}

async function request(path: string, init: RequestInit = {}, fetchImpl: typeof fetch = fetch): Promise<any> {
  const { apiKey, projectId, baseUrl } = config();
  if (!apiKey) throw new LlamaCloudIntegrationError('LlamaCloud API key is not configured on the server.', 503, 'not_configured');
  const url = new URL(path, baseUrl);
  if (!url.pathname.startsWith('/api/v1/')) throw new LlamaCloudIntegrationError('Unsupported LlamaCloud API path.', 500, 'invalid_api_path');
  url.searchParams.set('project_id', projectId);
  let response: Response;
  try {
    response = await fetchImpl(url, {
      ...init,
      headers: { accept: 'application/json', authorization: `Bearer ${apiKey}`, ...(init.body ? { 'content-type': 'application/json' } : {}), ...(init.headers || {}) },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new LlamaCloudIntegrationError('LlamaCloud could not be reached.', 502, 'upstream_unreachable');
  }
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new LlamaCloudIntegrationError('LlamaCloud rejected the API key or project access.', 502, 'upstream_auth_failure');
    if (response.status === 429) throw new LlamaCloudIntegrationError('LlamaCloud rate limit was reached.', 503, 'upstream_rate_limited');
    if (response.status >= 500) throw new LlamaCloudIntegrationError('LlamaCloud is temporarily unavailable.', 502, 'upstream_error');
    throw new LlamaCloudIntegrationError('LlamaCloud rejected the request; check project and request configuration.', 502, 'upstream_request_rejected');
  }
  try { return await response.json(); } catch {
    throw new LlamaCloudIntegrationError('LlamaCloud returned invalid JSON.', 502, 'invalid_upstream_response');
  }
}

function getIndexItems(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  throw new LlamaCloudIntegrationError('LlamaCloud returned an unsupported index-list response.', 502, 'invalid_upstream_response');
}

function normalizeIndexes(payload: any): LlamaCloudIndex[] {
  return getIndexItems(payload).filter((item: any) => item && typeof item.id === 'string' && item.id)
    .map((item: any) => ({ id: item.id, name: typeof item.name === 'string' && item.name.trim() ? item.name : item.id,
      ...(typeof item.project_id === 'string' ? { project_id: item.project_id } : {}),
      ...(typeof item.status === 'string' ? { status: item.status } : {}) }));
}

export async function listLlamaCloudIndexes(fetchImpl: typeof fetch = fetch): Promise<LlamaCloudIndex[]> {
  const { projectId } = config();
  const allIndexes: LlamaCloudIndex[] = [];
  const seenTokens = new Set<string>();
  let pageToken: string | undefined;
  // Bound pagination defensively: a malformed upstream token loop must not hang the backend.
  for (let page = 0; page < 1000; page += 1) {
    const query = new URLSearchParams({ page_size: '100' });
    if (pageToken) query.set('page_token', pageToken);
    const payload = await request(`/api/v1/indexes?${query.toString()}`, {}, fetchImpl);
    allIndexes.push(...normalizeIndexes(payload));
    const nextToken = typeof payload?.next_page_token === 'string' && payload.next_page_token.trim()
      ? payload.next_page_token.trim()
      : '';
    if (!nextToken) {
      return allIndexes.filter((item) => !item.project_id || item.project_id === projectId);
    }
    if (seenTokens.has(nextToken)) {
      throw new LlamaCloudIntegrationError('LlamaCloud returned a repeated pagination token.', 502, 'invalid_upstream_response');
    }
    seenTokens.add(nextToken);
    pageToken = nextToken;
  }
  throw new LlamaCloudIntegrationError('LlamaCloud index pagination exceeded the safety limit.', 502, 'invalid_upstream_response');
}

export async function getLlamaCloudStatus(fetchImpl: typeof fetch = fetch) {
  const { apiKey, projectId, baseUrl } = config();
  if (!apiKey) return { configured: false, connected: false, status: 'not-configured' as const, projectId, baseUrl, indexCount: null, message: 'Set LLAMA_CLOUD_API_KEY on the backend to verify access.' };
  const indexes = await listLlamaCloudIndexes(fetchImpl);
  return { configured: true, connected: true, status: 'verified' as const, projectId, baseUrl, indexCount: indexes.length,
    message: indexes.length ? 'LlamaCloud API access verified.' : 'API access verified; no indexes were found for this project.' };
}

export async function retrieveLlamaCloudContext(input: { indexId: string; query: string; topK?: number }, fetchImpl: typeof fetch = fetch): Promise<{ indexId: string; results: LlamaCloudResult[] }> {
  const indexId = typeof input?.indexId === 'string' ? input.indexId.trim() : '';
  const query = typeof input?.query === 'string' ? input.query.trim() : '';
  const topK = input?.topK ?? 5;
  if (!indexId || indexId.length > 200) throw new LlamaCloudIntegrationError('A valid indexId is required.', 400, 'invalid_index_id');
  if (!query || query.length > 2000) throw new LlamaCloudIntegrationError('Query must contain 1–2000 characters.', 400, 'invalid_query');
  if (!Number.isInteger(topK) || topK < 1 || topK > 10) throw new LlamaCloudIntegrationError('topK must be an integer from 1 to 10.', 400, 'invalid_top_k');
  const indexes = await listLlamaCloudIndexes(fetchImpl);
  if (!indexes.some((item) => item.id === indexId)) throw new LlamaCloudIntegrationError('Index not found in configured LlamaCloud project.', 404, 'index_not_found');
  const payload = await request('/api/v1/retrieval/retrieve', { method: 'POST', body: JSON.stringify({ index_id: indexId, query, top_k: topK }) }, fetchImpl);
  if (!Array.isArray(payload?.results)) {
    throw new LlamaCloudIntegrationError('LlamaCloud returned an unsupported retrieval response.', 502, 'invalid_upstream_response');
  }
  return { indexId, results: payload.results.map((item: any) => ({
    content: typeof item?.content === 'string' ? item.content : '',
    ...(typeof item?.score === 'number' ? { score: item.score } : {}),
    ...(typeof item?.rerank_score === 'number' ? { rerank_score: item.rerank_score } : {}),
    ...(item?.metadata && typeof item.metadata === 'object' && !Array.isArray(item.metadata) ? { metadata: item.metadata } : {}),
    ...(typeof item?.static_fields?.page_range_start === 'number' ? { page_range_start: item.static_fields.page_range_start } : {}),
    ...(typeof item?.static_fields?.page_range_end === 'number' ? { page_range_end: item.static_fields.page_range_end } : {}),
  })) };
}
