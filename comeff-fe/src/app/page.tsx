// src/app/page.tsx
import { WalletConnectButton } from '@/components/WalletConnectButton';
import Hero from '@/components/Hero';
import FeatureProject from '@/components/FeatureProject';

export default function Home() {
  return (
    <main className="min-h-screen flex-col items-center justify-center p-15">
      <div className="text-center">
        <Hero />
        <FeatureProject />
        <h1 className="text-4xl font-bold mb-4">Welcome to CommEfficient</h1>
        <p className="text-lg text-gray-600 mb-8">
          Invest in a sustainable future. Fund verified energy efficiency projects.
        </p>
        <WalletConnectButton />
      </div>
    </main>
  );
}