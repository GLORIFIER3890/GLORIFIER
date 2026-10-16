import { verifyEvmGLRTransfer, type EvmGLRVerifierInput, type EvmGLRVerification } from './glr-evm-verifier';
export { glrAmountToBaseUnits } from './glr-evm-verifier';

export const ETHEREUM_GLR_CONTRACT = '0x9db6f9afe2f4ada50060d32d7c7c0bebbccf89eb';
export type EthereumGLRVerification = EvmGLRVerification<'eip155:1'>;

export function verifyEthereumGLRTransfer(
  input: EvmGLRVerifierInput,
): Promise<EthereumGLRVerification> {
  return verifyEvmGLRTransfer(input, {
    contractAddress: ETHEREUM_GLR_CONTRACT,
    network: 'eip155:1',
    chainIdHex: '0x1',
    chainName: 'Ethereum mainnet',
    defaultRpcUrl: 'https://cloudflare-eth.com',
    rpcUrlEnv: 'GLR_ETHEREUM_RPC_URL',
    recipientEnv: 'GLR_ETHEREUM_PAYMENT_RECIPIENT',
    minimumConfirmationsEnv: 'GLR_ETHEREUM_MIN_CONFIRMATIONS',
    evidencePrefix: 'ethereum-mainnet-rpc',
  });
}
