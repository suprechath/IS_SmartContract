// src/app/(main)/dashboard/creator/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null;
    console.log('User role:', user?.role);
    if (user?.role !== 'Project Creator') {
      console.warn("Unauthorized access attempt to project creator page. Redirecting...");
      router.push('/');
    } else if (user?.sanction_status !== 'Verified') {
      alert("Your account is pending verification. \nYou will be redirected to the pending verification page.");
      console.warn("User not approved. Redirecting to pending verification page...");
      router.push('/pending-verification');
    }
  }, []);

  return <>{children}</>;
}