// src/app/(main)/admin/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, token } = useAuth();
  const router = useRouter();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null;

  useEffect(() => {
    if (!isLoading) {
      // if (!token || user?.role !== 'Platform Operator') {
      if (user?.role !== 'Platform Operator') {
        console.warn("Unauthorized access attempt to admin page. Redirecting...");
        router.push('/');
      }
    }
  }, [router, token]);

  if (user?.role === 'Platform Operator') {
    return <>{children}</>;
  }

  return null;
}