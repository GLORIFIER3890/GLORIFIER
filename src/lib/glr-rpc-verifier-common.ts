export interface GLRTransferVerifierInput {
  transactionHash: string;
  expectedAmount: string;
  expectedPayerWallet: string;
  fetchImpl?: typeof fetch;
  env?: Record<string, string | undefined>;
}

export type JsonRpcClient = (method: string, params: unknown[]) => Promise<unknown>;

export function amountToBaseUnits(amount: string, decimals: number, label: string): bigint {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 30) {
    throw new Error('Token decimals must be an integer between 0 and 30');
  }
  const parts = amount.split('.');
  const validWhole = /^(?:0|[1-9][0-9]*)$/.test(parts[0] || '');
  const validFraction = parts.length === 1
    || (decimals > 0 && parts.length === 2 && parts[1].length > 0
      && parts[1].length <= decimals && /^[0-9]+$/.test(parts[1]));
  if (!validWhole || !validFraction) {
    throw new Error(`${label} amount must be a decimal string with at most ${decimals} decimals`);
  }
  const [whole, fraction = ''] = amount.split('.');
  return BigInt(whole) * 10n ** BigInt(decimals)
    + BigInt((fraction + '0'.repeat(decimals)).slice(0, decimals) || '0');
}

export function parseSecureRpcUrl(value: string, chainName: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${chainName} RPC URL is invalid`);
  }
  if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) {
    throw new Error(`${chainName} RPC URL must use HTTPS and must not contain credentials`);
  }
  return url;
}

export function createRpcClient(
  rpcUrl: string,
  chainName: string,
  fetchImpl: typeof fetch,
  timeoutMs = 8000,
): JsonRpcClient {
  let requestId = 0;
  return async (method, params) => {
    const response = await fetchImpl(rpcUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: ++requestId, method, params }),
      redirect: 'error',
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) throw new Error(`${chainName} RPC request failed`);
    const payload = await response.json() as { error?: unknown; result?: unknown } | null;
    if (!payload || payload.error || !('result' in payload)) {
      throw new Error(`${chainName} RPC returned an invalid response`);
    }
    return payload.result;
  };
}
