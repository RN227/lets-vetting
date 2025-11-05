'use client';

import { useRequireAuth, AuthLoadingScreen } from '@/lib/hooks/useRequireAuth';

export default function ChatPage() {
  const auth = useRequireAuth();

  // Show loading screen while checking auth or redirecting
  if (!auth) {
    return <AuthLoadingScreen />;
  }

  const { user } = auth;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            💬 Chat
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Welcome to the chat page, {user.displayName || user.email}!
          </p>

          <div className="p-6 bg-blue-50 rounded-lg">
            <p className="text-gray-700">
              This is the chat page where you'll be able to:
            </p>
            <ul className="mt-4 space-y-2 text-gray-600 text-left max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Chat with AI about your pet's health</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Get instant health guidance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Track conversation history</span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <p className="text-gray-500 text-sm">
              Chat functionality coming soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
