/**
 * Create a namespaced identifier with collision resistance across rapid calls.
 * Uses the Web Crypto API, available in modern browsers and supported Node.js
 * runtimes, so importing this helper does not pull Node-only modules into the
 * frontend bundle.
 */
export function newId(prefix: string): string {
  const normalizedPrefix = prefix.trim().replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  if (!normalizedPrefix) throw new Error('ID prefix must contain at least one alphanumeric character');
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi || typeof cryptoApi.randomUUID !== 'function') {
    throw new Error('A cryptographically secure UUID generator is not available in this runtime');
  }
  return `${normalizedPrefix}-${cryptoApi.randomUUID()}`;
}
