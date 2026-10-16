export type PayerIdentityResolution =
  | { ok: true; payerAgentId: string }
  | { ok: false; status: 401 | 403; error: string };

export const resolveAuthenticatedPayer = (
  authenticatedUid: string | null | undefined,
  requestedPayer?: unknown,
): PayerIdentityResolution => {
  if (!authenticatedUid) {
    return { ok: false, status: 401, error: 'Authenticated payer identity required' };
  }

  const requested = typeof requestedPayer === 'string' ? requestedPayer.trim() : '';
  if (requested && requested !== authenticatedUid) {
    return { ok: false, status: 403, error: 'Payer identity must match the authenticated principal' };
  }

  return { ok: true, payerAgentId: authenticatedUid };
};
