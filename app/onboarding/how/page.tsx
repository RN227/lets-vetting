'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';

function HowItWorksPageContent() {
  const router = useRouter();

  const handleContinue = () => {
    // Navigate to add pet form
    router.push('/onboarding/pet');
  };

  return (
    <div className="h-screen w-screen bg-[#073F6C] flex flex-col px-4 sm:px-6 pb-24 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="pt-6 mb-3">
        <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-3">
            How It Works
          </h1>
        </div>
      </div>

      {/* Logo below header - 30% smaller than first screen */}
      <div className="flex justify-center mb-4">
        <img
          src="/logo.png"
          alt="LetsVet Logo"
          className="w-auto h-auto"
          style={{ maxWidth: '196px', height: 'auto' }}
        />
      </div>

      {/* Content Card - Centered Vertically */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl -mt-8 py-4">
          {/* Content Card */}
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md">
            {/* Bullet Points */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#073F6C] flex items-center justify-center mt-0.5">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div className="flex-1">
                  <p className="text-lg text-[#073F6C] font-semibold leading-relaxed">
                    Share your pet&apos;s symptoms
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#073F6C] flex items-center justify-center mt-0.5">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div className="flex-1">
                  <p className="text-lg text-[#073F6C] font-semibold leading-relaxed">
                    Get instant AI-powered insights
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#073F6C] flex items-center justify-center mt-0.5">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div className="flex-1">
                  <p className="text-lg text-[#073F6C] font-semibold leading-relaxed">
                    Decide on care with confidence
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Pet Button - Fixed to Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#073F6C] px-4 sm:px-6 py-4">
        <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
          <button
            onClick={handleContinue}
            className="w-full px-6 py-3 bg-white text-[#073F6C] rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 font-bold text-sm uppercase touch-target shadow-md"
          >
            Add pet
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

