/**
 * Examples of how to use the useRequireAuth hook
 *
 * This file demonstrates different patterns for protecting routes
 * Remove this file in production
 */

'use client';

import { useRequireAuth, AuthLoadingScreen } from './useRequireAuth';

// ============================================================================
// EXAMPLE 1: Basic Protected Page
// ============================================================================

export function BasicProtectedPage() {
  const auth = useRequireAuth();

  // Show loading screen while checking auth or redirecting
  if (!auth) {
    return <AuthLoadingScreen />;
  }

  const { user } = auth;

  return (
    <div>
      <h1>Welcome, {user.displayName || user.email}!</h1>
      <p>This page is protected - only authenticated users can see this.</p>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Protected Page with Custom Loading
// ============================================================================

export function ProtectedPageWithCustomLoading() {
  const auth = useRequireAuth();

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  }

  const { user } = auth;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>User: {user.email}</p>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Protected Page with User Data
// ============================================================================

export function ProtectedPageWithUserData() {
  const auth = useRequireAuth();

  if (!auth) {
    return <AuthLoadingScreen />;
  }

  const { user } = auth;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      <div className="space-y-2">
        <p><strong>Name:</strong> {user.displayName || 'Not set'}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>User ID:</strong> {user.uid}</p>

        {user.photoURL && (
          <div>
            <strong>Photo:</strong>
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-16 h-16 rounded-full mt-2"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Full Page Pattern (Recommended)
// ============================================================================

/**
 * This is the recommended pattern for protected pages:
 *
 * 1. Use useRequireAuth() at the top
 * 2. Return AuthLoadingScreen if not authenticated
 * 3. Destructure user from auth
 * 4. Use user in your component
 */

export function RecommendedPattern() {
  const auth = useRequireAuth();

  if (!auth) {
    return <AuthLoadingScreen />;
  }

  const { user } = auth;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">My Protected Page</h1>
          <p className="text-gray-600">Welcome back, {user.displayName}!</p>
        </header>

        <main>
          {/* Your protected content here */}
          <p>This content is only visible to authenticated users.</p>
        </main>
      </div>
    </div>
  );
}
