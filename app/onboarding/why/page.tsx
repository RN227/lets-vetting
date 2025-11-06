'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';

function WhyUsPageContent() {
  const router = useRouter();

  const handleContinue = () => {
    // Navigate to how it works page
    router.push('/onboarding/how');
  };

  return (
    <div className="h-screen w-screen bg-[#073F6C] flex flex-col px-4 sm:px-6 pb-24 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="pt-4 mb-2">
        <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Why us?
          </h1>
        </div>
      </div>

      {/* Logo below header - 30% smaller than first screen */}
      <div className="flex justify-center mb-3">
        <img
          src="/logo.png"
          alt="LetsVet Logo"
          className="w-auto h-auto"
          style={{ maxWidth: '160px', height: 'auto' }}
        />
      </div>

      {/* Content Card - Centered Vertically */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl -mt-4 py-2">
          {/* Content Card */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
            {/* Bullet Points */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#073F6C] flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div className="flex-1">
                  <p className="text-base text-[#073F6C] font-semibold leading-relaxed">
                    Know what to do, fast
                  </p>
                  <p className="text-xs text-[#073F6C]/70 leading-relaxed mt-1">
                    Stop googling symptoms at 2am. Get clear guidance in seconds, not hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#073F6C] flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div className="flex-1">
                  <p className="text-base text-[#073F6C] font-semibold leading-relaxed">
                    Save unnecessary vet visits
                  </p>
                  <p className="text-xs text-[#073F6C]/70 leading-relaxed mt-1">
                    Understand if it can wait for morning or needs attention now.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#073F6C] flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div className="flex-1">
                  <p className="text-base text-[#073F6C] font-semibold leading-relaxed">
                    Peace of mind when you need it
                  </p>
                  <p className="text-xs text-[#073F6C]/70 leading-relaxed mt-1">
                    Your pet can&apos;t tell you what&apos;s wrong - we help you figure it out.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Disclaimer - Above CTA */}
      <div className="fixed bottom-20 left-0 right-0 px-4 sm:px-6 z-10">
        <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5"
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
              <p className="text-[9px] text-yellow-800 leading-tight">
                LetsVet provides educational information, not veterinary diagnosis. Always consult your vet for medical advice.
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

export default function WhyUsPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-[#073F6C] flex items-center justify-center overflow-hidden">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <WhyUsPageContent />
    </Suspense>
  );
}

