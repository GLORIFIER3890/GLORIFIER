/**
 * Normalize a caller-provided prefix using a single linear pass.
 * Runs of unsupported characters become one hyphen; edge hyphens are removed.
 */
function normalizePrefix(prefix: string): string {
  const characters: string[] = [];
  let insideInvalidRun = false;

  for (const character of prefix.trim()) {
    const codePoint = character.charCodeAt(0);
    const allowed =
      (codePoint >= 48 && codePoint <= 57) ||
      (codePoint >= 65 && codePoint <= 90) ||
      (codePoint >= 97 && codePoint <= 122) ||
      character === '_' ||
      character === '-';

    if (allowed) {
      characters.push(character);
      insideInvalidRun = false;
    } else if (!insideInvalidRun) {
      characters.push('-');
      insideInvalidRun = true;
    }
  }

  let start = 0;
  let end = characters.length;
  while (start < end && characters[start] === '-') start += 1;
  while (end > start && characters[end - 1] === '-') end -= 1;
  return characters.slice(start, end).join('');
}

/**
 * Create a namespaced identifier with collision resistance across rapid calls.
 * Uses the Web Crypto API without importing Node-only modules into the frontend.
 */
export function newId(prefix: string): string {
  const normalizedPrefix = normalizePrefix(prefix);
  if (!normalizedPrefix) throw new Error('ID prefix must contain at least one alphanumeric character');
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi || typeof cryptoApi.randomUUID !== 'function') {
    throw new Error('A cryptographically secure UUID generator is not available in this runtime');
  }
  return `${normalizedPrefix}-${cryptoApi.randomUUID()}`;
}
