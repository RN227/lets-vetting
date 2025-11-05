'use client';

import { useAuth } from '@/lib/auth-context';

/**
 * Example component demonstrating how to use the auth context
 * Remove this file in production
 */
export function AuthExample() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Loading authentication...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="mb-4 text-gray-700">You are not signed in.</p>
        <button
          onClick={signInWithGoogle}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <div className="mb-4">
        <p className="text-gray-700 mb-2">
          <strong>Signed in as:</strong> {user.displayName || 'No name'}
        </p>
        <p className="text-gray-600 text-sm">{user.email}</p>
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-12 h-12 rounded-full mt-2"
          />
        )}
      </div>
      <button
        onClick={signOut}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Sign Out
      </button>
    </div>
  );
}
