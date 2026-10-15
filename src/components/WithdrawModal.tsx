import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet, 
  CheckCircle2, 
  Landmark, 
  CreditCard, 
  Coins, 
  ShieldCheck, 
  RefreshCw, 
  Copy, 
  Check, 
  Zap, 
  Plus, 
  Trash2, 
  Shield, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { SovereignStats, MonetizationPolicy } from '../types';
import { authenticatedFetch } from '../lib/firebase';

interface WithdrawModalProps {
  stats: SovereignStats;
  policy: MonetizationPolicy;
  onClose: () => void;
  onWithdrawSuccess: (amount: number, method: string, txHash: string) => void;
  onUpdatePolicy?: (newPolicy: Partial<MonetizationPolicy>) => void;
  userReference?: string;
}

export type CryptoChain = 'ETH' | 'SOL' | 'BTC';
export type StablecoinType = 'USDC' | 'USDT' | 'DAI' | 'PYUSD';
export type CryptoNetwork = 'Base' | 'Solana' | 'Polygon' | 'Arbitrum' | 'Ethereum' | 'Bitcoin';

export interface VerifiedWallet {
  id: string;
  chain: CryptoChain;
  name: string;
  address: string;
  isVerified: boolean;
  verificationMethod: string;
  addedAt: string;
}

interface SupportedToken {
  symbol: StablecoinType;
  name: string;
  peg: string;
  iconBg: string;
  badgeColor: string;
}

const SUPPORTED_STABLECOINS: SupportedToken[] = [
  { symbol: 'USDC', name: 'USD Coin (Circle)', peg: '1:1 USD', iconBg: 'bg-blue-500/20 text-blue-400', badgeColor: 'text-blue-400 border-blue-500/30' },
  { symbol: 'USDT', name: 'Tether USD', peg: '1:1 USD', iconBg: 'bg-emerald-500/20 text-emerald-400', badgeColor: 'text-emerald-400 border-emerald-500/30' },
  { symbol: 'DAI', name: 'Dai / USDS (Sky)', peg: '1:1 USD', iconBg: 'bg-amber-500/20 text-amber-400', badgeColor: 'text-amber-400 border-amber-500/30' },
  { symbol: 'PYUSD', name: 'PayPal USD', peg: '1:1 USD', iconBg: 'bg-cyan-500/20 text-cyan-400', badgeColor: 'text-cyan-400 border-cyan-500/30' }
];

const NETWORKS: { id: CryptoNetwork; name: string; speed: string; gasSubsidy: string; chain: CryptoChain }[] = [
  { id: 'Base', name: 'Base L2', speed: '~1 sec', gasSubsidy: 'Provider-dependent fee', chain: 'ETH' },
  { id: 'Solana', name: 'Solana SPL', speed: '~400 ms', gasSubsidy: 'Provider-dependent fee', chain: 'SOL' },
  { id: 'Polygon', name: 'Polygon PoS', speed: '~2 sec', gasSubsidy: 'Provider-dependent fee', chain: 'ETH' },
  { id: 'Arbitrum', name: 'Arbitrum One', speed: '~1 sec', gasSubsidy: 'Provider-dependent fee', chain: 'ETH' },
  { id: 'Ethereum', name: 'Ethereum Mainnet', speed: '~12 sec', gasSubsidy: 'Standard Relay', chain: 'ETH' },
  { id: 'Bitcoin', name: 'BTC Lightning Relay', speed: '~2 sec', gasSubsidy: 'Provider-dependent fee', chain: 'BTC' }
];

const DEFAULT_VERIFIED_WALLETS: VerifiedWallet[] = [];


export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  policy,
  onClose,
  onWithdrawSuccess,
  onUpdatePolicy,
  userReference = 'anonymous'
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [verifiedAvailableUsd, setVerifiedAvailableUsd] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  type PayoutMethod = 'crypto' | 'gcash' | 'binance' | 'fiat';
  const [payoutCategory, setPayoutCategory] = useState<PayoutMethod>('crypto');
  const [gcashAccount, setGcashAccount] = useState('');
  const [binanceAccount, setBinanceAccount] = useState('');

  // Payout destinations are session state only until a provider-backed
  // wallet registry and ownership attestation are available.
  const [connectedWallets, setConnectedWallets] = useState<VerifiedWallet[]>(DEFAULT_VERIFIED_WALLETS);

  const [walletFilter, setWalletFilter] = useState<'ALL' | CryptoChain>('ALL');
  const [showAddWalletForm, setShowAddWalletForm] = useState(false);

  // New Wallet Form State
  const [newWalletChain, setNewWalletChain] = useState<CryptoChain>('ETH');
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [addWalletError, setAddWalletError] = useState<string | null>(null);
  const [isVerifyingNewWallet, setIsVerifyingNewWallet] = useState(false);

  // Crypto Configuration
  const [selectedToken, setSelectedToken] = useState<StablecoinType>('USDC');
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>('Base');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [connectedWalletName, setConnectedWalletName] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fiat Configuration
  const [fiatMethod, setFiatMethod] = useState<'stripe_connect' | 'direct_ach'>('stripe_connect');
  const [fiatAccount, setFiatAccount] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [copiedTx, setCopiedTx] = useState(false);
  useEffect(() => {
    let cancelled = false;
    if (!userReference || userReference === 'anonymous') {
      setVerifiedAvailableUsd(null);
      setAmount(0);
      return;
    }
    setBalanceLoading(true);
    void fetch('/api/payouts?userReference=' + encodeURIComponent(userReference), { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data?.ok !== true || !data?.balance || !Number.isFinite(Number(data.balance.availableUsd))) {
          throw new Error(data?.error || 'Verified payout balance is unavailable.');
        }
        if (cancelled) return;
        const available = Math.max(0, Number(data.balance.availableUsd));
        setVerifiedAvailableUsd(available);
        setAmount(available);
      })
      .catch((error) => {
        if (cancelled) return;
        setVerifiedAvailableUsd(null);
        setAmount(0);
        setPayoutError(error instanceof Error ? error.message : 'Verified payout balance is unavailable.');
      })
      .finally(() => { if (!cancelled) setBalanceLoading(false); });
    return () => { cancelled = true; };
  }, [userReference]);

  const [settledReceipt, setSettledReceipt] = useState<{
    txHash: string;
    amountUsd: number;
    tokenSymbol: string;
    network: string;
    destination: string;
    timestamp: string;
    isCrypto: boolean;
  } | null>(null);

  // Address validation per chain
  const validateAddress = (addr: string, chain: CryptoChain): boolean => {
    const trimmed = addr.trim();
    if (!trimmed) return false;
    if (chain === 'ETH') {
      return /^0x[a-fA-F0-9]{40}$/.test(trimmed);
    }
    if (chain === 'SOL') {
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed);
    }
    if (chain === 'BTC') {
      // SegWit (bc1q/bc1p), Legacy (1), or P2SH (3)
      return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(trimmed);
    }
    return false;
  };

  // Determine active chain based on active wallet address
  const getActiveAddressChain = (): CryptoChain => {
    const matched = connectedWallets.find(w => w.address.toLowerCase() === walletAddress.toLowerCase());
    if (matched) return matched.chain;
    if (walletAddress.startsWith('0x')) return 'ETH';
    if (walletAddress.startsWith('bc1') || walletAddress.startsWith('1') || walletAddress.startsWith('3')) return 'BTC';
    return 'SOL';
  };

  const isCurrentAddressValid = () => {
    if (payoutCategory === 'gcash') return /^09\\d{9}$/.test(gcashAccount.replace(/\\s|-/g, ''));
    if (payoutCategory === 'binance') return binanceAccount.trim().length >= 4;
    if (payoutCategory === 'fiat') return fiatAccount.trim().length > 3;
    if (!walletAddress.trim()) return false;
    const chain = getActiveAddressChain();
    return validateAddress(walletAddress, chain);
  };

  // Selecting a wallet from the list
  const handleSelectWallet = (wallet: VerifiedWallet) => {
    setWalletAddress(wallet.address);
    setConnectedWalletName(wallet.name);

    // Auto-adjust default network
    if (wallet.chain === 'ETH') {
      if (selectedNetwork === 'Solana' || selectedNetwork === 'Bitcoin') {
        setSelectedNetwork('Base');
      }
    } else if (wallet.chain === 'SOL') {
      setSelectedNetwork('Solana');
    } else if (wallet.chain === 'BTC') {
      setSelectedNetwork('Bitcoin');
    }
  };

  // Removing a wallet from the list
  const handleRemoveWallet = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = connectedWallets.find(w => w.id === id);
    if (!target) return;

    const remaining = connectedWallets.filter(w => w.id !== id);
    setConnectedWallets(remaining);

    // If active wallet was removed, fallback to first available or empty
    if (walletAddress.toLowerCase() === target.address.toLowerCase()) {
      if (remaining.length > 0) {
        handleSelectWallet(remaining[0]);
      } else {
        setWalletAddress('');
        setConnectedWalletName(null);
      }
    }
  };

  // Adding a new verified wallet
  const handleAddWallet = () => {
    setAddWalletError(null);
    if (!newWalletName.trim()) {
      setAddWalletError('Please enter a wallet label or account name.');
      return;
    }
    if (!validateAddress(newWalletAddress, newWalletChain)) {
      if (newWalletChain === 'ETH') {
        setAddWalletError('Invalid ETH address format. Must begin with 0x followed by 40 hex characters.');
      } else if (newWalletChain === 'SOL') {
        setAddWalletError('Invalid SOL address format. Must be 32-44 base58 characters.');
      } else {
        setAddWalletError('Invalid BTC address format. Must be a valid SegWit (bc1), Legacy (1), or Script (3) address.');
      }
      return;
    }

    // Check duplicate
    const exists = connectedWallets.some(
      w => w.address.toLowerCase() === newWalletAddress.trim().toLowerCase()
    );
    if (exists) {
      setAddWalletError('This wallet address is already added to your verified list.');
      return;
    }

    setIsVerifyingNewWallet(true);

    // Wallet destinations remain session-scoped until real provider ownership attestation exists.
    // Adding an address is not cryptographic ownership verification.
    // Keep it unverified until a real provider/wallet attestation is implemented.
    const created: VerifiedWallet = {
      id: `w-${newWalletChain.toLowerCase()}-${Date.now()}`,
      chain: newWalletChain,
      name: newWalletName.trim(),
      address: newWalletAddress.trim(),
      isVerified: false,
      verificationMethod: 'Pending real ownership attestation',
      addedAt: new Date().toISOString()
    };

    setConnectedWallets(prev => [created, ...prev]);
    setNewWalletName('');
    setNewWalletAddress('');
    setIsVerifyingNewWallet(false);
    setShowAddWalletForm(false);
    setAddWalletError(null);
  };

  const handleCopyAddress = (id: string, addr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(addr);
    setCopiedId(id);
  };

  const handleWithdraw = async () => {
    if (verifiedAvailableUsd == null || !Number.isFinite(amount) || amount <= 0 || amount > verifiedAvailableUsd) {
      setPayoutError('A server-confirmed available payout balance is required. Enter an amount within that balance.');
      return;
    }
    if (!isCurrentAddressValid()) {
      setPayoutError(
        payoutCategory === 'crypto'
          ? 'Select or enter a valid destination address.'
          : payoutCategory === 'gcash'
            ? 'Enter a valid GCash mobile number (09XXXXXXXXX).'
            : payoutCategory === 'binance'
              ? 'Enter a valid Binance Pay ID, Binance UID, or approved account identifier.'
              : 'Enter a valid payout account or provider destination.'
      );
      return;
    }

    setIsProcessing(true);
    setPayoutError(null);
    try {
      const method = payoutCategory === 'crypto'
        ? `stablecoin_${selectedToken.toLowerCase()}_${selectedNetwork.toLowerCase()}`
        : payoutCategory === 'gcash'
          ? 'gcash'
          : payoutCategory === 'binance'
            ? 'binance'
            : fiatMethod;
      const destination = payoutCategory === 'crypto'
        ? walletAddress
        : payoutCategory === 'gcash'
          ? gcashAccount.replace(/\\s|-/g, '')
          : payoutCategory === 'binance'
            ? binanceAccount.trim()
            : fiatAccount;
      const res = await authenticatedFetch('/api/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method, destination, userReference, actor: 'human-owner' })
      });
      const data = await res.json().catch(() => ({}));
      const payout = data?.payout;
      if (!res.ok || data?.ok !== true || !payout?.payoutRequestId || payout.status !== 'pending') {
        throw new Error(data?.error || payout?.note || `Payout request was not accepted (HTTP ${res.status}).`);
      }

      setSettledReceipt({
        txHash: payout.payoutRequestId,
        amountUsd: amount,
        tokenSymbol: payoutCategory === 'crypto' ? selectedToken : 'USD',
        network: payoutCategory === 'crypto'
          ? selectedNetwork
          : payoutCategory === 'gcash'
            ? 'GCash'
            : payoutCategory === 'binance'
              ? 'Binance'
              : (fiatMethod === 'stripe_connect' ? 'Stripe Connect' : 'ACH'),
        destination,
        timestamp: new Date().toLocaleString(),
        isCrypto: payoutCategory === 'crypto'
      });
      onWithdrawSuccess(amount, method, payout.payoutRequestId);
    } catch (error) {
      setPayoutError(error instanceof Error ? error.message : 'Payout request failed.');
      console.error('Payout request failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyTx = () => {
    if (!settledReceipt) return;
    navigator.clipboard.writeText(settledReceipt.txHash);
    setCopiedTx(true);
  };

  const filteredWallets = connectedWallets.filter(w => {
    if (walletFilter === 'ALL') return true;
    return w.chain === walletFilter;
  });

  const getChainBadge = (chain: CryptoChain) => {
    switch (chain) {
      case 'ETH':
        return {
          label: 'ETH',
          badgeClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
        };
      case 'SOL':
        return {
          label: 'SOL',
          badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
        };
      case 'BTC':
        return {
          label: 'BTC',
          badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
        };
    }
  };
