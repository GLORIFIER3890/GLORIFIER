import { newId } from './new-id';

const ids = new Set<string>();
for (let index = 0; index < 10_000; index += 1) {
  const id = newId('test-prefix');
  if (!id.startsWith('test-prefix-')) throw new Error('ID must retain its normalized prefix');
  if (ids.has(id)) throw new Error('ID collision detected across rapid calls');
  ids.add(id);
}
let emptyPrefixRejected = false;
try { newId('---'); } catch { emptyPrefixRejected = true; }
if (!emptyPrefixRejected) throw new Error('Empty normalized prefixes must be rejected');
console.log('Shared ID helper tests passed.');
