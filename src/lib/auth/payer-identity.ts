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

/**
 * Build a payment intent only after binding its payer to the authenticated
 * principal. Kept separate from Express so the actual business boundary can be
 * tested with a fake persistence function without starting the server.
 */
export async function createAuthenticatedPayerIntent<T>(
  authenticatedUid: string | null | undefined,
  body: unknown,
  createIntent: (input: Record<string, unknown>) => Promise<T>,
): Promise<
  | { ok: true; intent: T }
  | { ok: false; status: 401 | 403; error: string }
> {
  const input = body && typeof body === 'object' && !Array.isArray(body)
    ? body as Record<string, unknown>
    : {};
  const payer = resolveAuthenticatedPayer(authenticatedUid, input.payerAgentId);
  if (!payer.ok) return payer;
  const intent = await createIntent({ ...input, payerAgentId: payer.payerAgentId });
  return { ok: true, intent };
}
