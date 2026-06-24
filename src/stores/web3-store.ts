import { create } from 'zustand';

interface Web3State {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string;
  isCorrectNetwork: boolean;
  setConnected: (connected: boolean) => void;
  setAddress: (address: string | null) => void;
  setChainId: (chainId: number | null) => void;
  setBalance: (balance: string) => void;
  setIsCorrectNetwork: (correct: boolean) => void;
}

export const useWeb3Store = create<Web3State>((set) => ({
  isConnected: false,
  address: null,
  chainId: null,
  balance: '0',
  isCorrectNetwork: false,
  setConnected: (isConnected) => set({ isConnected }),
  setAddress: (address) => set({ address }),
  setChainId: (chainId) => set({ chainId }),
  setBalance: (balance) => set({ balance }),
  setIsCorrectNetwork: (isCorrectNetwork) => set({ isCorrectNetwork }),
}));
