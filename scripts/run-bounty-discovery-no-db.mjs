import { mkdir, writeFile } from 'node:fs/promises';

const timeoutMs = 15_000;
const headers = {
  accept: 'application/vnd.github+json, application/json',
  'user-agent': 'GLORIFIER-Bounty-Discovery/2.0',
};
if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const sources = [
  {
    id: 'github-bounty-issues',
    url: 'https://api.github.com/search/issues?q=' + encodeURIComponent('is:issue is:open (bounty OR reward OR paid OR funded) -label:spam') + '&per_page=50',
    kind: 'github-search',
  },
  { id: 'huggingface-models', url: 'https://huggingface.co/api/models?sort=downloads&direction=-1&limit=20', kind: 'array' },
  { id: 'huggingface-datasets', url: 'https://huggingface.co/api/datasets?sort=downloads&direction=-1&limit=20', kind: 'array' },
];

async function fetchJson(source) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(source.url, {
      headers: source.id === 'github-bounty-issues' ? headers : { accept: 'application/json', 'user-agent': 'GLORIFIER-Bounty-Discovery/2.0' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function normalize(source, payload) {
  const items = source.kind === 'github-search'
    ? (Array.isArray(payload.items) ? payload.items : [])
    : (Array.isArray(payload) ? payload : []);
  return items.slice(0, 50).map((item) => ({
    source: source.id,
    title: String(item.title || item.modelId || item.id || 'Untitled signal').slice(0, 500),
    url: String(item.html_url || item.url || (item.id ? 'https://huggingface.co/' + item.id : source.url)),
    description: String(item.body || item.description || item.id || '').slice(0, 2000),
    observedAt: new Date().toISOString(),
    evidenceStatus: 'OBSERVED_NOT_VERIFIED',
    fundingStatus: source.id === 'github-bounty-issues' ? 'UNVERIFIED' : 'NOT_APPLICABLE',
  }));
}

async function main() {
  const findings = [];
  const errors = [];
  let sourcesSucceeded = 0;
  for (const source of sources) {
    try {
      const payload = await fetchJson(source);
      findings.push(...normalize(source, payload));
      sourcesSucceeded++;
      console.log(`Source ${source.id}: OK`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ source: source.id, error: message });
      console.warn(`Source ${source.id}: unavailable (${message})`);
    }
  }

  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    mode: 'DATABASE_FREE_READ_ONLY_DISCOVERY',
    sourcesScanned: sources.length,
    sourcesSucceeded,
    findingsObserved: findings.length,
    findings,
    errors,
    economicTruth: 'Observed opportunities are not verified revenue. Funding, eligibility, acceptance, and payout require separate evidence.',
    executionBoundary: 'No bounty claims, external submissions, payments, settlement, or target testing are performed.',
  };
  await mkdir('artifacts', { recursive: true });
  await writeFile('artifacts/bounty-discovery.json', JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify({
    mode: report.mode,
    sourcesScanned: report.sourcesScanned,
    sourcesSucceeded: report.sourcesSucceeded,
    findingsObserved: report.findingsObserved,
    errors,
    reportPath: 'artifacts/bounty-discovery.json',
    economicTruth: report.economicTruth,
  }, null, 2));

  if (sourcesSucceeded === 0) {
    throw new Error('All discovery sources failed. See errors above.');
  }
}

main().catch((error) => {
  console.error('[GLORIFIER] database-free bounty discovery failed:', error);
  process.exitCode = 1;
});
