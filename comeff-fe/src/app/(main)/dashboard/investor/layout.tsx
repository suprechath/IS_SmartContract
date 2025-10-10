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
    } else if (user?.sanction_status !== 'Verified') {
      alert("Your account is not verified.\nPlease complete the verification process.");
      console.warn("User not verified. Redirecting to pending verification page...");
      router.push('/pending-verification');
    }
  }, []);

  return <>{children}</>;
}