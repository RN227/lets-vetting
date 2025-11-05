'use client';

import { useRouter } from 'next/navigation';
import { useRequireAuth, AuthLoadingScreen } from '@/lib/hooks/useRequireAuth';

export default function OnboardingPage() {
  const router = useRouter();
  const auth = useRequireAuth();

  // Show loading screen while checking auth or redirecting
  if (!auth) {
    return <AuthLoadingScreen />;
  }

  const { user } = auth;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            🎉 Welcome to LetsVet!
          </h1>
          <p className="text-gray-600 text-lg">
            Hello, {user.displayName || user.email}
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              What's Next?
            </h2>
            <p className="text-gray-600">
              This is the onboarding page. Here you'll be able to:
            </p>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Add your pets and their information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Set up health profiles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Get AI-powered health guidance</span>
              </li>
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
