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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
