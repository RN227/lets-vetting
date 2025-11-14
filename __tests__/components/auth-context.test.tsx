import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/lib/auth-context';
import { signInAnonymously, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  signInAnonymously: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    setCustomParameters: jest.fn(),
  })),
  linkWithPopup: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  auth: {},
}));

// Test component that uses auth
function TestComponent() {
  const { user, loading, signInAnonymously, signInWithGoogle, signOut, isAnonymous } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div data-testid="user">{user ? user.uid : 'No user'}</div>
      <div data-testid="is-anonymous">{isAnonymous() ? 'true' : 'false'}</div>
      <button onClick={signInAnonymously}>Sign In Anonymously</button>
      <button onClick={signInWithGoogle}>Sign In With Google</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide loading state initially', () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      // Don't call callback immediately to test loading state
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle anonymous sign-in', async () => {
    const mockUser = {
      uid: 'anonymous-user-id',
      isAnonymous: true,
      email: null,
    };

    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(null); // Initial state
      setTimeout(() => callback(mockUser as any), 0); // After sign-in
      return jest.fn();
    });

    (signInAnonymously as jest.Mock).mockResolvedValue({
      user: mockUser,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    const signInButton = screen.getByText('Sign In Anonymously');
    signInButton.click();

    await waitFor(() => {
      expect(signInAnonymously).toHaveBeenCalled();
    });
  });

  it('should handle Google sign-in', async () => {
    const mockUser = {
      uid: 'google-user-id',
      isAnonymous: false,
      email: 'test@example.com',
    };

    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(null);
      setTimeout(() => callback(mockUser as any), 0);
      return jest.fn();
    });

    (signInWithPopup as jest.Mock).mockResolvedValue({
      user: mockUser,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = screen.getByText('Sign In With Google');
    signInButton.click();

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
    });
  });

  it('should handle sign-out', async () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(null);
      return jest.fn();
    });

    (firebaseSignOut as jest.Mock).mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signOutButton = screen.getByText('Sign Out');
    signOutButton.click();

    await waitFor(() => {
      expect(firebaseSignOut).toHaveBeenCalled();
    });
  });

  it('should detect anonymous users', () => {
    const mockUser = {
      uid: 'anonymous-user-id',
      isAnonymous: true,
    };

    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(mockUser as any);
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('is-anonymous')).toHaveTextContent('true');
  });
});

