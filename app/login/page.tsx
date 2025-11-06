'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getUserPets } from '@/lib/services/pets';
import { auth } from '@/lib/firebase';

function LoginPageContent() {
  const { user, loading, signInWithGoogle, upgradeAnonymousAccount, isAnonymous } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);
  
  // Get petId and conversationId from URL params if they exist
  const urlPetId = searchParams.get('petId');
  const urlConversationId = searchParams.get('conversationId');

  useEffect(() => {
    async function checkUserPets() {
      // Only redirect if user is authenticated, not anonymous, and we haven't redirected yet
      // Don't check loading state here as it might not reset properly after upgrade
      if (user && !user.isAnonymous && !hasRedirected) {
        console.log('Redirecting after sign-in:', { 
          uid: user.uid, 
          email: user.email, 
          isAnonymous: user.isAnonymous,
          loading: loading 
        });
        
        // Reset signing in state when user is authenticated
        if (isSigningIn) {
          setIsSigningIn(false);
        }
        
        // Mark as redirected to prevent multiple redirects
        setHasRedirected(true);
        
        try {
          const pets = await getUserPets(user.uid);
          console.log('Found pets after sign-in:', pets.length);

          if (pets.length > 0) {
            // Use petId from URL if provided and valid, otherwise use first pet
            const petId = urlPetId && pets.find(p => p.id === urlPetId) ? urlPetId : pets[0].id;
            
            // Build the redirect URL
            let redirectUrl = `/chat?petId=${petId}`;
            if (urlConversationId) {
              redirectUrl += `&conversationId=${urlConversationId}`;
            }
            
            console.log('Redirecting to:', redirectUrl);
            // Use replace to avoid adding to history
            router.replace(redirectUrl);
          } else {
            router.replace('/onboarding');
          }
        } catch (err) {
          console.error('Error checking user pets:', err);
          router.replace('/onboarding');
        }
      }
    }

    // Check if we have a user (don't wait for loading to be false)
    if (user) {
      checkUserPets();
    }
  }, [user, loading, router, isSigningIn, hasRedirected, urlPetId, urlConversationId]);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setError(null);
      setHasRedirected(false); // Reset redirect flag when starting new sign-in

      // Check if user is anonymous
      if (isAnonymous() && user) {
        // Upgrade anonymous account to Google account
        const anonymousUserId = user.uid;
        await upgradeAnonymousAccount();
        
        // Migration is automatic because Firebase keeps the same UID when linking accounts
        // The user.uid stays the same, so all data is already linked
        // No need to migrate data - Firebase handles it automatically
        console.log('Anonymous account upgraded successfully');
        
        // Wait a moment for auth state to update, then force redirect
        setTimeout(async () => {
          const currentUser = auth.currentUser;
          if (currentUser && !currentUser.isAnonymous) {
            console.log('Force redirect after upgrade', { 
              uid: currentUser.uid, 
              isAnonymous: currentUser.isAnonymous,
              hasRedirected 
            });
            try {
              const pets = await getUserPets(currentUser.uid);
              console.log('Found pets in force redirect:', pets.length);
              
              if (pets.length > 0) {
                const petId = urlPetId && pets.find(p => p.id === urlPetId) ? urlPetId : pets[0].id;
                let redirectUrl = `/chat?petId=${petId}`;
                if (urlConversationId) {
                  redirectUrl += `&conversationId=${urlConversationId}`;
                }
                console.log('Force redirecting to:', redirectUrl);
                setHasRedirected(true);
                // Use window.location for more reliable redirect
                window.location.href = redirectUrl;
              } else {
                console.log('No pets found, redirecting to onboarding');
                setHasRedirected(true);
                window.location.href = '/onboarding';
              }
            } catch (err) {
              console.error('Error in force redirect:', err);
            }
          } else {
            console.log('Force redirect skipped:', { 
              hasUser: !!currentUser, 
              isAnonymous: currentUser?.isAnonymous 
            });
          }
        }, 1000);
      } else {
        // Regular sign in for new users
        await signInWithGoogle();
        
        // Wait a moment for auth state to update, then force redirect
        setTimeout(async () => {
          const currentUser = auth.currentUser;
          if (currentUser && !currentUser.isAnonymous) {
            console.log('Force redirect after sign-in', { 
              uid: currentUser.uid, 
              isAnonymous: currentUser.isAnonymous,
              hasRedirected 
            });
            try {
              const pets = await getUserPets(currentUser.uid);
              console.log('Found pets in force redirect:', pets.length);
              
              if (pets.length > 0) {
                const petId = urlPetId && pets.find(p => p.id === urlPetId) ? urlPetId : pets[0].id;
                let redirectUrl = `/chat?petId=${petId}`;
                if (urlConversationId) {
                  redirectUrl += `&conversationId=${urlConversationId}`;
                }
                console.log('Force redirecting to:', redirectUrl);
                setHasRedirected(true);
                // Use window.location for more reliable redirect
                window.location.href = redirectUrl;
              } else {
                console.log('No pets found, redirecting to onboarding');
                setHasRedirected(true);
                window.location.href = '/onboarding';
              }
            } catch (err) {
              console.error('Error in force redirect:', err);
            }
          } else {
            console.log('Force redirect skipped:', { 
              hasUser: !!currentUser, 
              isAnonymous: currentUser?.isAnonymous 
            });
          }
        }, 1000);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      
      // Handle specific Firebase errors
      if (err?.code === 'auth/credential-already-in-use') {
        setError('This Google account is already linked to another account. Please sign in with your existing account.');
      } else if (err?.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please sign in with your existing account.');
      } else {
        const errorMessage = err?.message || 'Failed to sign in. Please try again.';
        setError(errorMessage);
      }
      
      setIsSigningIn(false);
    }
  };

  // Show loading only if auth is loading and we're not signing in
  if (loading && !isSigningIn) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#073F6C] overflow-hidden">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4">
            <div className="spinner w-full h-full"></div>
          </div>
          <p className="text-white text-sm">Loading</p>
        </div>
      </div>
    );
  }

  // Don't show login page if user is authenticated and not anonymous
  // But allow showing if we're in the process of signing in
  if (user && !user.isAnonymous && !isSigningIn) {
    return null;
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#073F6C] px-4 sm:px-6 overflow-hidden">
      <div className="w-full max-w-md lg:max-w-lg">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="mb-8 flex justify-center">
            <img
              src="/logo.png"
              alt="LetsVet Logo"
              className="max-w-[280px] w-auto h-auto"
              style={{ maxWidth: '280px', height: 'auto' }}
            />
          </div>
          
          {/* Tagline */}
          <p className="text-white text-base leading-relaxed font-light">
            Instant AI guidance for your pet&apos;s health concerns
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#073F6C]">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-white/10 border border-white/20 rounded-xl fade-in">
              <div className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-white flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-white text-xs font-medium leading-relaxed">{error}</p>
              </div>
            </div>
          )}

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

          {/* Footer Text */}
          <p className="mt-8 text-center text-xs text-white/70 leading-relaxed">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-[#073F6C] overflow-hidden">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4">
            <div className="spinner w-full h-full"></div>
          </div>
          <p className="text-white text-sm">Loading</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
