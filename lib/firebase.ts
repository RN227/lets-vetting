import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate required environment variables
// Note: We check the actual values directly (not dynamically) because Next.js
// only replaces static process.env.NEXT_PUBLIC_* references at build time
const missingEnvVars: string[] = [];

if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  missingEnvVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
}
if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) {
  missingEnvVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
}
if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  missingEnvVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
}
if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
  missingEnvVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
}
if (!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) {
  missingEnvVars.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
}
if (!process.env.NEXT_PUBLIC_FIREBASE_APP_ID) {
  missingEnvVars.push('NEXT_PUBLIC_FIREBASE_APP_ID');
}

if (missingEnvVars.length > 0) {
  console.warn(
    `⚠️ Warning: Missing Firebase environment variables: ${missingEnvVars.join(', ')}`
  );
}

// Log Firebase configuration (without sensitive data)
console.log('🔥 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey,
  hasAppId: !!firebaseConfig.appId,
});

// Initialize Firebase app (singleton pattern) - lazy initialization
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Check if we're in build time (Vercel sets VERCEL_ENV during deployment)
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                     (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV && !process.env.VERCEL_URL);

// Lazy initialization function
function getFirebaseApp(): FirebaseApp {
  if (!app) {
    if (!getApps().length) {
      // Only initialize if we have required config
      if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        // During build time, env vars might not be available
        // Use placeholder values to allow build to complete
        if (isBuildTime && typeof window === 'undefined') {
          console.warn('⚠️ Firebase config missing during build - using placeholder (this is OK)');
          // Create placeholder app to allow build to complete
          app = initializeApp({
            projectId: 'lets-vet-build-placeholder',
            apiKey: 'AIzaSyBuildPlaceholderKeyForBuildOnly',
            authDomain: 'lets-vet-build-placeholder.firebaseapp.com',
            storageBucket: 'lets-vet-build-placeholder.appspot.com',
            messagingSenderId: '123456789',
            appId: '1:123456789:web:build-placeholder',
          }, 'build-placeholder');
          console.log('⚠️ Firebase initialized with placeholder config (build only)');
          return app;
        }
        // Not build time - throw normally
        throw new Error('Firebase not configured. Environment variables are required.');
      }
      
      console.log('🔥 Initializing Firebase app...');
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized successfully');
    } else {
      console.log('🔥 Using existing Firebase app');
      app = getApps()[0];
    }
  }
  return app;
}

function getFirebaseAuth(): Auth {
  if (!auth) {
    const appInstance = getFirebaseApp();
    auth = getAuth(appInstance);
  }
  return auth;
}

function getFirebaseDb(): Firestore {
  if (!db) {
    const appInstance = getFirebaseApp();
    db = getFirestore(appInstance);
  }
  return db;
}

// Export getter functions that lazily initialize
export { getFirebaseApp as getApp, getFirebaseAuth as getAuth, getFirebaseDb as getDb };

// Export instances - wrap in try-catch to handle build time gracefully
// During build, if env vars aren't available, we'll use placeholder values
let exportedApp: FirebaseApp;
let exportedAuth: Auth;
let exportedDb: Firestore;

try {
  exportedApp = getFirebaseApp();
  exportedAuth = getFirebaseAuth();
  exportedDb = getFirebaseDb();
} catch (error) {
  // During build time, if Firebase initialization fails, use placeholder
  // This allows the build to complete, but Firebase won't work until env vars are set
  if (isBuildTime && typeof window === 'undefined') {
    console.warn('⚠️ Firebase initialization failed during build - using placeholder (this is OK)');
    try {
      // Create placeholder app to allow build to complete
      exportedApp = initializeApp({
        projectId: 'lets-vet-build-placeholder',
        apiKey: 'AIzaSyBuildPlaceholderKeyForBuildOnly',
        authDomain: 'lets-vet-build-placeholder.firebaseapp.com',
        storageBucket: 'lets-vet-build-placeholder.appspot.com',
        messagingSenderId: '123456789',
        appId: '1:123456789:web:build-placeholder',
      }, 'build-placeholder');
      exportedAuth = getAuth(exportedApp);
      exportedDb = getFirestore(exportedApp);
      console.log('⚠️ Using placeholder Firebase config for build');
    } catch (placeholderError) {
      // If placeholder also fails, re-throw original error
      console.error('Failed to create placeholder Firebase app:', placeholderError);
      throw error;
    }
  } else {
    // Not build time - re-throw the error
    throw error;
  }
}

export const app = exportedApp;
export const auth = exportedAuth;
export const db = exportedDb;

// Export types for convenience
export type { Auth, Firestore };
