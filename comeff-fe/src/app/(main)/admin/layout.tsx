// src/app/(main)/admin/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null;
    if (user?.role !== 'Platform Operator') {
      console.warn("Unauthorized access attempt to admin page. Redirecting...");
      router.push('/');
    } 
  }, []);

  return <>{children}</>;
}