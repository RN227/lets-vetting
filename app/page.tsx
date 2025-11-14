'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getUserPets } from '@/lib/services/pets';
import { Button, CircularProgress, Box, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

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
      <Box className="min-h-screen flex items-center justify-center bg-[#073F6C]">
        <Box className="text-center">
          <CircularProgress size={32} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="body2" sx={{ color: 'white' }}>
            Loading
          </Typography>
        </Box>
      </Box>
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
          <Box className="w-full space-y-3">
          {/* Primary Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={() => router.push('/onboarding/why')}
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
            }}
          >
            Get Started
          </Button>

          {/* Secondary Button */}
          <Button
            variant="outlined"
            fullWidth
            onClick={handleAlreadyHaveAccount}
            sx={{
              borderColor: 'white',
              borderWidth: 2,
              color: 'white',
              borderRadius: 3,
              py: 1.75,
              textTransform: 'uppercase',
              fontWeight: 700,
              fontSize: '0.875rem',
              '&:hover': {
                borderColor: 'white',
                borderWidth: 2,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            I Already Have an Account
          </Button>
          </Box>
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

          {/* Back Button */}
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setShowLogin(false)}
            sx={{
              mt: 2,
              borderColor: 'white',
              borderWidth: 2,
              color: 'white',
              borderRadius: 3,
              py: 1.75,
              textTransform: 'uppercase',
              fontWeight: 700,
              fontSize: '0.875rem',
              '&:hover': {
                borderColor: 'white',
                borderWidth: 2,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Back
          </Button>
          </div>
        )}
      </div>
    </main>
  );
}
