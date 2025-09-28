// src/app/(main)/dashboard/creator/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null;
    console.log('User role:', user?.role);
    if (user?.role !== 'Project Creator') {
      console.warn("Unauthorized access attempt to project creator page. Redirecting...");
      router.push('/');
    } 
  }, []);

  return <>{children}</>;
}