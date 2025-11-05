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
    // Option 1: Using service account key file (recommended for development)
    // If you have a service account JSON file, uncomment the following:
    // const serviceAccount = require('path/to/serviceAccountKey.json');
    // adminApp = initializeApp({
    //   credential: cert(serviceAccount),
    // });

    // Option 2: Using environment variable with service account JSON
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      );
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Option 3: Using default credentials (works in Google Cloud environments)
      // This will automatically use Application Default Credentials
      adminApp = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      throw new Error(
        'Firebase Admin initialization failed: Missing FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_PROJECT_ID environment variable'
      );
    }

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);

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
