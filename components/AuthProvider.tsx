'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { authStorage, getInitialAuthState, type AuthState, type AuthUser } from '@/lib/auth';

interface AuthContextType extends AuthState {
  googleLogin: () => Promise<void>;
  guestLogin: () => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<AuthState>(getInitialAuthState);
  const [isLoading, setIsLoading] = useState(true);

  // Check for redirect result on mount
  useEffect(() => {
    if (!auth) return;
    
    // Check if we're returning from a redirect
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User signed in via redirect, state will update via onAuthStateChanged
          console.log('Redirect sign-in successful');
        }
      })
      .catch((error) => {
        console.error('Redirect sign-in error:', error);
      });
  }, []);

  // Check for guest mode and initialize auth state
  useEffect(() => {
    const stored = authStorage.get();
    if (stored?.user?.id === 'guest') {
      setAuthState(stored);
      setIsLoading(false);
      return;
    }

    // If not guest and no auth available, set loading to false after a short delay
    if (!auth) {
      // Give Firebase a moment to initialize, then set loading to false
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen to Firebase auth state changes (only if not guest)
  useEffect(() => {
    const stored = authStorage.get();
    if (stored?.user?.id === 'guest') {
      return; // Skip Firebase auth for guests
    }

    if (!auth) {
      // If auth is not available, ensure loading is set to false
      setIsLoading(false);
      return;
    }

    // Set a timeout to ensure loading doesn't stay true forever
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Max 3 seconds wait

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      clearTimeout(loadingTimeout); // Clear timeout once we get auth state
      
      if (firebaseUser) {
        const user: AuthUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email || 'User',
          picture: firebaseUser.photoURL || undefined,
        };
        const newState: AuthState = {
          user,
          token: 'firebase-token', // Firebase handles tokens internally
          isAuthenticated: true,
        };
        setAuthState(newState);
        authStorage.set(newState);
      } else {
        const newState: AuthState = {
          user: null,
          token: null,
          isAuthenticated: false,
        };
        setAuthState(newState);
        authStorage.clear();
      }
      setIsLoading(false);
    });

    return () => {
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, []);

  // Protect routes
  useEffect(() => {
    if (isLoading) return;
    
    const isAuthPage = pathname === '/auth';
    const isAuthenticated = authState.isAuthenticated;

    if (!isAuthenticated && !isAuthPage) {
      router.push('/auth');
    } else if (isAuthenticated && isAuthPage) {
      router.push('/');
    }
  }, [authState.isAuthenticated, pathname, isLoading, router]);

  const googleLogin = async () => {
    if (!auth) throw new Error('Firebase not initialized');
    const provider = new GoogleAuthProvider();
    
    // Try popup first, fallback to redirect if it fails
    try {
      await signInWithPopup(auth, provider);
      // Auth state will update automatically via onAuthStateChanged
    } catch (error: any) {
      // If popup fails due to unauthorized domain, use redirect
      if (error.code === 'auth/unauthorized-domain' || error.code === 'auth/popup-blocked') {
        console.log('Popup failed, using redirect instead');
        await signInWithRedirect(auth, provider);
        // Note: With redirect, the page will reload and getRedirectResult will handle it
      } else {
        throw error; // Re-throw other errors
      }
    }
  };

  const guestLogin = () => {
    const guestUser: AuthUser = {
      id: 'guest',
      email: 'guest@fitness-tracker.local',
      name: 'Guest User',
    };
    const newState: AuthState = {
      user: guestUser,
      token: 'guest-token',
      isAuthenticated: true,
    };
    setAuthState(newState);
    authStorage.set(newState);
    router.push('/');
  };

  const logout = async () => {
    // Check if guest mode
    if (authState.user?.id === 'guest') {
      const newState: AuthState = {
        user: null,
        token: null,
        isAuthenticated: false,
      };
      setAuthState(newState);
      authStorage.clear();
      router.push('/auth');
      return;
    }

    // Firebase logout
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      // Auth state will update automatically via onAuthStateChanged
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        googleLogin,
        guestLogin,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
