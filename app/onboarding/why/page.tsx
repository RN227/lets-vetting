'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, Box, Typography, Avatar } from '@mui/material';

function WhyUsPageContent() {
  const router = useRouter();

  const handleContinue = () => {
    // Navigate to how it works page
    router.push('/onboarding/how');
  };

  return (
    <div className="h-screen w-screen bg-[#073F6C] flex flex-col px-4 sm:px-6 pb-24 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="pt-3 mb-1">
        <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
            Why us?
          </h1>
        </div>
      </div>

      {/* Logo below header - 30% smaller than first screen */}
      <div className="flex justify-center mb-2">
        <img
          src="/logo.png"
          alt="LetsVet Logo"
          className="w-auto h-auto"
          style={{ maxWidth: '180px', height: 'auto' }}
        />
      </div>

      {/* Content Card - Centered Vertically */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl -mt-2 py-2">
          {/* Content Card */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              {/* Bullet Points */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: '#073F6C', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, mt: 0.5 }}>
                    1
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ color: '#073F6C', fontWeight: 600, mb: 0.5 }}>
                      Know what to do, fast
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(7, 63, 108, 0.7)', display: 'block' }}>
                      Stop googling symptoms at 2am. Get clear guidance in seconds, not hours.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: '#073F6C', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, mt: 0.5 }}>
                    2
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ color: '#073F6C', fontWeight: 600, mb: 0.5 }}>
                      Save unnecessary vet visits
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(7, 63, 108, 0.7)', display: 'block' }}>
                      Understand if it can wait for morning or needs attention now.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: '#073F6C', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, mt: 0.5 }}>
                    3
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ color: '#073F6C', fontWeight: 600, mb: 0.5 }}>
                      Peace of mind when you need it
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(7, 63, 108, 0.7)', display: 'block' }}>
                      Your pet can&apos;t tell you what&apos;s wrong - we help you figure it out.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Continue Button - Fixed to Bottom */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#073F6C', px: { xs: 2, sm: 3 }, py: 2 }}>
        <Box sx={{ maxWidth: { xs: '100%', lg: '768px', xl: '1024px' }, mx: 'auto' }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleContinue}
            sx={{
              bgcolor: 'white',
              color: '#073F6C',
              borderRadius: 3,
              py: 1.5,
              textTransform: 'uppercase',
              fontWeight: 700,
              fontSize: '0.875rem',
              '&:hover': {
                bgcolor: 'grey.50',
              },
            }}
          >
            Continue
          </Button>
        </Box>
      </Box>
    </div>
  );
}

export default function WhyUsPage() {
  return (
    <Suspense fallback={
      <Box className="h-screen w-screen bg-[#073F6C] flex items-center justify-center overflow-hidden">
        <Typography sx={{ color: 'white' }}>Loading...</Typography>
      </Box>
    }>
      <WhyUsPageContent />
    </Suspense>
  );
}

