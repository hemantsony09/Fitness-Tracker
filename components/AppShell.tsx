'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Home, PlusCircle, Calendar, History, List, LogOut, User } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface AppShellProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: 'Today', icon: Home },
  { path: '/logger', label: 'Logger', icon: PlusCircle },
  { path: '/planner', label: 'Planner', icon: Calendar },
  { path: '/history', label: 'History', icon: History },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  // Don't show nav on auth page
  if (pathname === '/auth') {
    return <>{children}</>;
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* User info bar */}
      {user && (
        <div className="sticky top-0 z-20 bg-black border-b border-gray-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {user.picture && (
                  <Image
                    src={user.picture}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium text-white">{user.name}</span>
              </div>
          <button
            onClick={() => logout()}
            className="p-2 text-gray-400 hover:text-white active:bg-black rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
      
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center justify-center flex-1 h-full relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-black rounded-t-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon
                  className={`relative z-10 ${
                    isActive ? 'text-white' : 'text-gray-600'
                  }`}
                  size={24}
                />
                <span
                  className={`relative z-10 text-xs mt-1 ${
                    isActive ? 'text-white font-semibold' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

