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

type Rpc = (method: string, params: unknown[]) => Promise<unknown>;
type ConfirmedReceipt = {
  receipt: Record<string, unknown>;
  blockNumber: number;
  confirmations: number;
};

const TRANSFER_TOPIC = [
  '0xddf252ad1be2c89b69c2b068fc378daa',
  '952ba7f163c4a11628f55a4df523b3ef',
].join('');

const asString = (value: unknown): string => typeof value === 'string' ? value : '';

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

function validateTransferInput<N extends EvmGLRNetwork>(
  input: EvmGLRVerifierInput,
  config: EvmGLRVerifierConfig<N>,
  env: Record<string, string | undefined>,
) {
  const txHash = input.transactionHash.trim();
  if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
    throw new Error(`${config.chainName} transaction hash is invalid`);
  }
  const expectedUnits = glrAmountToBaseUnits(input.expectedAmount);
  if (expectedUnits <= 0n) throw new Error('Expected GLR amount must be greater than zero');

  const expectedPayerWallet = input.expectedPayerWallet.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(expectedPayerWallet)) {
    throw new Error('Expected payer wallet is missing or invalid in the payment intent metadata');
  }
  const recipient = String(env[config.recipientEnv] || '').trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
    throw new Error(`${config.chainName} GLR payment recipient is not configured; verification is disabled`);
  }
  return { txHash: txHash.toLowerCase(), expectedUnits, expectedPayerWallet, recipient };
}

function parseSecureRpcUrl(value: string, chainName: string): URL {
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

function createRpcClient(rpcUrl: string, chainName: string, fetchImpl: typeof fetch): Rpc {
  let requestId = 0;
  return async (method, params) => {
    const response = await fetchImpl(rpcUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: ++requestId, method, params }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`${chainName} RPC request failed`);
    const payload = await response.json() as { error?: unknown; result?: unknown } | null;
    if (!payload || payload.error || !('result' in payload)) {
      throw new Error(`${chainName} RPC returned an invalid response`);
    }
    return payload.result;
  };
}

async function verifyConfiguredChain<N extends EvmGLRNetwork>(
  rpc: Rpc,
  config: EvmGLRVerifierConfig<N>,
): Promise<void> {
  const chainId = asString(await rpc('eth_chainId', []));
  if (chainId.toLowerCase() !== config.chainIdHex) {
    throw new Error(`Configured RPC is not ${config.chainName} (chain ID ${config.chainIdHex})`);
  }
}

async function loadConfirmedReceipt<N extends EvmGLRNetwork>(
  rpc: Rpc,
  txHash: string,
  config: EvmGLRVerifierConfig<N>,
  minimumConfirmations: number,
): Promise<ConfirmedReceipt> {
  const transaction = await rpc('eth_getTransactionByHash', [txHash]) as { hash?: unknown; to?: unknown } | null;
  if (!transaction) throw new Error(`${config.chainName} transaction was not found`);
  if (asString(transaction.hash).toLowerCase() !== txHash) throw new Error('RPC transaction hash mismatch');
  if (asString(transaction.to).toLowerCase() !== config.contractAddress.toLowerCase()) {
    throw new Error(`Transaction destination is not the canonical ${config.chainName} GLR contract`);
  }

  const receipt = await rpc('eth_getTransactionReceipt', [txHash]) as Record<string, unknown> | null;
  if (!receipt) throw new Error(`${config.chainName} transaction is not mined`);
  if (asString(receipt.status).toLowerCase() !== '0x1') throw new Error(`${config.chainName} transaction failed`);
  if (asString(receipt.transactionHash).toLowerCase() !== txHash) throw new Error('RPC receipt hash mismatch');

  const receiptBlock = asString(receipt.blockNumber);
  const latestBlockHex = asString(await rpc('eth_blockNumber', []));
  let blockNumber: number;
  let latestBlock: number;
  try {
    blockNumber = Number(BigInt(receiptBlock));
    latestBlock = Number(BigInt(latestBlockHex));
  } catch {
    throw new Error(`${config.chainName} RPC returned an invalid block number`);
  }
  if (!Number.isSafeInteger(blockNumber) || blockNumber <= 0 || !Number.isSafeInteger(latestBlock)) {
    throw new Error(`${config.chainName} receipt block number is invalid`);
  }

  const confirmations = latestBlock - blockNumber + 1;
  if (!Number.isSafeInteger(confirmations) || confirmations < minimumConfirmations) {
    throw new Error(
      `${config.chainName} transaction has insufficient finality (${Math.max(0, confirmations)} / ${minimumConfirmations} confirmations)`,
    );
  }
  return { receipt, blockNumber, confirmations };
}

function hasExactTransfer<N extends EvmGLRNetwork>(
  receipt: Record<string, unknown>,
  config: EvmGLRVerifierConfig<N>,
  recipient: string,
  payer: string,
  expectedUnits: bigint,
): boolean {
  const expectedRecipientTopic = addressTopic(recipient, config.chainName);
  const expectedPayerTopic = addressTopic(payer, config.chainName);
  const logs = Array.isArray(receipt.logs) ? receipt.logs as Array<Record<string, unknown>> : [];
  return logs.filter((log) => {
    const topics = log.topics;
    if (
      asString(log.address).toLowerCase() !== config.contractAddress.toLowerCase() ||
      !Array.isArray(topics) ||
      asString(topics[0]).toLowerCase() !== TRANSFER_TOPIC ||
      asString(topics[1]).toLowerCase() !== expectedPayerTopic ||
      asString(topics[2]).toLowerCase() !== expectedRecipientTopic
    ) return false;
    try {
      return BigInt(asString(log.data) || '0x0') === expectedUnits;
    } catch {
      return false;
    }
  }).length === 1;
}

export async function verifyEvmGLRTransfer<N extends EvmGLRNetwork>(
  input: EvmGLRVerifierInput,
  config: EvmGLRVerifierConfig<N>,
): Promise<EvmGLRVerification<N>> {
  const env = input.env ?? process.env;
  const fetchImpl = input.fetchImpl ?? fetch;
  const { txHash, expectedUnits, expectedPayerWallet, recipient } = validateTransferInput(input, config, env);
  const configuredRpcUrl = String(env[config.rpcUrlEnv] || config.defaultRpcUrl).trim();
  const parsedRpcUrl = parseSecureRpcUrl(configuredRpcUrl, config.chainName);
  const rpc = createRpcClient(parsedRpcUrl.href, config.chainName, fetchImpl);
  const minimumConfirmations = Math.max(
    12,
    Math.min(1000, Math.floor(Number(env[config.minimumConfirmationsEnv]) || 12)),
  );

  await verifyConfiguredChain(rpc, config);
  const { receipt, blockNumber, confirmations } = await loadConfirmedReceipt(rpc, txHash, config, minimumConfirmations);
  if (!hasExactTransfer(receipt, config, recipient, expectedPayerWallet, expectedUnits)) {
    throw new Error('Receipt must contain exactly one GLR Transfer event matching the configured recipient and exact intent amount');
  }

  return {
    verified: true,
    network: config.network,
    transactionHash: txHash,
    blockNumber: String(blockNumber),
    confirmations,
    tokenContract: config.contractAddress,
    recipient,
    amountGLR: input.expectedAmount,
    verifier: parsedRpcUrl.origin,
    evidenceRef: `${config.evidencePrefix}:${txHash}:block:${receipt.blockNumber}:confirmations:${confirmations}`,
  };
}
