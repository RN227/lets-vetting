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

// Initialize Firebase app (singleton pattern)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Only initialize if Firebase hasn't been initialized yet
if (!getApps().length) {
  console.log('🔥 Initializing Firebase app...');
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('✅ Firebase initialized successfully');
} else {
  console.log('🔥 Using existing Firebase app');
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

// Export Firebase instances
export { app, auth, db };

// Export types for convenience
export type { Auth, Firestore };
