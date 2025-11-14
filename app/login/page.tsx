'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getUserPets } from '@/lib/services/pets';
import { auth } from '@/lib/firebase';
import { Button, CircularProgress, Box, Typography, Alert } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

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
        // Reset signing in state when user is authenticated
        if (isSigningIn) {
          setIsSigningIn(false);
        }
        
        // Mark as redirected to prevent multiple redirects
        setHasRedirected(true);
        
        try {
          const pets = await getUserPets(user.uid);

          if (pets.length > 0) {
            // Use petId from URL if provided and valid, otherwise use first pet
            const petId = urlPetId && pets.find(p => p.id === urlPetId) ? urlPetId : pets[0].id;
            
            // Build the redirect URL
            let redirectUrl = `/chat?petId=${petId}`;
            if (urlConversationId) {
              redirectUrl += `&conversationId=${urlConversationId}`;
            }
            
            // Use replace to avoid adding to history
            router.replace(redirectUrl);
          } else {
            router.replace('/onboarding');
          }
        } catch (err) {
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
        
        // Wait a moment for auth state to update, then force redirect
        setTimeout(async () => {
          const currentUser = auth.currentUser;
          if (currentUser && !currentUser.isAnonymous) {
            try {
              const pets = await getUserPets(currentUser.uid);
              
              if (pets.length > 0) {
                const petId = urlPetId && pets.find(p => p.id === urlPetId) ? urlPetId : pets[0].id;
                let redirectUrl = `/chat?petId=${petId}`;
                if (urlConversationId) {
                  redirectUrl += `&conversationId=${urlConversationId}`;
                }
                setHasRedirected(true);
                // Use window.location for more reliable redirect
                window.location.href = redirectUrl;
              } else {
                setHasRedirected(true);
                window.location.href = '/onboarding';
              }
            } catch (err) {
              // Silently handle redirect errors
            }
          }
        }, 1000);
      } else {
        // Regular sign in for new users
        await signInWithGoogle();
        
        // Wait a moment for auth state to update, then force redirect
        setTimeout(async () => {
          const currentUser = auth.currentUser;
          if (currentUser && !currentUser.isAnonymous) {
            try {
              const pets = await getUserPets(currentUser.uid);
              
              if (pets.length > 0) {
                const petId = urlPetId && pets.find(p => p.id === urlPetId) ? urlPetId : pets[0].id;
                let redirectUrl = `/chat?petId=${petId}`;
                if (urlConversationId) {
                  redirectUrl += `&conversationId=${urlConversationId}`;
                }
                setHasRedirected(true);
                // Use window.location for more reliable redirect
                window.location.href = redirectUrl;
              } else {
                setHasRedirected(true);
                window.location.href = '/onboarding';
              }
            } catch (err) {
              // Silently handle redirect errors
            }
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
      <Box className="h-screen w-screen flex items-center justify-center bg-[#073F6C] overflow-hidden">
        <Box className="text-center">
          <CircularProgress size={32} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="body2" sx={{ color: 'white' }}>
            Loading
          </Typography>
        </Box>
      </Box>
    );
  }

  // Don't show login page if user is authenticated and not anonymous
  // But allow showing if we're in the process of signing in
  if (user && !user.isAnonymous && !isSigningIn) {
    return null;
  }

  return (
    <Box className="h-screen w-screen flex items-center justify-center bg-[#073F6C] px-4 sm:px-6 overflow-hidden">
      <Box className="w-full max-w-md lg:max-w-lg">
        {/* Logo */}
        <Box className="text-center mb-12">
          <Box className="mb-8 flex justify-center">
            <img
              src="/logo.png"
              alt="LetsVet Logo"
              className="max-w-[280px] w-auto h-auto"
              style={{ maxWidth: '280px', height: 'auto' }}
            />
          </Box>
          
          {/* Tagline */}
          <Typography variant="body1" sx={{ color: 'white', fontWeight: 300 }}>
            Instant AI guidance for your pet&apos;s health concerns
          </Typography>
        </Box>

        {/* Card */}
        <Box className="bg-[#073F6C]">
          {/* Error Message */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '& .MuiAlert-icon': {
                  color: 'white',
                },
                '& .MuiAlert-message': {
                  color: 'white',
                  fontSize: '0.75rem',
                },
              }}
            >
              {error}
            </Alert>
          )}

          {/* Google Sign In Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleSignIn}
            disabled={isSigningIn}
            startIcon={isSigningIn ? <CircularProgress size={16} sx={{ color: '#073F6C' }} /> : <GoogleIcon />}
            sx={{
              bgcolor: 'white',
              color: '#073F6C',
              borderRadius: 3,
              py: 1.75,
              textTransform: 'uppercase',
              fontWeight: 700,
              fontSize: '0.875rem',
              '&:hover': {
                bgcolor: 'grey.50',
              },
              '&.Mui-disabled': {
                bgcolor: 'white',
                opacity: 0.5,
              },
            }}
          >
            {isSigningIn ? 'Signing In' : 'Continue with Google'}
          </Button>

          {/* Footer Text */}
          <Typography variant="caption" sx={{ mt: 2, textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', display: 'block' }}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Box className="h-screen w-screen flex items-center justify-center bg-[#073F6C] overflow-hidden">
        <Box className="text-center">
          <CircularProgress size={32} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="body2" sx={{ color: 'white' }}>
            Loading
          </Typography>
        </Box>
      </Box>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
