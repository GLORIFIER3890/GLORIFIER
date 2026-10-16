import { readFileSync } from 'node:fs';

type Source = {
  id: string;
  authority: string;
  domain: string;
  url: string;
  claimsAllowed: string[];
  reviewCadenceDays: number;
  implementationStatus: string;
  scannerStatus: 'active' | 'discovery-only';
};

type Registry = {
  version: string;
  policy: string;
  sources: Source[];
};

const registryPath = 'docs/architecture/geas-authoritative-source-registry.json';
const scannerPath = 'src/lib/governance/geas-architecture-scientist.ts';
const parsed: unknown = JSON.parse(readFileSync(registryPath, 'utf8'));
const failures: string[] = [];
const ids = new Set<string>();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

if (!isRecord(parsed)) {
  failures.push('registry must be a JSON object');
} else {
  if (parsed.version !== 'GEAS-AUTHORITY-2') failures.push('unexpected registry version');
  if (!isNonEmptyString(parsed.policy) || !parsed.policy.toLowerCase().includes('not proof')) {
    failures.push('source-versus-implementation policy missing');
  }
  if (!Array.isArray(parsed.sources) || parsed.sources.length < 10) {
    failures.push('source registry unexpectedly small');
  }

  const sources: unknown[] = Array.isArray(parsed.sources) ? parsed.sources : [];
  for (const [index, item] of sources.entries()) {
    if (!isRecord(item)) {
      failures.push(`source at index ${index} must be an object`);
      continue;
    }

    const source = item as Partial<Source>;
    if (!isNonEmptyString(source.id)) {
      failures.push(`source at index ${index}: id missing`);
    } else if (ids.has(source.id)) {
      failures.push(`missing or duplicate source id: ${source.id}`);
    } else {
      ids.add(source.id);
    }

    if (!isNonEmptyString(source.authority)) failures.push(`source ${source.id ?? index}: authority missing`);
    if (!isNonEmptyString(source.domain)) failures.push(`source ${source.id ?? index}: domain missing`);

    let validHttpsUrl = false;
    if (isNonEmptyString(source.url)) {
      try {
        const url = new URL(source.url);
        validHttpsUrl = url.protocol === 'https:' && url.hostname.length > 0;
      } catch {
        validHttpsUrl = false;
      }
    }
    if (!validHttpsUrl) failures.push(`source ${source.id ?? index}: valid HTTPS URL required`);

    if (!Array.isArray(source.claimsAllowed)
      || source.claimsAllowed.length === 0
      || !source.claimsAllowed.every(isNonEmptyString)) {
      failures.push(`source ${source.id ?? index}: claimsAllowed must be a non-empty string array`);
    }
    if (!Number.isInteger(source.reviewCadenceDays) || (source.reviewCadenceDays ?? 0) < 1) {
      failures.push(`source ${source.id ?? index}: invalid review cadence`);
    }
    if (source.implementationStatus !== 'not-assessed') {
      failures.push(`source ${source.id ?? index}: sources must default to not-assessed`);
    }
    if (source.scannerStatus !== 'active' && source.scannerStatus !== 'discovery-only') {
      failures.push(`source ${source.id ?? index}: scannerStatus must be active or discovery-only`);
    }
  }
}

// Keep the machine-readable registry and executable scanner catalog in sync.
// The scanner catalog is deliberately bounded to the SOURCES declaration so pattern IDs
// elsewhere in the file cannot be mistaken for source IDs.
const scannerText = readFileSync(scannerPath, 'utf8');
const sourceSection = scannerText.split('const SOURCES: ArchitectureSource[] = [')[1]?.split('const P = (')[0];
if (!sourceSection) {
  failures.push('unable to locate scanner SOURCES catalog');
} else {
  const scannerIds = [...sourceSection.matchAll(/\bid:\s*'([^']+)'/g)].map((match) => match[1]);
  const scannerIdSet = new Set(scannerIds);
  if (scannerIds.length === 0) failures.push('scanner source catalog is empty');
  if (scannerIdSet.size !== scannerIds.length) failures.push('scanner source catalog contains duplicate IDs');
  for (const id of scannerIdSet) {
    if (!ids.has(id)) failures.push(`scanner source missing from authoritative registry: ${id}`);
    const source = (parsed as Registry).sources.find((item) => item.id === id);
    if (source && source.scannerStatus !== 'active') failures.push(`scanner source ${id} must be marked active in registry`);
  }
  for (const source of (parsed as Registry).sources) {
    if (source.scannerStatus === 'active' && !scannerIdSet.has(source.id)) {
      failures.push(`registry source ${source.id} is marked active but missing from scanner catalog`);
    }
    if (source.scannerStatus === 'discovery-only' && scannerIdSet.has(source.id)) {
      failures.push(`registry source ${source.id} is marked discovery-only but present in scanner catalog`);
    }
  }
}

if (failures.length > 0) {
  process.stderr.write(`${JSON.stringify({ valid: false, failures }, null, 2)}\n`);
  process.exit(1);
}

const registry = parsed as Registry;
const domains = [...new Set(registry.sources.map(source => source.domain))].sort((left, right) => left.localeCompare(right));
process.stdout.write(`${JSON.stringify({
  valid: true,
  version: registry.version,
  sources: registry.sources.length,
  domains,
  irreversibleChangesExecuted: false
}, null, 2)}\n`);
