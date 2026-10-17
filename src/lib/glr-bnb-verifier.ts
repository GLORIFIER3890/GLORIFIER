import { verifyEvmGLRTransfer, type EvmGLRVerifierInput, type EvmGLRVerification } from './glr-evm-verifier';
export { glrAmountToBaseUnits } from './glr-evm-verifier';

export const BNB_GLR_CONTRACT = '0x5e0B0A449232FDA7cA6Ea3419A50873b08F64804';
export type BnbGLRVerification = EvmGLRVerification<'eip155:56'>;

export function verifyBnbGLRTransfer(
  input: EvmGLRVerifierInput,
): Promise<BnbGLRVerification> {
  return verifyEvmGLRTransfer(input, {
    contractAddress: BNB_GLR_CONTRACT,
    network: 'eip155:56',
    chainIdHex: '0x38',
    chainName: 'BNB Smart Chain mainnet',
    defaultRpcUrl: 'https://bsc-dataseed.binance.org',
    rpcUrlEnv: 'GLR_BNB_RPC_URL',
    recipientEnv: 'GLR_BNB_PAYMENT_RECIPIENT',
    minimumConfirmationsEnv: 'GLR_BNB_MIN_CONFIRMATIONS',
    evidencePrefix: 'bnb-mainnet-rpc',
  });
}
