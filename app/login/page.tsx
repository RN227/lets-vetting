'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getUserPets } from '@/lib/services/pets';

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect based on whether user has pets
  useEffect(() => {
    async function checkUserPets() {
      if (user && !loading) {
        setIsSigningIn(false);
        try {
          const pets = await getUserPets(user.uid);

          if (pets.length > 0) {
            router.push(`/chat?petId=${pets[0].id}`);
          } else {
            router.push('/onboarding');
          }
        } catch (err) {
          console.error('Error checking user pets:', err);
          router.push('/onboarding');
        }
      }
    }

    checkUserPets();
  }, [user, loading, router]);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign in error:', err);
      const errorMessage = err?.message || 'Failed to sign in. Please try again.';
      setError(errorMessage);
      setIsSigningIn(false);
    }
  };

  // Beautiful loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center fade-in">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="spinner w-full h-full"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8 sm:px-6">
      <div className="max-w-md w-full fade-in">
        {/* Card Container */}
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-gray-100">
          {/* Logo/Brand */}
          <div className="text-center mb-10">
            <div className="inline-block mb-4">
              <div className="text-6xl sm:text-7xl animate-bounce">🐾</div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              LetsVet
            </h1>
            <p className="text-gray-600 text-lg">
              AI-powered pet health guidance
            </p>
          </div>

          {/* Welcome Message */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Welcome
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Sign in to get personalized health advice for your furry friend
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl fade-in">
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-xl flex-shrink-0">⚠️</span>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Sign In Button */}
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 rounded-2xl hover:bg-gray-50 hover:border-blue-400 hover:shadow-lg active:scale-98 transition-all duration-200 font-semibold text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm touch-target"
          >
            {isSigningIn ? (
              <>
                <div className="spinner w-5 h-5"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
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
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Footer Text */}
          <p className="mt-6 text-center text-xs text-gray-500 leading-relaxed">
            By signing in, you agree to our Terms of Service<br className="sm:hidden" /> and Privacy Policy
          </p>
        </div>

        {/* Additional Info - Mobile optimized */}
        <div className="mt-6 sm:mt-8 text-center px-4">
          <div className="inline-flex items-center gap-2 text-gray-700 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className="text-xl">💬</span>
            <p className="text-sm font-medium">
              Instant AI guidance for pet health
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
