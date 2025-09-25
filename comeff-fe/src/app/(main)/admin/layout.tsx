// src/app/(main)/admin/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAdminData } from "@/features/admin/hooks/useAdminData";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loading } = useAdminData();

  useEffect(() => {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null;
    // console.log("AdminLayout - User:", user);

    if (user?.role !== 'Platform Operator') {
      console.warn("Unauthorized access attempt to admin page. Redirecting...");
      router.push('/');
    } 
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-40 w-40 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}