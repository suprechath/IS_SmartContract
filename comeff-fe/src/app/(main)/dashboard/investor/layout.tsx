'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null;
    console.log('User role:', user?.role);
    if (user?.role !== 'Investor') {
      console.warn("Unauthorized access attempt to investor page. Redirecting...");
      router.push('/');
    } 
  }, []);

  return <>{children}</>;
}