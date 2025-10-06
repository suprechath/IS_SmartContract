// src/app/page.tsx
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Why from '@/components/Why';

export default function Home() {
  return (
    <main className="min-h-screen flex-col items-center justify-center p-15">
      <div className="text-center">
        <Hero />
        <HowItWorks />
        <Why />
      </div>
    </main>
  );
}