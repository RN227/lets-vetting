import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK (singleton pattern)
let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;

/**
 * Initialize Firebase Admin SDK for server-side operations.
 * This should only be used in API routes and server components.
 *
 * Development Mode:
 * - Works without credentials for Firebase Emulator
 * - Set FIREBASE_AUTH_EMULATOR_HOST and FIRESTORE_EMULATOR_HOST to use emulator
 *
 * Production Mode:
 * - Requires FIREBASE_SERVICE_ACCOUNT_KEY (service account JSON string)
 * - OR provide just NEXT_PUBLIC_FIREBASE_PROJECT_ID for Cloud Run/App Engine
 */
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    // Return existing app if already initialized
    adminApp = getApps()[0];
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    return { adminApp, adminAuth, adminDb };
  }

  try {
    const isEmulator = process.env.FIREBASE_AUTH_EMULATOR_HOST ||
                       process.env.FIRESTORE_EMULATOR_HOST;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // Production: Use service account credentials
      console.log('Initializing Firebase Admin with service account...');
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      );
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } else if (isEmulator) {
      // Development: Use emulator (no credentials needed)
      console.log('Initializing Firebase Admin for emulator...');
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project';
      adminApp = initializeApp({
        projectId,
      });
      console.log(`Connected to Firebase Emulator (Project: ${projectId})`);
    } else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      // Cloud environment: Use Application Default Credentials
      console.log('Initializing Firebase Admin with default credentials...');
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      // Fallback: Initialize with minimal config (development only)
      console.warn(
        'Warning: Firebase Admin initialized without credentials. ' +
        'This is OK for development with emulator, but will fail in production. ' +
        'Set FIREBASE_SERVICE_ACCOUNT_KEY for production use.'
      );
      adminApp = initializeApp({
        projectId: 'demo-project',
      });
    }

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);

    // Connect to emulator if environment variables are set
    if (process.env.FIRESTORE_EMULATOR_HOST) {
      const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
      console.log(`Firestore connected to emulator at ${host}:${port}`);
    }

    if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      console.log(`Auth connected to emulator at ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
    }

    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }

  return { adminApp, adminAuth, adminDb };
}

// Initialize on module load
const { adminApp: app, adminAuth: auth, adminDb: db } = initializeFirebaseAdmin();

// Export Firebase Admin instances
export { app as adminApp, auth as adminAuth, db as adminDb };

// Export types for convenience
export type { Auth as AdminAuth, Firestore as AdminFirestore };
