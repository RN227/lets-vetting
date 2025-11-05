'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AuthExample } from '@/components/auth-example';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to onboarding
  useEffect(() => {
    if (user && !loading) {
      router.push('/onboarding');
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show home page if authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to LetsVet</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your pet health triage companion
        </p>
      </div>

      <div className="w-full max-w-md">
        <AuthExample />
      </div>
    </main>
  );
}
