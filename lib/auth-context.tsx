'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInAnonymously,
  linkWithPopup,
} from 'firebase/auth';
import { auth } from './firebase';

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  upgradeAnonymousAccount: () => Promise<void>;
  signOut: () => Promise<void>;
  isAnonymous: () => boolean;
}

// Create the context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component that wraps the app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up Firebase Auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Sign in with Google using popup (more reliable than redirect)
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      const provider = new GoogleAuthProvider();
      
      // Add custom parameters
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Use popup instead of redirect for better reliability
      await signInWithPopup(auth, provider);
      
      // User state will be updated by onAuthStateChanged listener
      // Don't manually set user here to avoid race conditions
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  // Sign in anonymously
  const signInAnonymouslyUser = async () => {
    try {
      setLoading(true);
      
      await signInAnonymously(auth);
      
      // User state will be updated by onAuthStateChanged listener
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  // Upgrade anonymous account to permanent Google account
  const upgradeAnonymousAccount = async () => {
    try {
      if (!user || !user.isAnonymous) {
        throw new Error('No anonymous user to upgrade');
      }

      setLoading(true);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Link the Google credential to the anonymous account
      await linkWithPopup(auth.currentUser!, provider);

      // User state will be updated by onAuthStateChanged listener
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  // Check if current user is anonymous
  const isAnonymous = (): boolean => {
    return user?.isAnonymous ?? false;
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      // User state will be updated by onAuthStateChanged listener
      // Don't set loading to false here - let onAuthStateChanged handle it
    } catch (error) {
      setLoading(false); // Only set to false on error
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signInAnonymously: signInAnonymouslyUser,
    upgradeAnonymousAccount,
    signOut,
    isAnonymous,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
