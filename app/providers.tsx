'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    async function initMSW() {
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        try {
          const { worker } = await import('@/lib/msw');
          if (worker) {
            await worker.start({
              onUnhandledRequest: 'bypass',
            });
          }
          setMswReady(true);
        } catch (error) {
          // Continue even if MSW fails - app will work without mocks
          setMswReady(true);
        }
      } else {
        setMswReady(true);
      }
    }

    initMSW();
  }, []);

  if (!mswReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

