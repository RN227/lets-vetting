'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getUserPets } from '@/lib/services/pets';

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Redirect authenticated non-anonymous users to chat or onboarding
  useEffect(() => {
    async function checkUserPets() {
      if (user && !loading && !user.isAnonymous) {
        try {
          const pets = await getUserPets(user.uid);
          if (pets.length > 0) {
            // User has pets, redirect to chat
            router.push(`/chat?petId=${pets[0].id}`);
          } else {
            // User has no pets, redirect to onboarding
            router.push('/onboarding');
          }
        } catch (err) {
          console.error('Error checking user pets:', err);
          // On error, redirect to onboarding
          router.push('/onboarding');
        }
      }
    }

    checkUserPets();
  }, [user, loading, router]);

  const handleAlreadyHaveAccount = () => {
    setShowLogin(true);
  };

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign in error:', err);
      setIsSigningIn(false);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#073F6C]">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4">
            <div className="spinner w-full h-full"></div>
          </div>
          <p className="text-white text-sm">Loading</p>
        </div>
      </div>
    );
  }

  // Don't show home page if authenticated non-anonymous user (will redirect)
  if (user && !user.isAnonymous) {
    return null;
  }

  return (
    <main className="h-screen w-screen flex flex-col px-4 sm:px-6 bg-[#073F6C] relative overflow-hidden">
      {/* Logo and tagline - positioned in top half */}
      <div className="flex flex-col items-center justify-center flex-1">
        <img
          src="/logo.png"
          alt="LetsVet Logo"
          className="max-w-[280px] w-auto h-auto"
          style={{ maxWidth: '280px', height: 'auto' }}
        />
        <p className="text-white text-center text-sm font-light mt-1 px-4 whitespace-nowrap">
          Instant AI guidance for your pet&apos;s health concerns
        </p>
      </div>

      {/* Container for buttons and login - positioned at bottom */}
      <div className="w-full max-w-md lg:max-w-lg mx-auto pb-12 sm:pb-8" style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom, 0px) + 2rem)' }}>
        {/* Buttons */}
        {!showLogin && (
          <div className="w-full space-y-3">
          {/* Primary Button */}
          <button
            onClick={() => router.push('/onboarding/why')}
            className="w-full px-6 py-3.5 bg-white text-[#073F6C] rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 font-bold text-sm uppercase touch-target shadow-md"
          >
            Get Started
          </button>

          {/* Secondary Button */}
          <button
            onClick={handleAlreadyHaveAccount}
            className="w-full px-6 py-3.5 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 active:scale-[0.98] transition-all duration-200 font-bold text-sm uppercase touch-target shadow-md"
          >
            I Already Have an Account
          </button>
          </div>
        )}

        {/* Login Section */}
        {showLogin && (
          <div className="w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-light text-white mb-3">Welcome Back</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Sign in to continue with your account
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-[#073F6C] rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 font-bold text-sm uppercase touch-target shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (
              <>
                <div className="spinner w-4 h-4 border-2 border-[#073F6C] border-t-transparent"></div>
                <span>Signing In</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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

          {/* Back Button */}
          <button
            onClick={() => setShowLogin(false)}
            className="w-full mt-4 px-6 py-3.5 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 active:scale-[0.98] transition-all duration-200 font-bold text-sm uppercase touch-target shadow-md"
          >
            Back
          </button>
          </div>
        )}
      </div>
    </main>
  );
}
