import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { USDT_ADDRESS, USDT_DECIMALS } from './constants';

export const USDT_ABI = [
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

export function useUsdtBalance(walletAddress?: `0x${string}`) {
  const { data, refetch } = useReadContract({
    address: USDT_ADDRESS,
    abi: USDT_ABI,
    functionName: 'balanceOf',
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: !!walletAddress },
  });

  return {
    balance: data ? Number(formatUnits(data as bigint, USDT_DECIMALS)) : 0,
    rawBalance: data as bigint | undefined,
    refetch,
  };
}

export function useUsdtTransfer() {
  const { writeContract, isPending, isSuccess, data: txHash } = useWriteContract();

  const transfer = async (to: `0x${string}`, amount: number) => {
    const value = parseUnits(amount.toString(), USDT_DECIMALS);
    await writeContract({
      address: USDT_ADDRESS,
      abi: USDT_ABI,
      functionName: 'transfer',
      args: [to, value],
    });
  };

  return { transfer, isPending, isSuccess, txHash };
}
