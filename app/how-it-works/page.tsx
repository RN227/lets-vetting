'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';

function HowItWorksPageContent() {
  const router = useRouter();

  const handleContinue = () => {
    // Navigate to onboarding for new users
    router.push('/onboarding');
  };

  return (
    <div className="h-screen w-screen bg-[#073F6C] flex flex-col px-4 sm:px-6 pb-24 overflow-hidden">
      {/* Header with Logo */}
      <div className="pt-8 mb-10">
        <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-3xl font-bold text-white">
              How it Works
            </h1>
            <img
              src="/logo_notext.png"
              alt="LetsVet Logo"
              className="h-9 w-auto"
              style={{ height: '2.25rem' }}
            />
          </div>
        </div>
      </div>

      {/* Content Card - Centered Vertically */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl -mt-16 py-8">
          {/* Content Card */}
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md">
            {/* Bullet Points */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#073F6C] flex items-center justify-center mt-0.5">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <p className="text-lg text-[#073F6C] leading-relaxed pt-1">
                  Share your pet&apos;s symptoms
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#073F6C] flex items-center justify-center mt-0.5">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <p className="text-lg text-[#073F6C] leading-relaxed pt-1">
                  Get instant AI-powered insights
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#073F6C] flex items-center justify-center mt-0.5">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <p className="text-lg text-[#073F6C] leading-relaxed pt-1">
                  Decide on care with confidence
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Disclaimer - Above CTA */}
      <div className="fixed bottom-20 left-0 right-0 px-4 sm:px-6 z-10">
        <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-[10px] text-yellow-800 leading-tight">
                LetsVet provides educational information only, not medical diagnosis. Always consult a licensed veterinarian for professional advice. In emergencies, contact your vet immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button - Fixed to Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#073F6C] px-4 sm:px-6 py-4">
        <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
          <button
            onClick={handleContinue}
            className="w-full px-6 py-3 bg-white text-[#073F6C] rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 font-bold text-sm uppercase touch-target shadow-md"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-[#073F6C] flex items-center justify-center overflow-hidden">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <HowItWorksPageContent />
    </Suspense>
  );
}

