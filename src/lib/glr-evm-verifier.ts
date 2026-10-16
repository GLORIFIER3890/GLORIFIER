export type EvmGLRNetwork = 'eip155:1' | 'eip155:56';

export interface EvmGLRVerification<N extends EvmGLRNetwork> {
  verified: true;
  network: N;
  transactionHash: string;
  blockNumber: string;
  confirmations: number;
  tokenContract: string;
  recipient: string;
  amountGLR: string;
  verifier: string;
  evidenceRef: string;
}

export interface EvmGLRVerifierInput {
  transactionHash: string;
  expectedAmount: string;
  expectedPayerWallet: string;
  fetchImpl?: typeof fetch;
  env?: Record<string, string | undefined>;
}

export interface EvmGLRVerifierConfig<N extends EvmGLRNetwork> {
  contractAddress: string;
  network: N;
  chainIdHex: string;
  chainName: string;
  defaultRpcUrl: string;
  rpcUrlEnv: string;
  recipientEnv: string;
  minimumConfirmationsEnv: string;
  evidencePrefix: string;
}

const TRANSFER_TOPIC = [
  '0xddf252ad1be2c89b69c2b068fc378daa',
  '952ba7f163c4a11628f55a4df523b3ef',
].join('');

export function glrAmountToBaseUnits(amount: string): bigint {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,18})?$/.test(amount)) {
    throw new Error('GLR amount must be a decimal string with at most 18 decimals');
  }
  const [whole, fraction = ''] = amount.split('.');
  return BigInt(whole) * 10n ** 18n + BigInt((fraction + '0'.repeat(18)).slice(0, 18));
}

function addressTopic(address: string, chainName: string): string {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error(`Configured ${chainName} recipient address is invalid`);
  }
  return `0x${address.slice(2).toLowerCase().padStart(64, '0')}`;
}

export async function verifyEvmGLRTransfer<N extends EvmGLRNetwork>(
  input: EvmGLRVerifierInput,
  config: EvmGLRVerifierConfig<N>,
): Promise<EvmGLRVerification<N>> {
  const env = input.env ?? process.env;
  const fetchImpl = input.fetchImpl ?? fetch;
  const txHash = input.transactionHash.trim();
  if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
    throw new Error(`${config.chainName} transaction hash is invalid`);
  }
  if (glrAmountToBaseUnits(input.expectedAmount) <= 0n) {
    throw new Error('Expected GLR amount must be greater than zero');
  }

  const expectedPayerWallet = input.expectedPayerWallet.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(expectedPayerWallet)) {
    throw new Error('Expected payer wallet is missing or invalid in the payment intent metadata');
  }
  const recipient = String(env[config.recipientEnv] || '').trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
    throw new Error(`${config.chainName} GLR payment recipient is not configured; verification is disabled`);
  }

  const configuredRpcUrl = String(env[config.rpcUrlEnv] || config.defaultRpcUrl).trim();
  let parsedRpcUrl: URL;
  try {
    parsedRpcUrl = new URL(configuredRpcUrl);
  } catch {
    throw new Error(`${config.chainName} RPC URL is invalid`);
  }
  if (parsedRpcUrl.protocol !== 'https:' || !parsedRpcUrl.hostname || parsedRpcUrl.username || parsedRpcUrl.password) {
    throw new Error(`${config.chainName} RPC URL must use HTTPS and must not contain credentials`);
  }
  const rpcUrl = parsedRpcUrl.href;
  const minimumConfirmations = Math.max(
    12,
    Math.min(1000, Math.floor(Number(env[config.minimumConfirmationsEnv]) || 12)),
  );
  let requestId = 0;
  const rpc = async (method: string, params: unknown[]): Promise<unknown> => {
    const response = await fetchImpl(rpcUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: ++requestId, method, params }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`${config.chainName} RPC request failed`);
    const payload = await response.json() as { error?: unknown; result?: unknown } | null;
    if (!payload || payload.error || !('result' in payload)) {
      throw new Error(`${config.chainName} RPC returned an invalid response`);
    }
    return payload.result;
  };

  const chainId = String(await rpc('eth_chainId', []));
  if (chainId.toLowerCase() !== config.chainIdHex) {
    throw new Error(`Configured RPC is not ${config.chainName} (chain ID ${config.chainIdHex})`);
  }

  const transaction = await rpc('eth_getTransactionByHash', [txHash]) as { hash?: unknown; to?: unknown } | null;
  if (!transaction) throw new Error(`${config.chainName} transaction was not found`);
  if (String(transaction.hash).toLowerCase() !== txHash.toLowerCase()) {
    throw new Error('RPC transaction hash mismatch');
  }
  if (String(transaction.to || '').toLowerCase() !== config.contractAddress.toLowerCase()) {
    throw new Error(`Transaction destination is not the canonical ${config.chainName} GLR contract`);
  }

  const receipt = await rpc('eth_getTransactionReceipt', [txHash]) as Record<string, unknown> | null;
  if (!receipt) throw new Error(`${config.chainName} transaction is not mined`);
  if (String(receipt.status).toLowerCase() !== '0x1') throw new Error(`${config.chainName} transaction failed`);
  if (String(receipt.transactionHash).toLowerCase() !== txHash.toLowerCase()) {
    throw new Error('RPC receipt hash mismatch');
  }

  const blockNumber = Number(BigInt(String(receipt.blockNumber)));
  if (!Number.isSafeInteger(blockNumber) || blockNumber <= 0) {
    throw new Error(`${config.chainName} receipt block number is invalid`);
  }
  const latestBlockHex = String(await rpc('eth_blockNumber', []));
  const latestBlock = Number(BigInt(latestBlockHex));
  const confirmations = latestBlock - blockNumber + 1;
  if (!Number.isSafeInteger(confirmations) || confirmations < minimumConfirmations) {
    throw new Error(
      `${config.chainName} transaction has insufficient finality (${Math.max(0, confirmations)} / ${minimumConfirmations} confirmations)`,
    );
  }

  const expectedRecipientTopic = addressTopic(recipient, config.chainName);
  const expectedPayerTopic = addressTopic(expectedPayerWallet, config.chainName);
  const expectedUnits = glrAmountToBaseUnits(input.expectedAmount);
  const logs: Array<Record<string, unknown>> = Array.isArray(receipt.logs)
    ? receipt.logs as Array<Record<string, unknown>>
    : [];
  const matches = logs.filter((log) => {
    const topics = log.topics;
    return String(log.address || '').toLowerCase() === config.contractAddress.toLowerCase()
      && Array.isArray(topics)
      && String(topics[0]).toLowerCase() === TRANSFER_TOPIC
      && String(topics[1] || '').toLowerCase() === expectedPayerTopic
      && String(topics[2] || '').toLowerCase() === expectedRecipientTopic
      && BigInt(String(log.data || '0x0')) === expectedUnits;
  });
  if (matches.length !== 1) {
    throw new Error('Receipt must contain exactly one GLR Transfer event matching the configured recipient and exact intent amount');
  }

  return {
    verified: true,
    network: config.network,
    transactionHash: txHash.toLowerCase(),
    blockNumber: String(blockNumber),
    confirmations,
    tokenContract: config.contractAddress,
    recipient,
    amountGLR: input.expectedAmount,
    verifier: parsedRpcUrl.origin,
    evidenceRef: `${config.evidencePrefix}:${txHash.toLowerCase()}:block:${receipt.blockNumber}:confirmations:${confirmations}`,
  };
}
