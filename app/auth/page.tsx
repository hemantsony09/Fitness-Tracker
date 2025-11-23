'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';

export default function AuthPage() {
  const router = useRouter();
  const { googleLogin, isLoading } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await googleLogin();
      router.push('/');
    } catch (err: any) {
      console.error('Google auth error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site.');
      } else {
        setError(`Google sign-in failed: ${err.message || 'Unknown error'}`);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3 text-white">Fitness Tracker</h1>
            <p className="text-gray-300 text-lg">
              Sign in with Google to continue
            </p>
          </div>

          {/* Google Sign In */}
          <div className="mb-6">
            <Button
              fullWidth
              size="lg"
              onClick={handleGoogleSignIn}
              disabled={loading || isLoading}
              className="bg-white hover:bg-gray-200 text-black border-2 border-white flex items-center justify-center gap-3 h-14 text-lg"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-black border border-gray-800 rounded-xl text-gray-300 text-sm text-center">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
              <p className="text-sm text-gray-400 mt-2">Signing in...</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
