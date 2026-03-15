'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] | object }) => Promise<any>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

const BSC_MAINNET_CHAIN_ID = '0x38';

function shortAddress(value: string) {
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export default function NfaWalletPanel() {
  const [account, setAccount] = useState<string>('');
  const [chainId, setChainId] = useState<string>('');
  const [providerReady, setProviderReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const provider = window.ethereum;
    setProviderReady(Boolean(provider));

    if (!provider) {
      return;
    }

    const syncState = async () => {
      try {
        const [accounts, currentChainId] = await Promise.all([
          provider.request({ method: 'eth_accounts' }),
          provider.request({ method: 'eth_chainId' })
        ]);
        setAccount(Array.isArray(accounts) && accounts[0] ? String(accounts[0]) : '');
        setChainId(String(currentChainId || ''));
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : 'Wallet sync failed');
      }
    };

    const handleAccountsChanged = (accounts: unknown) => {
      if (Array.isArray(accounts) && accounts[0]) {
        setAccount(String(accounts[0]));
        return;
      }
      setAccount('');
    };

    const handleChainChanged = (nextChainId: unknown) => {
      setChainId(String(nextChainId || ''));
    };

    syncState();
    provider.on?.('accountsChanged', handleAccountsChanged);
    provider.on?.('chainChanged', handleChainChanged);

    return () => {
      provider.removeListener?.('accountsChanged', handleAccountsChanged);
      provider.removeListener?.('chainChanged', handleChainChanged);
    };
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('No injected wallet detected. Try Binance Wallet, MetaMask, or OKX Wallet.');
      return;
    }

    setConnecting(true);
    setError('');
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const nextChainId = await window.ethereum.request({ method: 'eth_chainId' });
      setAccount(Array.isArray(accounts) && accounts[0] ? String(accounts[0]) : '');
      setChainId(String(nextChainId || ''));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Wallet connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const switchToBsc = async () => {
    if (!window.ethereum) {
      setError('No injected wallet detected.');
      return;
    }

    setConnecting(true);
    setError('');
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_MAINNET_CHAIN_ID }]
      });
      const nextChainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(String(nextChainId || ''));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Network switch failed');
    } finally {
      setConnecting(false);
    }
  };

  const connected = Boolean(account);
  const onBsc = chainId.toLowerCase() === BSC_MAINNET_CHAIN_ID;

  return (
    <div className="rounded-[28px] border border-gold/20 bg-panel/90 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.35em] text-gold/70">
            Wallet Access
          </div>
          <h2 className="mt-3 text-2xl font-heading font-bold text-text-main">
            NFA Preview Gate
          </h2>
        </div>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-300">
          Preview
        </span>
      </div>

      <div className="mt-6 grid gap-3">
        <div className="rounded-2xl border border-white/8 bg-bg/70 p-4">
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-sub/60">
            Provider
          </div>
          <div className="mt-2 text-sm text-text-main">
            {providerReady ? 'Injected wallet detected' : 'No injected wallet detected'}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-bg/70 p-4">
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-sub/60">
            Account
          </div>
          <div className="mt-2 text-sm text-text-main">
            {connected ? shortAddress(account) : 'Not connected'}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-bg/70 p-4">
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-sub/60">
            Network
          </div>
          <div className="mt-2 text-sm text-text-main">
            {connected ? (onBsc ? 'BSC Mainnet Ready' : `Current chain ${chainId || 'unknown'}`) : 'Connect first'}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {!connected ? (
          <button
            type="button"
            onClick={connectWallet}
            disabled={connecting}
            className="rounded-2xl bg-gold px-5 py-3 text-sm font-heading font-bold text-bg transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : !onBsc ? (
          <button
            type="button"
            onClick={switchToBsc}
            disabled={connecting}
            className="rounded-2xl bg-gold px-5 py-3 text-sm font-heading font-bold text-bg transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {connecting ? 'Switching...' : 'Switch To BSC'}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="rounded-2xl border border-gold/20 bg-gold/10 px-5 py-3 text-sm font-heading font-bold text-gold opacity-80"
          >
            Mint Not Live Yet
          </button>
        )}

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}
      </div>

      <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
        <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-gold/80">
          Wallet Notes
        </div>
        <ul className="mt-3 space-y-2 text-sm text-text-sub">
          <li>Use Binance Wallet, MetaMask, or OKX Wallet with BSC Mainnet enabled.</li>
          <li>This page only handles connection and network readiness. Mint flow stays disabled for now.</li>
          <li>If the button does nothing, refresh once after wallet installation and reconnect.</li>
        </ul>
      </div>
    </div>
  );
}
