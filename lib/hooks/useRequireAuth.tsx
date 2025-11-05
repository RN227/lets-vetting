'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { User } from 'firebase/auth';

/**
 * Custom hook for protected routes that require authentication
 *
 * Features:
 * - Checks if user is authenticated
 * - Redirects to /login if not authenticated
 * - Shows loading state while checking auth
 * - Returns the current user once authenticated
 *
 * @returns Object containing user and loading state, or null during redirect
 *
 * @example
 * ```tsx
 * export default function ProtectedPage() {
 *   const auth = useRequireAuth();
 *
 *   if (!auth) {
 *     return null; // or loading spinner
 *   }
 *
 *   const { user, loading } = auth;
 *
 *   return <div>Welcome {user.displayName}</div>;
 * }
 * ```
 */
export function useRequireAuth(): { user: User; loading: boolean } | null {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're done loading and there's no user
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Return null if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Return user and loading state once authenticated
  return { user, loading };
}

/**
 * Loading component to show while checking authentication
 * Can be used in protected pages
 */
export function AuthLoadingScreen() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#073F6C] overflow-hidden">
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-4">
          <div className="spinner w-full h-full border-2 border-white border-t-transparent"></div>
        </div>
        <p className="text-white text-sm">Loading</p>
      </div>
    </div>
  );
}
