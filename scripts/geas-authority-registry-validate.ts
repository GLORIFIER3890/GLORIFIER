import { readFileSync } from 'node:fs';
type Source = { id: string; authority: string; domain: string; url: string; claimsAllowed: string[]; reviewCadenceDays: number; implementationStatus: string };
const path = 'docs/architecture/geas-authoritative-source-registry.json';
const registry = JSON.parse(readFileSync(path, 'utf8')) as { version: string; policy: string; sources: Source[] };
const failures: string[] = []; const ids = new Set<string>();
if (registry.version !== 'GEAS-AUTHORITY-2') failures.push('unexpected registry version');
if (!registry.policy.includes('not proof')) failures.push('source-versus-implementation policy missing');
if (!Array.isArray(registry.sources) || registry.sources.length < 10) failures.push('source registry unexpectedly small');
for (const s of registry.sources ?? []) {
 if (!s.id || ids.has(s.id)) failures.push('missing or duplicate source id: ' + s.id); ids.add(s.id);
 if (!s.authority?.trim()) failures.push(s.id + ': authority missing');
 if (!/^https:\/\//.test(s.url)) failures.push(s.id + ': HTTPS URL required');
 if (!s.claimsAllowed?.length) failures.push(s.id + ': claimsAllowed must not be empty');
 if (!Number.isInteger(s.reviewCadenceDays) || s.reviewCadenceDays < 1) failures.push(s.id + ': invalid review cadence');
 if (s.implementationStatus !== 'not-assessed') failures.push(s.id + ': sources must default to not-assessed');
}
if (failures.length) { console.error(JSON.stringify({valid:false,failures},null,2)); process.exit(1); }
console.log(JSON.stringify({valid:true,version:registry.version,sources:registry.sources.length,domains:[...new Set(registry.sources.map(s=>s.domain))].sort(),irreversibleChangesExecuted:false},null,2));
