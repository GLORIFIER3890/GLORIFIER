import { readFileSync } from 'node:fs';

type RegistrySource = {
  id: string;
  reviewCadenceDays: number;
  scannerStatus: 'active' | 'discovery-only';
};

type Registry = { sources: RegistrySource[] };

const registryPath = 'docs/architecture/geas-authoritative-source-registry.json';
const scannerPath = 'src/lib/governance/geas-architecture-scientist.ts';
const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as Registry;
const scanner = readFileSync(scannerPath, 'utf8');
const sourceSection = scanner.split('const SOURCES: ArchitectureSource[] = [')[1]?.split('const P = (')[0];
const failures: string[] = [];

if (!sourceSection) {
  failures.push('unable to locate scanner SOURCES catalog');
} else {
  const entries = [...sourceSection.matchAll(/\{\s*id:\s*'([^']+)'([^{}]*)\}/gs)].map((match) => ({
    id: match[1],
    body: match[2],
    cadenceHours: Number(match[2].match(/\bcadenceHours:\s*(\d+)/)?.[1] ?? NaN),
  }));
  const activeRegistry = registry.sources.filter((source) => source.scannerStatus === 'active');
  const scannerById = new Map(entries.map((entry) => [entry.id, entry]));

  for (const source of activeRegistry) {
    const entry = scannerById.get(source.id);
    if (!entry) {
      failures.push(`active registry source ${source.id} is missing from scanner catalog`);
      continue;
    }
    if (!Number.isFinite(entry.cadenceHours) || entry.cadenceHours < 1) {
      failures.push(`scanner source ${source.id} has an invalid cadenceHours value`);
      continue;
    }
    const expectedHours = source.reviewCadenceDays * 24;
    if (entry.cadenceHours !== expectedHours) {
      failures.push(`source ${source.id} cadence mismatch: scanner=${entry.cadenceHours}h registry=${expectedHours}h`);
    }
  }

  for (const entry of entries) {
    if (!activeRegistry.some((source) => source.id === entry.id)) {
      failures.push(`scanner source ${entry.id} is not marked active in the authoritative registry`);
    }
  }
}

if (failures.length) {
  process.stderr.write(`${JSON.stringify({ valid: false, failures }, null, 2)}\n`);
  process.exit(1);
}

process.stdout.write(`${JSON.stringify({
  valid: true,
  activeSources: registry.sources.filter((source) => source.scannerStatus === 'active').length,
  cadenceUnit: 'hours',
  sourceRegistry: registryPath,
  scannerCatalog: scannerPath,
  irreversibleChangesExecuted: false,
}, null, 2)}\n`);
