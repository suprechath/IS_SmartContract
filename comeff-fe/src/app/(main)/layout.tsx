// src/app/(main)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';

export default function MainLayout({children,}: {children: React.ReactNode;}) {
  const { user, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if the user object exists and their sanction status is 'Pending'
    if (user && user.sanction_status === 'Pending') {
      // If they are not already on the pending page, redirect them.
      // This prevents an infinite redirect loop.
      if (pathname !== '/pending-verification') {
        router.push('/pending-verification');
      }
    }
    // Optional: If a user with 'Clear' status lands on the pending page, redirect them away.
    else if (user && user.sanction_status === 'Clear' && pathname === '/pending-verification') {
        router.push('/dashboard'); // or wherever you want them to go
    }

  }, [user, pathname, router]);


  // You might want to show a loader here while the user state is being determined
  // to prevent a flicker of content before a redirect.
  if (user && user.sanction_status === 'Pending' && pathname !== '/pending-verification') {
      return <div>Loading...</div>; // Or a proper loading spinner component
  }

  return (
    <>
      {/* Your Header, Footer, etc. can go here */}
      <main>{children}</main>
    </>
  );
}