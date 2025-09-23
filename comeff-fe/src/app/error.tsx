// src/app/error.tsx
'use client'; 

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardContent className="p-8 text-center">
            <div className="mb-6 flex justify-center">
               <div className="rounded-full bg-destructive/10 p-6">
                 <AlertTriangle className="h-16 w-16 text-destructive" />
               </div>
            </div>

            <h2 className="mb-4 text-2xl font-semibold text-foreground">
                Something went wrong!
            </h2>
            <p className="mb-8 text-muted-foreground">
                An unexpected error occurred. Please try again.
            </p>
            <Button
              onClick={
                // Attempt to recover by re-rendering the segment
                () => reset()
              }
            >
              Try again
            </Button>
        </CardContent>
      </Card>
    </main>
  );
}