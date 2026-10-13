import { glrAmountToBaseUnits, verifyEthereumGLRTransfer, ETHEREUM_GLR_CONTRACT } from './glr-ethereum-verifier';

function expect(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

expect(glrAmountToBaseUnits('1') === 1000000000000000000n, 'one GLR must equal 1e18 base units');
expect(glrAmountToBaseUnits('0.000000000000000001') === 1n, 'smallest GLR unit must be represented exactly');
let rejected = false;
try { glrAmountToBaseUnits('0.0000000000000000001'); } catch { rejected = true; }
expect(rejected, 'more than 18 decimals must be rejected');

const txHash = '0x' + 'a'.repeat(64);
const recipient = '0x1111111111111111111111111111111111111111';
const recipientTopic = '0x' + recipient.slice(2).padStart(64, '0');
const payloads: Record<string, unknown> = {
  eth_chainId: '0x1',
  eth_getTransactionReceipt: {
    transactionHash: txHash,
    status: '0x1',
    to: ETHEREUM_GLR_CONTRACT,
    blockNumber: '0x64',
    logs: [{
      address: ETHEREUM_GLR_CONTRACT,
      topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', '0x' + '0'.repeat(64), recipientTopic],
      data: '0xde0b6b3a7640000'
    }]
  },
  eth_blockNumber: '0x70'
};
const mockFetch: typeof fetch = async (_input, init) => {
  const body = JSON.parse(String(init?.body || '{}'));
  return new Response(JSON.stringify({ jsonrpc: '2.0', id: body.id, result: payloads[body.method] }), { status: 200, headers: { 'content-type': 'application/json' } });
};
const verified = await verifyEthereumGLRTransfer({
  transactionHash: txHash,
  expectedAmount: '1',
  fetchImpl: mockFetch,
  env: { GLR_ETHEREUM_PAYMENT_RECIPIENT: recipient, GLR_ETHEREUM_MIN_CONFIRMATIONS: '12' }
});
expect(verified.verified && verified.confirmations === 13, 'valid mainnet receipt with exact GLR transfer and finality must verify');

let disabled = false;
try {
  await verifyEthereumGLRTransfer({ transactionHash: txHash, expectedAmount: '1', fetchImpl: mockFetch, env: {} });
} catch { disabled = true; }
expect(disabled, 'verifier must remain disabled until recipient is configured');

const wrongChainFetch: typeof fetch = async (_input, init) => {
  const body = JSON.parse(String(init?.body || '{}'));
  const result = body.method === 'eth_chainId' ? '0x38' : payloads[body.method];
  return new Response(JSON.stringify({ jsonrpc: '2.0', id: body.id, result }), { status: 200, headers: { 'content-type': 'application/json' } });
};
let wrongChainRejected = false;
try {
  await verifyEthereumGLRTransfer({
    transactionHash: txHash, expectedAmount: '1', fetchImpl: wrongChainFetch,
    env: { GLR_ETHEREUM_PAYMENT_RECIPIENT: recipient }
  });
} catch { wrongChainRejected = true; }
expect(wrongChainRejected, 'wrong chain must be rejected');

console.log('Ethereum GLR verifier tests passed.');
