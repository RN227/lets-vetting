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
    console.log('🔐 Setting up auth state listener...');
    
    // Set up Firebase Auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const isAnon = user.isAnonymous;
        console.log('✅ Auth state: User signed in', {
          email: user.email,
          uid: user.uid,
          displayName: user.displayName,
          isAnonymous: isAnon,
        });
      } else {
        console.log('❌ Auth state: No user signed in');
      }
      
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔐 Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  // Sign in with Google using popup (more reliable than redirect)
  const signInWithGoogle = async () => {
    try {
      console.log('🔐 Starting Google sign-in with popup...');
      setLoading(true);
      
      const provider = new GoogleAuthProvider();
      
      // Add custom parameters
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Use popup instead of redirect for better reliability
      const result = await signInWithPopup(auth, provider);
      
      console.log('✅ Sign-in successful!', {
        email: result.user.email,
        uid: result.user.uid,
        displayName: result.user.displayName,
      });
      
      // User state will be updated by onAuthStateChanged listener
      // Don't manually set user here to avoid race conditions
    } catch (error: any) {
      console.error('❌ Error during Google sign-in:', error);
      
      // Provide helpful error messages
      if (error?.code === 'auth/popup-closed-by-user') {
        console.log('ℹ️ Sign-in cancelled by user');
      } else if (error?.code === 'auth/popup-blocked') {
        console.warn('⚠️ Popup was blocked. Please allow popups for this site.');
      } else if (error?.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
                 error?.message?.includes('blocked') ||
                 error?.code === 'auth/network-request-failed') {
        console.warn(
          '⚠️ Sign-in may be blocked by an ad blocker or privacy extension. ' +
          'Please whitelist this site or disable extensions for localhost.'
        );
      }
      
      setLoading(false);
      throw error;
    }
  };

  // Sign in anonymously
  const signInAnonymouslyUser = async () => {
    try {
      console.log('🔐 Starting anonymous sign-in...');
      setLoading(true);
      
      const result = await signInAnonymously(auth);
      
      console.log('✅ Anonymous sign-in successful!', {
        uid: result.user.uid,
        isAnonymous: result.user.isAnonymous,
      });
      
      // User state will be updated by onAuthStateChanged listener
    } catch (error: any) {
      console.error('❌ Error during anonymous sign-in:', error);
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

      console.log('🔐 Upgrading anonymous account to Google...');
      setLoading(true);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Link the Google credential to the anonymous account
      const credential = await linkWithPopup(auth.currentUser!, provider);
      
      console.log('✅ Account upgraded successfully!', {
        email: credential.user.email,
        uid: credential.user.uid,
        displayName: credential.user.displayName,
        isAnonymous: credential.user.isAnonymous,
      });

      // User state will be updated by onAuthStateChanged listener
    } catch (error: any) {
      console.error('❌ Error upgrading account:', error);
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
      console.error('Error signing out:', error);
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
