export const BNB_GLR_CONTRACT = '0x5e0B0A449232FDA7cA6Ea3419A50873b08F64804';
const TRANSFER_TOPIC = ['0xddf252ad1be2c89b69c2b068fc378daa', '952ba7f163c4a11628f55a4df523b3ef'].join('');

export interface BnbGLRVerification {
  verified: true;
  network: 'eip155:56';
  transactionHash: string;
  blockNumber: string;
  confirmations: number;
  tokenContract: string;
  recipient: string;
  amountGLR: string;
  verifier: string;
  evidenceRef: string;
}

export function glrAmountToBaseUnits(amount: string): bigint {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,18})?$/.test(amount)) {
    throw new Error('GLR amount must be a decimal string with at most 18 decimals');
  }
  const [whole, fraction = ''] = amount.split('.');
  return BigInt(whole) * 10n ** 18n + BigInt((fraction + '0'.repeat(18)).slice(0, 18));
}

function addressTopic(address: string): string {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error('Configured Ethereum recipient address is invalid');
  return `0x${address.slice(2).toLowerCase().padStart(64, '0')}`;
}

export async function verifyBnbGLRTransfer(input: {
  transactionHash: string;
  expectedAmount: string;
  expectedPayerWallet: string;
  fetchImpl?: typeof fetch;
  env?: Record<string, string | undefined>;
}): Promise<BnbGLRVerification> {
  const env = input.env ?? process.env;
  const fetchImpl = input.fetchImpl ?? fetch;
  const txHash = input.transactionHash.trim();
  if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) throw new Error('BNB transaction hash is invalid');
  if (glrAmountToBaseUnits(input.expectedAmount) <= 0n) throw new Error('Expected GLR amount must be greater than zero');

  const expectedPayerWallet = input.expectedPayerWallet.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(expectedPayerWallet)) throw new Error('Expected payer wallet is missing or invalid in the payment intent metadata');
  const recipient = String(env.GLR_BNB_PAYMENT_RECIPIENT || '').trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
    throw new Error('BNB GLR payment recipient is not configured; verification is disabled');
  }
  const rpcUrl = String(env.GLR_BNB_RPC_URL || 'https://bsc-dataseed.binance.org').trim();
  const minimumConfirmations = Math.max(12, Math.min(1000, Math.floor(Number(env.GLR_BNB_MIN_CONFIRMATIONS) || 12)));
  let requestId = 0;
  const rpc = async (method: string, params: unknown[]) => {
    const response = await fetchImpl(rpcUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: ++requestId, method, params }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('BNB RPC request failed');
    const payload: any = await response.json();
    if (payload?.error || !('result' in (payload || {}))) throw new Error('BNB RPC returned an invalid response');
    return payload.result;
  };

  const chainId = String(await rpc('eth_chainId', []));
  if (chainId.toLowerCase() !== '0x38') throw new Error('Configured RPC is not BNB Smart Chain mainnet (chain ID 56)');
  const transaction: any = await rpc('eth_getTransactionByHash', [txHash]);
  if (!transaction) throw new Error('BNB transaction was not found');
  if (String(transaction.hash).toLowerCase() !== txHash.toLowerCase()) throw new Error('RPC transaction hash mismatch');
  if (String(transaction.to || '').toLowerCase() !== BNB_GLR_CONTRACT.toLowerCase()) {
    throw new Error('Transaction destination is not the canonical BNB GLR contract');
  }
  const receipt: any = await rpc('eth_getTransactionReceipt', [txHash]);
  if (!receipt) throw new Error('BNB transaction is not mined');
  if (String(receipt.status).toLowerCase() !== '0x38') throw new Error('BNB transaction failed');
  if (String(receipt.transactionHash).toLowerCase() !== txHash.toLowerCase()) throw new Error('RPC receipt hash mismatch');
  const blockNumber = Number(BigInt(String(receipt.blockNumber)));
  if (!Number.isSafeInteger(blockNumber) || blockNumber <= 0) throw new Error('BNB receipt block number is invalid');
  const latestBlockHex = String(await rpc('eth_blockNumber', []));
  const latestBlock = Number(BigInt(latestBlockHex));
  const confirmations = latestBlock - blockNumber + 1;
  if (!Number.isSafeInteger(confirmations) || confirmations < minimumConfirmations) {
    throw new Error(`BNB transaction has insufficient finality (${Math.max(0, confirmations)} / ${minimumConfirmations} confirmations)`);
  }

  const expectedRecipientTopic = addressTopic(recipient);
  const expectedPayerTopic = addressTopic(expectedPayerWallet);
  const expectedUnits = glrAmountToBaseUnits(input.expectedAmount);
  const logs: any[] = Array.isArray(receipt.logs) ? receipt.logs : [];
  const matches = logs.filter((log) =>
    String(log.address || '').toLowerCase() === BNB_GLR_CONTRACT.toLowerCase()
    && Array.isArray(log.topics)
    && String(log.topics[0]).toLowerCase() === TRANSFER_TOPIC
    && String(log.topics[1] || '').toLowerCase() === expectedPayerTopic
    && String(log.topics[2] || '').toLowerCase() === expectedRecipientTopic
    && BigInt(String(log.data || '0x0')) === expectedUnits
  );
  if (matches.length !== 1) {
    throw new Error('Receipt must contain exactly one GLR Transfer event matching the configured recipient and exact intent amount');
  }

  const evidenceRef = `bnb-mainnet-rpc:${txHash.toLowerCase()}:block:${receipt.blockNumber}:confirmations:${confirmations}`;
  return {
    verified: true,
    network: 'eip155:56',
    transactionHash: txHash.toLowerCase(),
    blockNumber: String(blockNumber),
    confirmations,
    tokenContract: BNB_GLR_CONTRACT,
    recipient,
    amountGLR: input.expectedAmount,
    verifier: rpcUrl,
    evidenceRef,
  };
}
