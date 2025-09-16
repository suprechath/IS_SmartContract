// src/lib/web3/wagmi.ts
import { http, createConfig } from 'wagmi';
import { optimismSepolia, hardhat } from 'wagmi/chains';
import { chains } from './chains';

export const config = createConfig({
  chains: chains,
  transports: {
    [optimismSepolia.id]: http(),
    [hardhat.id]: http(),
  },
  ssr: true, // Enable SSR for Next.js
});