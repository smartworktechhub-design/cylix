import { createPublicClient, createWalletClient, http, parseUnits, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bsc } from 'viem/chains';
import { USDT_ADDRESS, BSC_RPC_URL } from './constants';

const USDT_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
] as const;

const USDT_DECIMALS = 18;

function getPayoutKey(): `0x${string}` | null {
  const key = process.env.PAYOUT_PRIVATE_KEY;
  if (!key) return null;
  return (key.startsWith('0x') ? key : `0x${key}`) as `0x${string}`;
}

function getPayoutWallet(): string | null {
  return process.env.PAYOUT_WALLET_ADDRESS || null;
}

function getPublicClient() {
  return createPublicClient({
    chain: bsc,
    transport: http(BSC_RPC_URL),
  });
}

export async function getHotWalletBalance(): Promise<number> {
  const wallet = getPayoutWallet();
  if (!wallet) throw new Error('PAYOUT_WALLET_ADDRESS not configured');
  const client = getPublicClient();
  const balance = await client.readContract({
    address: USDT_ADDRESS as `0x${string}`,
    abi: USDT_ABI,
    functionName: 'balanceOf',
    args: [wallet as `0x${string}`],
  });
  return Number(formatUnits(balance as bigint, USDT_DECIMALS));
}

export async function sendUSDT(toAddress: string, amount: number): Promise<string> {
  const key = getPayoutKey();
  if (!key) throw new Error('PAYOUT_PRIVATE_KEY not configured');
  const account = privateKeyToAccount(key);
  const walletClient = createWalletClient({
    account,
    chain: bsc,
    transport: http(BSC_RPC_URL),
  });
  const value = parseUnits(amount.toFixed(2), USDT_DECIMALS);
  const hash = await walletClient.writeContract({
    account: account.address,
    address: USDT_ADDRESS as `0x${string}`,
    abi: USDT_ABI,
    functionName: 'transfer',
    args: [toAddress as `0x${string}`, value],
  });
  return hash;
}

export function isPayoutConfigured(): boolean {
  return !!getPayoutKey() && !!getPayoutWallet();
}

export { getPayoutWallet };
