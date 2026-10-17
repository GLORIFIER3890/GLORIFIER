import { randomUUID } from 'node:crypto';

/**
 * Create a namespaced identifier with collision resistance across rapid calls.
 * Prefixes are normalized to a conservative identifier alphabet for stable IDs.
 */
export function newId(prefix: string): string {
  const normalizedPrefix = prefix.trim().replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  if (!normalizedPrefix) throw new Error('ID prefix must contain at least one alphanumeric character');
  return `${normalizedPrefix}-${randomUUID()}`;
}
